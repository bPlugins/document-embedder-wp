import { useEffect, useRef, useState } from "react";
import "./AllFeedback.scss";

import { defaultValues, getTemplate, normalizeKeys } from "../Utils/options";

import BplProModal from "../Components/Shared/ProModal/BplProModal";

import _get from "lodash/get";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import EditorHeader from "../Components/Top/EditorHeader";
import SettingsPanel from "./Settings";
import PreviewPanel from "./Preview";
import Toast from "../Components/Shared/Toast/Toast";
import TabStrip, { getLibraryTabs } from './TabStrip';
import TitleBar from './TitleBar';
import TemplatePicker, { getTemplateMeta } from "../Components/TemplatePicker/TemplatePicker";

const AddNewLibrary = ({ isPremium }) => {
  const [showToast, setShowToast] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const postId = Number(window.bpldeSettings.postId || 0);
  const isEdit = postId > 0;


  const [formData, setFormData] = useState(_cloneDeep(defaultValues));
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalContent, setProModalContent] = useState(null);


  // The layout picker opens by itself only for a new library. Existing ones,
  // including every library saved before layouts existed, open straight into
  // the editor on the layout they already have.
  const [picker, setPicker] = useState(isEdit ? null : "new");
  const layoutButtonRef = useRef(null);
  const template = getTemplate(formData.settings);
  const templateMeta = getTemplateMeta();

  // Callers without arguments (the upload limit) keep the modal's own wording.
  const openProModal = (content) => {
    setProModalContent(content && content.message ? content : null);
    setIsProModalOpen(true);
  };

  // Table and Folder show in the picker but are Pro only.
  const openLockedTemplate = (locked) => {
    openProModal({
      message: `The ${templateMeta[locked].name} layout is available in the Pro version.`,
      highlight: {
        title: "Table and Folder layouts",
        text: "Sortable tables and folder navigation for large libraries",
      },
    });
  };

  const closePicker = () => {
    setPicker(null);
    setTimeout(() => layoutButtonRef.current?.focus(), 0);
  };

  const chooseTemplate = (next) => {
    onFormDataUpdate("settings.template", next);
    closePicker();
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
            settings: normalizeKeys(res.data.settings, defaultValues.settings),
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

  const tabs = getLibraryTabs(template);
  const [activeSettings, setActiveSettings] = useState(tabs[0].value);

  // Switching layout can remove the open tab (List Rows when leaving List).
  useEffect(() => {
    if (!tabs.some((t) => t.value === activeSettings)) setActiveSettings(tabs[0].value);
  }, [template]);

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

      <TitleBar
        title={_get(formData, 'title')}
        onChange={(e) => onFormDataUpdate('title', e.target.value)}
        layoutName={templateMeta[template].name}
        onChangeLayout={() => setPicker("change")}
        layoutButtonRef={layoutButtonRef}
      />

      <main className="editor-main">
        {/* Two panels side by side, as the document editor has it: the
            configuration box and the live preview are separate things. */}
        <section className="bpldl-panel bpldl-panel--settings">
          <header className="bpldl-panel__head">
            <h2>Library Configuration</h2>
          </header>

          <div className="bpldl-panel__body">
            <TabStrip
              tabs={tabs}
              active={activeSettings}
              onChange={setActiveSettings}
              counts={{ uploadItems: _get(formData, 'settings.documentLibrary.docItems', []).length }}
            />

            <div className="left-panel">
              <SettingsPanel
                formData={formData}
                onFormDataUpdate={onFormDataUpdate}
                isPremium={isPremium}
                openProModal={openProModal}
                activeSettings={activeSettings}
                template={template}
              />
            </div>
          </div>
        </section>

        <section className="bpldl-panel bpldl-panel--preview">
          <div className="right-panel">
            <PreviewPanel
              postId={postId}
              formData={formData}
            />
          </div>
        </section>
      </main>

      <TemplatePicker
        open={picker !== null}
        mode={picker || "new"}
        current={template}
        onConfirm={chooseTemplate}
        onClose={closePicker}
        onLocked={openLockedTemplate}
      />

      <BplProModal
        isProModalOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        message={proModalContent?.message}
        highlight={proModalContent?.highlight}
      />
    </>
  );
};

export default AddNewLibrary;
