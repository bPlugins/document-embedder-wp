import React, { useEffect, useState } from "react";
import "./AllFeedback.scss";

import SettingsHeader from "../Components/Pages/SettingsHeader";
import { defaultValues, normalizeKeys } from "../Utils/options";
import { ColorIcon, Settings } from "../Utils/icons";

import BplProModal from "../Components/Shared/ProModal/BplProModal";
import DocumentLibrary from "../../src/blocks/document-library/Components/Common/DocumentLibrary";
import Styles from "./TabContent/Styles";
import General from "./TabContent/General";

import _get from "lodash/get";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import SettingsSection from "../Components/Layout/SettingsSection";
import PreviewSection from "../Components/Layout/PreviewSection";
import Footer from "../Components/Pages/Footer";

const AddNewLibrary = ({ isPremium }) => {
  const postId = Number(window.bpldeSettings.postId || 0);
  const isEdit = postId > 0;

  const [formData, setFormData] = useState(_cloneDeep(defaultValues));
  const [activeTab, setActiveTab] = useState("general-uploadDoc");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const { settings } = formData;
  const { header, documentLibrary } = settings;


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
            settings: normalizeKeys(res.data.settings, defaultValues.settings),
          });
        }
      });
  }, [isEdit, postId]);

  /**
   * Save handler (Create + Update)
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
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);

          // 🔥 If created for first time → redirect WP-style
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

  const allTabs = [
    {
      label: "General Settings",
      value: "general",
      icon: <Settings />,
      child: [
        {
          label: "Upload Items",
          value: "general-uploadDoc",
        },
        {
          label: "Options",
          value: "general-docLibrary",
        },
        header.isDisplayHeader
          ? {
            label: "Header",
            value: "general-header",
          }
          : null,
        documentLibrary.toolbarBox.isDisplayToolbar && header.isDisplayHeader
          ? {
            label: "Toolbar Box",
            value: "general-toolbarBox"
          }
          : null,
        {
          label: "Document Box",
          value: "general-docBox"
        },
      ].filter(Boolean),
    },
    {
      label: "Styles",
      value: "styles",
      icon: <ColorIcon />,
      child: [
        {
          label: "Library Container",
          value: "styles-docLibrary"
        },
        header.isDisplayHeader
          ? {
            label: "Header",
            value: "styles-header"
          }
          : null,
        documentLibrary.toolbarBox.isDisplayToolbar
          ? {
            label: "Toolbar Box",
            value: "styles-toolbarBox"
          }
          : null,
        {
          label: "Document Box",
          value: "styles-docBox"
        },
      ].filter(Boolean)
    },
  ];


  return (
    <>
      <SettingsHeader
        title={isEdit ? "Edit Document Library" : "Add New Document Library"}
        titleText={_get(formData, "title")}
        onChange={(e) => onFormDataUpdate("title", e.target.value)}
        onSave={handleSave}
        saveButtonText={isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
        isSaving={isSaving}
        editingId={postId}
      />

      <div className="bplde-settings-content">
        <SettingsSection>
          <div className="bplde-settings">
            <div className="bplde-settings-tab">
              {allTabs.map((tab) => {
                return (
                  <>
                    <button
                      type="button"
                      key={tab.value}
                      className={`tab-btn head`}
                      onClick={() => setActiveTab(tab.child[0].value)}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>

                    {
                      tab.child && tab.child.map((child) => {
                        return (
                          <button
                            type="button"
                            key={child.value}
                            className={`tab-btn child ${activeTab === child.value ? "active" : ""}`}
                            onClick={() => setActiveTab(child.value)}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </button>
                        );
                      })
                    }

                  </>
                );
              })}
            </div>

            <div className="bplde-settings-tab-content">

              {activeTab.startsWith("general") && (
                <General
                  formData={formData}
                  onFormDataUpdate={onFormDataUpdate}
                  isPremium={isPremium}
                  openProModal={openProModal}
                  activeSettings={activeTab}
                />
              )}

              {activeTab.startsWith("styles") && (
                <Styles
                  formData={formData}
                  onFormDataUpdate={onFormDataUpdate}
                  activeSettings={activeTab}
                />
              )}

            </div>
          </div>

          {/* <div className="bplde-preview">
            <div className="preview-content" id="live-preview-1">
              <DocumentLibrary
                postId={postId}
                isAdmin={true}
                settingsData={formData.settings}
                id="live-preview-1"
              />
            </div>
          </div> */}
        </SettingsSection>

        <PreviewSection>
          <div className="preview-content" id="live-preview-1">
            <div className="preview-content" id="live-preview-1">
              <DocumentLibrary
                postId={postId}
                isAdmin={true}
                settingsData={formData.settings}
                id="live-preview-1"
              />
            </div>
          </div>
        </PreviewSection>
      </div>

      <Footer />

      <BplProModal
        isProModalOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </>
  );
};

export default AddNewLibrary;
