import ToggleControl from "../../Fields/ToggleControl/ToggleControl";
import Text from "../../Fields/Text/Text";

import _get from "lodash/get";
import UploadDocuments from "./UploadDocuments";
import Alignment from "../../Fields/Alignment/Alignment";
import UploadedDocumentsTable from "./UploadedDocumentsTable";
import ContentHeader from "../../Components/Shared/Shared/ContentHeader";
import OptionToggle from "./Shared/OptionsToggle";
import { HeaderIcon, RangeControlIcon, ToolbarIcon } from "../../Utils/icons";
import SegmentTabs from "../../Fields/SegmentTabs/SegmentTabs";
import { useState } from "react";
import Typography from "../../Fields/Typography/Typography";
import Color from "../../Fields/Color/Color";
import Colors from "../../Fields/Colors/Colors";
import RangeControl from "../../Fields/RangeControl/RangeControl";
import BoxControl from "../../Fields/BoxControl/BoxControl";
import DynamicTab from "../../Fields/DynamicTab/DynamicTab";
import Border from "../../Fields/Border/Border";

const General = ({ formData, onFormDataUpdate, isPremium, openProModal, activeSettings }) => {
  const [activeHeaderTab, setActiveHeaderTab] = useState("general");
  const [activeDocumentBoxTab, setActiveDocumentBoxTab] = useState("visibility-options");
  const [activeToolbarTab, setActiveToolbarTab] = useState("visibility-options");
  

  const headerTabs = [
    { id: "general", label: "General" },
    { id: "styles", label: "Styles" },
  ]
  const documentBoxTabs = [
    { id: "visibility-options", label: "Visibility Options" },
    { id: "styles", label: "Styles" },
  ]
  const toolbarTabs = [
    { id: "visibility-options", label: "Visibility Options" },
    { id: "styles", label: "Styles" },
  ]

  const tabs = [
    {
      label: "Normal",
      content: (
        <div>
          <Color
            isHeader={true}
            title="Background Color"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.bgColor.normal"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.bgColor.normal",
                val
              )
            }
          />

          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displayIcon"
          ) && (
              <Color
                isHeader={true}
                title="Icon Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.iconColor.normal"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.iconColor.normal",
                    val
                  )
                }
              />
            )}
          <Color
            isHeader={true}
            title="File Title Color"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.fileNameColor.normal"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.fileNameColor.normal",
                val
              )
            }
          />

          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displaySize"
          ) && (
              <Color
                isHeader={true}
                title="File Size Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.sizeColor.normal"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.sizeColor.normal",
                    val
                  )
                }
              />
            )}

          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displayDate"
          ) && (
              <Color
                isHeader={true}
                title="Date Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.dateColor.normal"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.dateColor.normal",
                    val
                  )
                }
              />
            )}

          <Border
            title="Box Border"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.border.normal"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.border.normal",
                val
              )
            }
          />
        </div>
      ),
    },
    {
      label: "Hover",
      content: (
        <div>
          <Color
            isHeader={true}
            title="Background Color"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.bgColor.hover"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.bgColor.hover",
                val
              )
            }
          />
          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displayIcon"
          ) && (
              <Color
                isHeader={true}
                title="Icon Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.iconColor.hover"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.iconColor.hover",
                    val
                  )
                }
              />
            )}

          <Color
            isHeader={true}
            title="File Title Color"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.fileNameColor.hover"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.fileNameColor.hover",
                val
              )
            }
          />
          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displaySize"
          ) && (
              <Color
                isHeader={true}
                title="File Size Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.sizeColor.hover"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.sizeColor.hover",
                    val
                  )
                }
              />
            )}
          {_get(
            formData,
            "settings.documentLibrary.documentBox.options.displayDate"
          ) && (
              <Color
                isHeader={true}
                title="Date Color"
                value={_get(
                  formData,
                  "settings.documentLibrary.documentBox.dateColor.hover"
                )}
                onChange={(val) =>
                  onFormDataUpdate(
                    "settings.documentLibrary.documentBox.dateColor.hover",
                    val
                  )
                }
              />
            )}
          <Border
            title="Box Border"
            value={_get(
              formData,
              "settings.documentLibrary.documentBox.border.hover"
            )}
            onChange={(val) =>
              onFormDataUpdate(
                "settings.documentLibrary.documentBox.border.hover",
                val
              )
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="vfd-main-settings">
        {activeSettings === "options" && (
          <>
            <ContentHeader title="Document Library Settings" />
            <ToggleControl
              value={_get(formData, "settings.header.isDisplayHeader")}
              onChange={(val) =>
                onFormDataUpdate("settings.header.isDisplayHeader", val)
              }
              title="Show Header"
              onText="Turn off to hide header"
              offText="Turn on to hide header"
            />
            <ToggleControl
              value={_get(
                formData,
                "settings.documentLibrary.toolbarBox.isDisplayToolbar"
              )}
              onChange={(val) =>
                onFormDataUpdate(
                  "settings.documentLibrary.toolbarBox.isDisplayToolbar",
                  val
                )
              }
              title="Display Toolbar Box"
              onText="Turn off to hide Toolbar Box"
              offText="Turn on to hide Toolbar Box"
            />
          </>
        )}

        {activeSettings === "uploadItems" && (
          <>
            <UploadDocuments
              formData={formData}
              onFormDataUpdate={onFormDataUpdate}
              isPremium={isPremium}
              openProModal={openProModal}
            />

            <UploadedDocumentsTable
              formData={formData}
              onFormDataUpdate={onFormDataUpdate}
            />
          </>
        )}

        {activeSettings === "header" && (
          <>
            <OptionToggle
              title="Header"
              description="Enable to show the document library header"
              value={_get(formData, "settings.header.isDisplayHeader")}
              onChange={(val) =>
                onFormDataUpdate("settings.header.isDisplayHeader", val)
              }
              icon={<HeaderIcon />}
            />

            {
              !formData.settings.header.isDisplayHeader ? (
                <>
                  <div className="disabled-section-content">
                    <span><HeaderIcon /></span>
                    <h3>Header is disabled</h3>
                    <p>Enable the toggle above to configure header settings</p>
                  </div>
                </>
              ) : <>
                <SegmentTabs
                  tabs={headerTabs}
                  activeTab={activeHeaderTab}
                  onChange={setActiveHeaderTab}
                />
                {
                  activeHeaderTab == "general" && (
                    <>
                      <Alignment
                        value={_get(formData, "settings.header.textAlign")}
                        onChange={(val) =>
                          onFormDataUpdate("settings.header.textAlign", val)
                        }
                        title="Header Text Align"
                        positions={[
                          { label: "Left", value: "left" },
                          { label: "Center", value: "center" },
                          { label: "Right", value: "right" },
                        ]}
                      />

                      <Text
                        value={_get(formData, "settings.header.title")}
                        onChange={(val) => onFormDataUpdate("settings.header.title", val)}
                        title="Header Title"
                        help="Enter header title"
                      />

                      <Text
                        value={_get(formData, "settings.header.description")}
                        onChange={(val) => onFormDataUpdate("settings.header.description", val)}
                        title="Header Description"
                        help="Enter header description"
                      />
                    </>
                  )
                }

                {
                  activeHeaderTab == "styles" && (
                    <>
                      <Color
                        isHeader={true}
                        title="Background Color"
                        value={_get(formData, "settings.styles.header.bgColor")}
                        onChange={(val) =>
                          onFormDataUpdate("settings.styles.header.bgColor", val)
                        }
                      />
                      <Color
                        isHeader={true}
                        title="Title Color"
                        value={_get(formData, "settings.styles.header.title.color")}
                        onChange={(val) =>
                          onFormDataUpdate("settings.styles.header.title.color", val)
                        }
                      />

                      <Typography
                        title="Title Typography"
                        value={_get(formData, "settings.styles.header.title.typo")}
                        onChange={(val) =>
                          onFormDataUpdate("settings.styles.header.title.typo", val)
                        }
                      />


                      <Color
                        isHeader={true}
                        title="Description Color"
                        value={_get(
                          formData,
                          "settings.styles.header.description.color"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.styles.header.description.color",
                            val
                          )
                        }
                      />

                      <Typography
                        title="Description Typography"
                        value={_get(
                          formData,
                          "settings.styles.header.description.typo"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.styles.header.description.typo",
                            val
                          )
                        }
                      />
                    </>
                  )
                }

              </>
            }
          </>
        )}

        {activeSettings === "toolbarBox" && (
          <>
            <OptionToggle
              title="Toolbar Box"
              description="Enable to show the document library toolbar box"
              value={_get(formData, "settings.documentLibrary.toolbarBox.isDisplayToolbar")}
              onChange={(val) =>
                onFormDataUpdate("settings.documentLibrary.toolbarBox.isDisplayToolbar", val)
              }
              icon={<ToolbarIcon />}
            />

            {
              !formData.settings.documentLibrary.toolbarBox.isDisplayToolbar ? (
                <>
                  <div className="disabled-section-content">
                    <span><ToolbarIcon /></span>
                    <h3>Toolbar Box is disabled</h3>
                    <p>Enable the toggle above to configure toolbar settings</p>
                  </div>
                </>
              ) : (
                <>
                  <SegmentTabs
                    tabs={toolbarTabs}
                    activeTab={activeToolbarTab}
                    onChange={setActiveToolbarTab}
                  />
                  {
                    activeToolbarTab == "visibility-options" && (
                      <>
                        <ToggleControl
                          value={_get(
                            formData,
                            "settings.documentLibrary.toolbarBox.isDisplaySearchBox"
                          )}
                          onChange={(val) =>
                            onFormDataUpdate(
                              "settings.documentLibrary.toolbarBox.isDisplaySearchBox",
                              val
                            )
                          }
                          title="Display Search Box"
                          onText="Turn off to hide Search Box"
                          offText="Turn on to hide Search Box"
                        />

                        <ToggleControl
                          value={_get(
                            formData,
                            "settings.documentLibrary.toolbarBox.isDisplayFilterType"
                          )}
                          onChange={(val) =>
                            onFormDataUpdate(
                              "settings.documentLibrary.toolbarBox.isDisplayFilterType",
                              val
                            )
                          }
                          title="Display Type Filter Box"
                          onText="Turn off to hide Type Filter Box"
                          offText="Turn on to hide Type Filter Box"
                        />

                        <ToggleControl
                          value={_get(
                            formData,
                            "settings.documentLibrary.toolbarBox.isDisplaySortBy"
                          )}
                          onChange={(val) =>
                            onFormDataUpdate(
                              "settings.documentLibrary.toolbarBox.isDisplaySortBy",
                              val
                            )
                          }
                          title="Display Sort By"
                          onText="Turn off to hide Sort By"
                          offText="Turn on to hide Sort By"
                        />
                      </>
                    )
                  }

                  {
                    activeToolbarTab == "styles" && (
                      <>
                        <Color
                          isHeader={true}
                          title="Background Color"
                          value={_get(
                            formData,
                            "settings.documentLibrary.toolbarBox.bgColor"
                          )}
                          onChange={(val) =>
                            onFormDataUpdate(
                              "settings.documentLibrary.toolbarBox.bgColor",
                              val
                            )
                          }
                        />
                        <BoxControl
                          title="Full Toolbar Box Padding"
                          name="Padding"
                          value={_get(
                            formData,
                            "settings.documentLibrary.toolbarBox.padding"
                          )}
                          onChange={(val) =>
                            onFormDataUpdate(
                              "settings.documentLibrary.toolbarBox.padding",
                              val
                            )
                          }
                        />
                      </>
                    )
                  }
                </>
              )
            }
          </>
        )}

        {activeSettings === "documentBox" && (
          <>
            <SegmentTabs
              tabs={documentBoxTabs}
              activeTab={activeDocumentBoxTab}
              onChange={setActiveDocumentBoxTab}
            />
            {activeDocumentBoxTab === "visibility-options" && (
              <>
                <ToggleControl
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.options.displayIcon"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.options.displayIcon",
                      val
                    )
                  }
                  title="Display Icon"
                  onText="Turn off to hide Icon"
                  offText="Turn on to hide Icon"
                />

                <ToggleControl
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.options.displaySize"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.options.displaySize",
                      val
                    )
                  }
                  title="Display Size"
                  onText="Turn off to hide Size"
                  offText="Turn on to hide Size"
                />

                <ToggleControl
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.options.displayDate"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.options.displayDate",
                      val
                    )
                  }
                  title="Display Date"
                  onText="Turn off to hide Date"
                  offText="Turn on to hide Date"
                />

                {_get(
                  formData,
                  "settings.documentLibrary.documentBox.deleteButton.isDisplay"
                ) && (
                    <>
                      <ToggleControl
                        value={_get(
                          formData,
                          "settings.documentLibrary.documentBox.deleteButton.isText"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.documentLibrary.documentBox.deleteButton.isText",
                            val
                          )
                        }
                        title="Display Text"
                        onText="Turn off to hide Display Text"
                        offText="Turn on to hide Display Text"
                      />

                      {_get(
                        formData,
                        "settings.documentLibrary.documentBox.deleteButton.isText"
                      ) && (
                          <Text
                            value={_get(
                              formData,
                              "settings.documentLibrary.documentBox.deleteButton.text"
                            )}
                            onChange={(val) =>
                              onFormDataUpdate(
                                "settings.documentLibrary.documentBox.deleteButton.text",
                                val
                              )
                            }
                            title="Delete Button Text"
                            help="Enter delete button text"
                          />
                        )}
                    </>
                  )}

                <ContentHeader title="Download Button" />

                <ToggleControl
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.downloadButton.isDisplay"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.downloadButton.isDisplay",
                      val
                    )
                  }
                  title="Download Button"
                  onText="Turn off to hide Download Button"
                  offText="Turn on to hide Download Button"
                />

                {_get(
                  formData,
                  "settings.documentLibrary.documentBox.downloadButton.isDisplay"
                ) && (
                    <>
                      <ToggleControl
                        value={_get(
                          formData,
                          "settings.documentLibrary.documentBox.downloadButton.isText"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.documentLibrary.documentBox.downloadButton.isText",
                            val
                          )
                        }
                        title="Display Text"
                        onText="Turn off to hide Display Text"
                        offText="Turn on to hide Display Text"
                      />

                      {_get(
                        formData,
                        "settings.documentLibrary.documentBox.downloadButton.isText"
                      ) && (
                          <Text
                            value={_get(
                              formData,
                              "settings.documentLibrary.documentBox.downloadButton.text"
                            )}
                            onChange={(val) =>
                              onFormDataUpdate(
                                "settings.documentLibrary.documentBox.downloadButton.text",
                                val
                              )
                            }
                            title="Download Button Text"
                            help="Enter download button text"
                          />
                        )}
                    </>
                  )}

                <ContentHeader title="View Button" />

                <ToggleControl
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.viewButton.isDisplay"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.viewButton.isDisplay",
                      val
                    )
                  }
                  title="Display View Button"
                  onText="Turn off to hide View Button"
                  offText="Turn on to hide View Button"
                />

                {_get(
                  formData,
                  "settings.documentLibrary.documentBox.viewButton.isDisplay"
                ) && (
                    <>
                      <ToggleControl
                        value={_get(
                          formData,
                          "settings.documentLibrary.documentBox.viewButton.isText"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.documentLibrary.documentBox.viewButton.isText",
                            val
                          )
                        }
                        title="Display View Button Text"
                        onText="Turn off to hide View Button Text"
                        offText="Turn on to hide View Button Text"
                      />

                      {_get(
                        formData,
                        "settings.documentLibrary.documentBox.viewButton.isText"
                      ) && (
                          <Text
                            value={_get(
                              formData,
                              "settings.documentLibrary.documentBox.viewButton.text"
                            )}
                            onChange={(val) =>
                              onFormDataUpdate(
                                "settings.documentLibrary.documentBox.viewButton.text",
                                val
                              )
                            }
                            title="View Button Text"
                            help="Enter view button text"
                          />
                        )}
                    </>
                  )}
              </>
            )}
            {activeDocumentBoxTab === "styles" && (
              <>
                <DynamicTab tabs={tabs} />

                <BoxControl
                  title="Document Box Padding"
                  name="Padding"
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.padding"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.padding",
                      val
                    )
                  }
                />

                <RangeControl
                  title="Box Border Radius"
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.borderRadius"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.borderRadius",
                      val
                    )
                  }
                  // isPremium={true}
                  // openProModal={openProModal}
                  help="Border radius of Document Box in PX"
                />

                {_get(
                  formData,
                  "settings.documentLibrary.documentBox.downloadButton.isDisplay"
                ) && (
                    <>
                      <ContentHeader title="Download Button Styles" />
                      <Colors
                        title="Text Color"
                        value={_get(
                          formData,
                          "settings.documentLibrary.documentBox.downloadButton.textColor"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.documentLibrary.documentBox.downloadButton.textColor",
                            val
                          )
                        }
                      />

                      <Colors
                        title="Background Color"
                        value={_get(
                          formData,
                          "settings.documentLibrary.documentBox.downloadButton.bgColor"
                        )}
                        onChange={(val) =>
                          onFormDataUpdate(
                            "settings.documentLibrary.documentBox.downloadButton.bgColor",
                            val
                          )
                        }
                      />
                    </>
                  )}

                <ContentHeader title="View Button Styles" />

                <Colors
                  title="Text Color"
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.viewButton.textColor"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.viewButton.textColor",
                      val
                    )
                  }
                />

                <Colors
                  title="Background Color"
                  value={_get(
                    formData,
                    "settings.documentLibrary.documentBox.viewButton.bgColor"
                  )}
                  onChange={(val) =>
                    onFormDataUpdate(
                      "settings.documentLibrary.documentBox.viewButton.bgColor",
                      val
                    )
                  }
                />
              </>
            )}
          </>
        )}

        {activeSettings === "styles-docLibrary" && (
          <>
            <Color
              isHeader={true}
              title="Background Color"
              value={_get(formData, "settings.documentLibrary.bgColor")}
              onChange={(val) =>
                onFormDataUpdate("settings.documentLibrary.bgColor", val)
              }
            />
            <RangeControl
              title="Document Columns"
              value={_get(
                formData,
                "settings.documentLibrary.docsViewPerRow"
              )}
              onChange={(val) =>
                onFormDataUpdate(
                  "settings.documentLibrary.docsViewPerRow",
                  val
                )
              }
              min={1}
              max={5}
              help="Set document columns in number"
              fieldIcon={<RangeControlIcon />}
            />

            <RangeControl
              title="Gap Between Documents"
              value={_get(formData, "settings.documentLibrary.rowGap")}
              onChange={(val) =>
                onFormDataUpdate("settings.documentLibrary.rowGap", val)
              }
              min={0}
              max={50}
              help="Set gap between documents in PX"
              fieldIcon={<RangeControlIcon />}
            />

            <BoxControl
              title="Full Container Padding"
              name="Padding"
              value={_get(formData, "settings.documentLibrary.padding")}
              onChange={(val) =>
                onFormDataUpdate("settings.documentLibrary.padding", val)
              }
            />
          </>
        )}
      </div>
    </>
  );
};

export default General;
