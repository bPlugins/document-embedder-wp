import React, { useEffect, useState } from "react";
import "./AllFeedback.scss";
import SettingsHeader from "../Components/Pages/SettingsHeader";
import { defaultValues } from "../Utils/options";
import { ColorIcon, Delete, Edit, PluginIcon, Settings } from "../Utils/icons";
import FloatingBulkActions from "../Components/FloatingBulkAction/FloatingBulkActions";
import DeleteModal from "../Components/Shared/DeleteModal/DeleteModal";
import _get from "lodash/get";
import _set from "lodash/set";
import _cloneDeep from "lodash/cloneDeep";
import BplProModal from "../Components/Shared/ProModal/BplProModal";
import DocumentLibrary from "../../src/blocks/document-library/Components/Common/DocumentLibrary";
import Styles from "./TabContent/Styles";
import General from "./TabContent/General";

const AllContainer = ({ isPremium }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [view, setView] = useState("list");
  const [list, setList] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...defaultValues });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState([]);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { settings } = formData;
  const { header, documentLibrary } = settings;

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

  const openProModal = () => {
    setIsProModalOpen(true);
  };

  const loadList = () => {
    fetch(
      `${window.bpldeSettings.ajaxUrl}?action=bplde_get_all&nonce=${window.bpldeSettings.nonce}`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const formatted = {};
          res.data.forEach((item) => {
            formatted[item.id] = {
              title: item.title,
              created: item.created,
              ...item.settings,
            };
          });
          setList(formatted);
        }
      });
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleAddOrEdit = (id = null) => {
    if (id) {
      const url = new URL(window.location);
      url.searchParams.set("id", id);
      window.history.replaceState(null, "", url);

      fetch(
        `${window.bpldeSettings.ajaxUrl}?action=bplde_get_single&nonce=${window.bpldeSettings.nonce}&id=${id}`
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            const formatted = {
              title: res.data.title,
              settings: res.data.settings,
            };
            setFormData(formatted);
            setEditingId(id);
            setView("create");
          }
        });
    } else {
      const url = new URL(window.location);
      url.searchParams.delete("id");
      window.history.replaceState(null, "", url);

      setFormData(_cloneDeep(defaultValues));
      setEditingId(null);
      setView("create");
    }
  };

  const handleSave = () => {
    setIsSaving(true);

    const payload = new FormData();
    payload.append("action", "bplde_save_document_library");
    payload.append("nonce", window.bpldeSettings.nonce);
    payload.append("id", editingId || "");
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
          loadList();
          setTimeout(() => setIsSaved(false), 2000);

          if (!editingId) {
            setEditingId(res.data.id);
            const url = new URL(window.location);
            url.searchParams.set("id", res.data.id);
            window.history.replaceState(null, "", url);
          }
        } else {
          alert("Save failed: " + (res.data?.message || "Unknown error"));
        }
      });
  };

  const handleDelete = (id) => {
    setDeletingIds([id]);
    setIsBulkDelete(false);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    setDeletingIds(Array.from(selectedItems));
    setIsBulkDelete(true);
    setShowDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (deletingIds.length === 0) return;

    for (const id of deletingIds) {
      const payload = new FormData();
      payload.append("action", "bplde_delete_document_library");
      payload.append("nonce", window.bpldeSettings.nonce);
      payload.append("id", id);

      try {
        const res = await fetch(window.bpldeSettings.ajaxUrl, {
          method: "POST",
          body: payload,
        });

        const json = await res.json();
        if (!json.success) {
          alert(`Delete failed for ID ${id}: ${json.message}`);
        }
      } catch (err) {
        alert(`Delete failed for ID ${id}: ${err.message}`);
      }
    }
    // Refresh list and cleanup
    loadList();
    if (isBulkDelete) {
      setSelectedItems(new Set());
    }
    setDeletingIds([]);
    setIsBulkDelete(false);
    setShowDeleteConfirm(false);
  };

  const handleBackToList = () => {
    const url = new URL(window.location);
    url.searchParams.delete("id");
    window.history.replaceState(null, "", url);

    setView("list");
    setEditingId(null);
    // Deep copy defaultValues to fully reset nested state
    setFormData(_cloneDeep(defaultValues));
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

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    const allIds = Object.keys(list);
    if (selectedItems.size === allIds.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allIds));
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const onFormDataUpdate = (path, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      _set(updated, path, value);
      return updated;
    });
  };

  

  if (view === "create") {
    return (
      <>
        <SettingsHeader
          onBackClick={handleBackToList}
          onSave={handleSave}
          titleText={_get(formData, "title")}
          onChange={(e) => onFormDataUpdate("title", e.target.value)}
          saveButtonText={isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
          isSaving={isSaving}
          editingId={editingId}
          handleCopyShortcode={handleCopyShortcode}
          copiedId={copiedId}
          title={
            editingId ? "Edit Document Library" : "Add New Document Library"
          }
        />

        <div className="bplde-settings-content">
          <div className="bplde-settings">

            <div className="bplde-settings-tab">
              {allTabs.map((tab) => {
                return (
                  <>
                    <button
                      type="button"
                    key={tab.value}
                    className={`tab-btn ${
                      activeTab === tab.value ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.value)}
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
                            className={`tab-btn child ${
                              activeTab === child.value ? "active" : ""
                            }`}
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

          <div className="bplde-preview">
            <div className="preview-content" id="live-preview-1">
              <DocumentLibrary
                postId={editingId}
                isAdmin={true}
                settingsData={formData.settings}
                id="live-preview-1"
              />
            </div>
          </div>
        </div>


        {/*  <Footer /> */}

        <BplProModal
          onClose={() => setIsProModalOpen(false)}
          isProModalOpen={isProModalOpen}
        />
      </>
    );
  }

  return (
    <>

      <div className="bplde-nav">
        <div className="bplde-nav-left">

          <div className="plugin-name">
                <span>
                    <PluginIcon />
                </span>
                <h1>Document Library</h1>
          </div>

          
          <div className="bplde-add-new-btn" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button className="add-new-btn" onClick={() => handleAddOrEdit(null)}>
              + Add New Library
            </button>
          </div>

        </div>

        <div className="bplde-nav-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button className="upgrade-btn" >
            <a
              href={`${window.bpldeSettings.adminUrl}edit.php?post_type=ppt_viewer&page=bplde-dashboard#/pricing`}
              target="_blank"
              rel="noreferrer"
            >
              Upgrade to Pro
            </a>
              Upgrade To Pro
          </button>
          
        </div>
        
      </div>

      <div className="vfd-content">
        {/* <div className="vfd-card-header">
          <h2>Your Document Librarys</h2>
          <p>Manage your saved Document Librarys below.</p>
        </div> */}

        {Object.keys(list).length === 0 ? (
          <div className="vfd-empty-state">
            <h2>No Document Librarys Found</h2>
            <p>Click below to add your first one.</p>
            <button onClick={() => handleAddOrEdit(null)}>+ Add New</button>
          </div>
        ) : (
          <div className="vfd-table-container">
            <table className="vfd-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === Object.keys(list).length &&
                        Object.keys(list).length > 0
                      }
                      onChange={toggleSelectAll}
                      className="vfd-checkbox"
                    />
                  </th>
                  <th>ID</th>
                  <th>Title</th>
                  <th className="shortcode-col">Shortcode</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(list).map(([id, settings]) => (
                  <tr key={id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.has(id)}
                        onChange={() => toggleSelection(id)}
                        className="vfd-checkbox"
                      />
                    </td>
                    <td>{id}</td>
                    <td>{settings.title || "Untitled"}</td>
                    <td>
                      <div className="copy-shortcode">
                        <span>{`[document_library id="${id}"]`}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyShortcode(id)}
                        >
                          {copiedId === id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td>{settings.created || "N/A"}</td>
                    <td className="vfd-actions">
                      <button
                        className="vfd-btn edit"
                        onClick={() => handleAddOrEdit(id)}
                      >
                        <Edit />
                        Edit
                      </button>
                      <button
                        className="vfd-btn delete"
                        onClick={() => handleDelete(id)}
                      >
                        <Delete />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FloatingBulkActions
        selectedCount={selectedItems.size}
        totalCount={Object.keys(list).length}
        onSelectAll={toggleSelectAll}
        onDelete={handleBulkDelete}
        onClear={clearSelection}
      />

      {showDeleteConfirm && (
        <DeleteModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletingIds([]);
            setIsBulkDelete(false);
          }}
          onConfirm={confirmBulkDelete}
          selectedCount={deletingIds.length}
        />
      )}

      {/* <Footer /> */}
    </>
  );
};

export default AllContainer;
