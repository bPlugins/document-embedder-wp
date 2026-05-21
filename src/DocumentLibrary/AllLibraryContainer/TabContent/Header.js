import Typography from "../../Fields/Typography/Typography";

import _get from "lodash/get";
import Color from "../../Fields/Color/Color";
import { useState } from "react";

const Header = ({ formData, onFormDataUpdate }) => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      label: "General",
      value: "general",
    },
    {
      label: "Styles",
      value: "styles",
    },
  ];

  return (
    <>
      <div className="vfd-main-settings">
        <div className="vfd-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className={`vfd-tab ${activeTab === tab.value ? "active" : ""}`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {tabs.find((tab) => tab.value === activeTab)?.value === "styles" && (
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
      </div>
    </>
  );
};

export default Header;
