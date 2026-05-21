import DocumentLibrary from "../../blocks/document-library/Components/Common/DocumentLibrary"
import { SeeLive } from "../Utils/icons"



const PreviewPanel = ({postId, formData}) => {
  return <>
    <div className="live-preview">
      {/* Header */}
      <div className="preview-header">
        <div className="icon-box">
          <SeeLive />
        </div>

        <h2>Live Preview</h2>

        <span className="preview-badge">Frontend view</span>
      </div>

      {/* Content */}
      <div className="preview-content">
        <div className="bplde-preview">
          <div className="preview-content" id="live-preview-1">
            <DocumentLibrary
              postId={postId}
              isAdmin={true}
              settingsData={formData.settings}
              id="live-preview-1"
            />
          </div>
        </div>
      </div>
    </div>
  </>
}

export default PreviewPanel;