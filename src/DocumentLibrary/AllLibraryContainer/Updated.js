import { useEffect, useState } from "react";
import "./AllFeedback.scss";

import { defaultValues } from "../Utils/options";

import BplProModal from "../Components/Shared/ProModal/BplProModal";

import _get from "lodash/get";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import EditorHeader from "../Components/Top/EditorHeader";
import SettingsPanel from "./Settings";
import PreviewPanel from "./Preview";
import Toast from "../Components/Shared/Toast/Toast";

const AddNewLibrary = ({ isPremium }) => {
  const [showToast, setShowToast] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const postId = Number(window.bpldeSettings.postId || 0);
  const isEdit = postId > 0;


  const [formData, setFormData] = useState(_cloneDeep(defaultValues));
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);


  const openProModal = () => {
    setIsProModalOpen(true);
  };

  /**
   * Load data when EDITING
   */
  useEffect(() => {
    if (!isEdit) return;

    fetch(
      `${window.bpldeSettings.ajaxUrl}?action=bplde_get_single&nonce=${window.bpldeSettings.nonce}&id=${postId}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setFormData({
            title: res.data.title,
            settings: res.data.settings,
          });
        }
      });
  }, [isEdit, postId]);

  /**
   * Save handler (Create and Update)
   */
  const handleSave = () => {
    setIsSaving(true);
    const payload = new FormData();
    payload.append("action", "bplde_save_document_library");
    payload.append("nonce", window.bpldeSettings.nonce);
    payload.append("id", postId || "");
    payload.append("title", formData.title || "");
    payload.append("settings", JSON.stringify(formData.settings || {}));

    fetch(window.bpldeSettings.ajaxUrl, {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((res) => {
        setIsSaving(false);

        if (res.success) {
          setShowToast(true);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);

          // If created for first time → redirect WP-style
          if (!isEdit && res.data?.id) {
            window.location.href = `post.php?post=${res.data.id}&action=edit`;
          }
        } else {
          alert(res.data?.message || "Save failed");
        }
      });
  };

  /**
   * Update nested state
   */
  const onFormDataUpdate = (path, value) => {
    setFormData((prev) => {
      const updated = _cloneDeep(prev);
      _set(updated, path, value);
      return updated;
    });
  };

  const handleCopyShortcode = async (id) => {
    const shortcode = `[document_library id="${id}"]`;

    try {
      await navigator.clipboard.writeText(shortcode);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = shortcode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };


  return (
    <>
      <Toast show={showToast} onClose={() => setShowToast(false)} />
      <EditorHeader
        title={isEdit ? "Edit Document Library" : "Add New Document Library"}
        titleText={_get(formData, "title")}
        onChange={(e) => onFormDataUpdate("title", e.target.value)}
        onSave={handleSave}
        saveButtonText={isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
        isSaving={isSaving}
        editingId={postId}
        copiedId={copiedId}
        handleCopyShortcode={handleCopyShortcode}
      />

      <main className="editor-main">
        <div className="left-panel">
          <SettingsPanel
            formData={formData}
            onFormDataUpdate={onFormDataUpdate}
            isPremium={isPremium}
            openProModal={openProModal}
          />
        </div>

        <div className="right-panel">
          <PreviewPanel
            postId={postId}
            formData={formData}
          />
        </div>
      </main>


      <BplProModal
        isProModalOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </>
  );
};

export default AddNewLibrary;
