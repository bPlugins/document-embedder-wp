import { useState } from "react";
import "./UploadedDocumentsTable.scss";
import SectionTitle from "../../Components/Shared/Shared/SectionTitle";
import { Library } from "lucide-react";
import { Delete, Edit } from "../../Utils/icons";

const UploadedDocumentsTable = ({ formData, onFormDataUpdate }) => {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // "single" or "bulk"
  const [deleteIndex, setDeleteIndex] = useState(null);

  const docs = formData.settings.documentLibrary?.docItems || [];

  // Toggle individual checkbox
  const handleCheckboxChange = (index) => {
    if (selectedDocs.includes(index)) {
      setSelectedDocs(selectedDocs.filter((i) => i !== index));
    } else {
      setSelectedDocs([...selectedDocs, index]);
    }
  };

  // Toggle all checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedDocs(docs.map((_, i) => i));
    } else {
      setSelectedDocs([]);
    }
  };

  // Start editing
  const handleEdit = (index, currentTitle) => {
    setEditingIndex(index);
    setEditTitle(currentTitle);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingIndex(null);
    setEditTitle("");
  };

  // Update document title
  const handleUpdate = (index) => {
    const updatedDocs = docs.map((doc, i) =>
      i === index ? { ...doc, title: editTitle } : doc
    );
    onFormDataUpdate("settings.documentLibrary.docItems", updatedDocs);
    setEditingIndex(null);
    setEditTitle("");
  };

  // Delete confirm open
  const openDeleteConfirm = (type, index = null) => {
    setDeleteTarget(type);
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    let updatedDocs = docs;

    if (deleteTarget === "single" && deleteIndex !== null) {
      updatedDocs = docs.filter((_, i) => i !== deleteIndex);
    }

    if (deleteTarget === "bulk") {
      updatedDocs = docs.filter((_, i) => !selectedDocs.includes(i));
      setSelectedDocs([]);
    }

    onFormDataUpdate("settings.documentLibrary.docItems", updatedDocs);
    setShowConfirm(false);
    setDeleteTarget(null);
    setDeleteIndex(null);
  };

  return (
    <>
      <SectionTitle title="Your Uploaded Documents" icon={<Library />} />
      <div className="documents-table">
        {docs.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedDocs.length === docs.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Title</th>
                  <th style={{ width: "140px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>

                    {/* Editable Title */}
                    <td>
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span onClick={() => handleEdit(index, doc.title)}>
                          {doc.title.length > 25
                            ? doc.title.substring(0, 25) + "..."
                            : doc.title}
                        </span>
                      )}
                    </td>

                    <td>
                      {editingIndex === index ? (
                        <>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="action-btn edit"
                              onClick={() => handleUpdate(index)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="row-actions">
                            <button
                              type="button"
                                className="action-btn edit"
                              onClick={() => handleEdit(index, doc.title)}
                              >
                                <span><Edit/></span>
                              Edit
                            </button>
                            <button
                              type="button"
                                className="action-btn delete"
                              onClick={() => openDeleteConfirm("single", index)}
                              >
                                <span><Delete /></span>
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedDocs.length > 0 && (
              <div className="bulk-actions">
                <button
                  type="button"
                  className="delete action-btn"
                  onClick={() => openDeleteConfirm("bulk")}
                >
                  Delete Selected ({selectedDocs.length})
                </button>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showConfirm && (
              <div className="confirm-modal">
                <div className="confirm-content">
                  <p>
                    {deleteTarget === "bulk"
                      ? `Are you sure you want to delete ${selectedDocs.length} documents?`
                      : "Are you sure you want to delete this document?"}
                  </p>
                  <div className="confirm-actions">
                    <button type="button" className="confirm-btn" onClick={handleConfirmDelete}>
                      Yes, Delete
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ textAlign: "center", fontSize: "20px" }}>
            No documents uploaded yet.
          </p>
        )}
      </div>
    </>
  );
};

export default UploadedDocumentsTable;
