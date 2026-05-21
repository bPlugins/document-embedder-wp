import { useEffect, useState } from "react";
import { useBlockProps } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { SelectControl } from "@wordpress/components";

import { tabController } from "../../../../../../bpl-tools/utils/functions";
import DocumentLibrary from "../Common/DocumentLibrary";
import Settings from "./Settings/Settings";

const Edit = ({ attributes, setAttributes, clientId, isSelected }) => {
  const { selectedPostId } = attributes;
  const [formData, setFormData] = useState(null);

  const id = `bplDocumentLibrary-${clientId}`;

  // Fetch all document_library posts
  const posts = useSelect(
    (select) =>
      select("core").getEntityRecords("postType", "document_library", {
        per_page: -1,
        status: "publish",
      }),
    []
  );
  

  // Fetch single post data when selectedPostId changes
  useEffect(() => {
    if (!selectedPostId) return;

    setFormData(null); // reset previous data while loading
    fetch(
      `${window.bpldlData.ajax_url}?action=bplde_get_single&nonce=${window.bpldlData.nonce}&id=${selectedPostId}`
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
  }, [selectedPostId]);

  // Tab controller for block selection
  useEffect(() => tabController(), [isSelected]);

  return (
    <>
      {/* Settings Panel */}
      <Settings attributes={attributes} setAttributes={setAttributes} />

      <div {...useBlockProps()} id={id}>
        {/* Post Select Dropdown */}
        <SelectControl
          label="Select a Post"
          value={selectedPostId}
          options={[
            { label: "Select a post", value: "" },
            ...(posts?.map((post) => ({
              label: post.title?.rendered || "Not Found",
              value: post.id,
            })) || []),
          ]}
          onChange={(newVal) =>
            setAttributes({ selectedPostId: parseInt(newVal) })
          }
        />

        {/* Conditional Rendering */}
        {!selectedPostId ? (
          <p>Please select a post to display the document library.</p>
        ) : !formData ? (
          <p style={{ textAlign: "center", margin: "20px 0", color: "black" }}>
            Loading...
          </p>
        ) : (
          <DocumentLibrary
            postId={selectedPostId}
            settingsData={formData?.settings}
            id={id}
          />
        )}
      </div>
    </>
  );
};

export default Edit;
