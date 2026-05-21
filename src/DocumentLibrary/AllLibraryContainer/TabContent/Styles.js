import RangeControl from "../../Fields/RangeControl/RangeControl";
import Typography from "../../Fields/Typography/Typography";
import Colors from "../../Fields/Colors/Colors";
import BoxControl from "../../Fields/BoxControl/BoxControl";

import _get from "lodash/get";
import { RangeControlIcon } from "../../Utils/icons";
import Border from "../../Fields/Border/Border";
import Color from "../../Fields/Color/Color";
import DynamicTab from "../../Fields/DynamicTab/DynamicTab";
import ContentHeader from "../../Components/Shared/Shared/ContentHeader";

const Styles = ({ formData, onFormDataUpdate, activeSettings = "docLibrary" }) => {

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
        {activeSettings === "styles-header" && (
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
        )}
        {activeSettings === "styles-toolbarBox" && (
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
        )}
        {activeSettings === "styles-docBox" && (
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
      </div>
    </>
  );
};

export default Styles;
