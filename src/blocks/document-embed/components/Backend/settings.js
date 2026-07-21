import { InspectorControls } from "@wordpress/block-editor";
import { Panel } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import DocumentSource from "./DocumentSource";
import ViewerFeatures from "./ViewerFeatures";
import Toolbar from "./Toolbar";
import DisplayDimension from "./DisplayDimension";
import SecurityRestriction from "./SecurityRestriction";
import DownloadManagement from "./DownloadManagement";
import Lightbox from "./Lightbox";
import Performance from "./Performance";

const Settings = ({ attributes, setAttributes }) => {
  
  return (
    <>
      <InspectorControls> 
        <Panel>
          <DocumentSource attributes={attributes} setAttributes={setAttributes} />
          <ViewerFeatures attributes={attributes} setAttributes={setAttributes} />
          <Toolbar attributes={attributes} setAttributes={setAttributes} />
          <DisplayDimension attributes={attributes} setAttributes={setAttributes} />
          <SecurityRestriction attributes={attributes} setAttributes={setAttributes}/>
          <Lightbox attributes={attributes} setAttributes={setAttributes}/>
          <DownloadManagement attributes={attributes} setAttributes={setAttributes}/>
          <Performance attributes={attributes} setAttributes={setAttributes}/>
        </Panel>

      </InspectorControls>
      
      
    </>
  );
};

export default Settings;
