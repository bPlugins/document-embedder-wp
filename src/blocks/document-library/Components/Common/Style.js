import {
  getBorderBoxCSS,
  getBoxCSS,
  getTypoCSS,
} from "../../../../../../bpl-tools/utils/getCSS";
import { defaultValues, normalizeKeys } from "../../../../DocumentLibrary/Utils/options";

const Style = ({ settingsData: rawSettingsData, id }) => {
  const settingsData = normalizeKeys(rawSettingsData, defaultValues.settings);
  const { styles, header: settingsHeader, documentLibrary } = settingsData;
  const { toolbarBox, documentBox, docsViewPerRow } = documentLibrary;
  const {
    isDisplayToolbar,
    isDisplayFilterType,
    isDisplaySearchBox,
    isDisplaySortBy,
  } = toolbarBox;
  const { downloadButton, viewButton, options } = documentBox;
  const { displayIcon, displaySize, displayDate } = options;
  const { header } = styles;

  const blockWrapper = `#${id}`;
  const fullContainer = `${blockWrapper} .bplDl-container`;
  const topHeader = `${fullContainer} .bplDl-header`;
  const headerTitle = `${topHeader} .bplDl-title`;
  const headerDescription = `${topHeader} .bplDl-subtitle`;

  const content = `${fullContainer} .bplDl-content`;
  const toolbar = `${content} .bplDl-toolbar`;
  const searchBox = `${toolbar} .bplDl-search`;
  const searchType = `${toolbar} .bplDl-select`;
  const sortType = `${toolbar} .bplDl-select-sort`;

  const documentGrid = `${content} .bplDl-grid`;
  const docBox = `${documentGrid} .bplDl-card`;
  const fileNameEl = `${docBox} .bplDl-name`;
  const fileSizeEl = `${docBox} .bplDl-size`;
  const fileDateEl = `${docBox} .bplDl-meta`;
  const fileIcon = `${docBox} .bplDl-card-top svg`;

  const downloadBtnEl = `${docBox} .bplDl-actions .bplDl-btn.bplDl-download-btn`;
  const viewBtnEl = `${docBox} .bplDl-actions .bplDl-btn.bplDl-view-btn`;
  

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          ${getTypoCSS("", header?.title.typo)?.googleFontLink}
          ${getTypoCSS("", header?.description.typo)?.googleFontLink}
          ${getTypoCSS(`${headerTitle}`, header?.title.typo).styles}
          ${getTypoCSS(`${headerDescription}`, header?.description.typo).styles}

          ${topHeader} {
            display: ${settingsHeader.isDisplayHeader ? "block" : "none"};
            background: ${header.bgColor};
            text-align: ${settingsHeader.textAlign};
          }
          ${headerTitle} {
            color: ${header.title.color};  
          }
          ${headerDescription} {
            color: ${header.description.color};  
          }
          ${content} {
            background: ${documentLibrary.bgColor};
            padding: ${getBoxCSS(documentLibrary?.padding)};
          }
          ${toolbar} {
            ${isDisplayToolbar ? "" : "display: none"};
            padding: ${getBoxCSS(toolbarBox?.padding)};
            background: ${toolbarBox?.bgColor};
          }
          ${searchBox} {
            ${isDisplaySearchBox ? "" : "display: none"};
          }
          ${searchType} {
            ${isDisplayFilterType ? "" : "display: none"};
          }
          ${sortType} {
            ${isDisplaySortBy ? "" : "display: none"};
          }
          ${documentGrid} {
            grid-template-columns: repeat(${docsViewPerRow},  minmax(0, 1fr));
            gap: ${documentLibrary?.rowGap}px;
          }
          ${docBox} {
            background: ${documentBox.bgColor.normal};
            padding: ${getBoxCSS(documentBox?.padding)};
            ${getBorderBoxCSS(documentBox?.border?.normal)};
            border-radius: ${documentBox?.borderRadius}px;
          }
          ${docBox}:hover  {
            background: ${documentBox.bgColor.hover};
            ${getBorderBoxCSS(documentBox?.border?.hover)};
          }
          ${fileIcon} {
            ${displayIcon ? "" : "display: none"};
            color: ${documentBox.iconColor.normal};
          }
          ${fileNameEl} {
            color: ${documentBox.fileNameColor.normal};
          }
          ${fileSizeEl} {
            ${displaySize ? "" : "display: none"};
            color: ${documentBox.sizeColor.normal};
          }
          ${fileDateEl} {
            ${displayDate ? "" : "display: none"};
            color: ${documentBox.dateColor.normal};
          }
          ${docBox}:hover .bplDl-card-top svg{
            color: ${documentBox.iconColor.hover};
          }
          ${docBox}:hover .bplDl-name {
            color: ${documentBox.fileNameColor.hover};
          }
          ${docBox}:hover .bplDl-size {
            color: ${documentBox.sizeColor.hover};
          }
          ${docBox}:hover .bplDl-meta {
            color: ${documentBox.dateColor.hover};
          }
          ${downloadBtnEl} {
            ${downloadButton.isDisplay ? "" : "display: none"};
            color: ${downloadButton.textColor.normal};
            background: ${downloadButton.bgColor.normal};
          }
          ${downloadBtnEl}:hover {
            color: ${downloadButton.textColor.hover};
            background: ${downloadButton.bgColor.hover};
          }
          ${downloadBtnEl}>span {
            ${downloadButton.isText ? "" : "display: none"};
          }
          ${viewBtnEl} {
            ${viewButton.isDisplay ? "" : "display: none"};
            color: ${viewButton.textColor.normal};
            background: ${viewButton.bgColor.normal};
          }
          ${viewBtnEl}:hover {
            color: ${viewButton.textColor.hover};
            background: ${viewButton.bgColor.hover};
          }
          ${viewBtnEl}>span {
            ${viewButton.isText ? "" : "display: none"};
          }
            
          
          `.replace(/\s+/g, " "),
        }}
      />
    </>
  );
};

export default Style;
