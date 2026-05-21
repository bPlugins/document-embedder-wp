import React from "react";
import DocumentLibrary from "../Common/DocumentLibrary";

const FrontendDocLibrary = ({ attributes, id }) => {
  const { selectedPostId } = attributes;

  if (!attributes) {
    return <div>No document library found.</div>;
  }

  return (
    <DocumentLibrary
      settingsData={attributes}
      postId={selectedPostId}
      id={id}
    />
  );
};

export default FrontendDocLibrary;
