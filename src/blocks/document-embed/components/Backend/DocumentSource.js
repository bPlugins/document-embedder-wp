import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { useState, useEffect, useRef } from "@wordpress/element";
import { BtnGroup, InlineMediaUpload, Notice } from "../../../../../../bpl-tools/Components";
import { isPDF } from "../../utils";

// Custom SVG Icons
const googleDriveIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M7.71 3.5h8.58l6.83 11.83h-8.58z" fill="#FFC107" />
    <path d="M16.29 15.33H2.62L6 20.67h13.67z" fill="#00E676" />
    <path d="M9.42 15.33L2.62 3.5 6 9.33l6.83 11.34z" fill="#2979FF" />
  </svg>
);

const dropboxIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="#0061FE" style={{ flexShrink: 0 }}>
    <path d="M12.012 1.5L4.851 6.136l7.161 4.673 7.16-4.673L12.012 1.5zm-7.161 9.42l7.161 4.636 7.16-4.636 4.828 3.125-11.988 7.455-11.988-7.455 4.827-3.125zm0 1.93l-4.827 3.125L12.012 23.5l11.988-7.513-4.828-3.125-7.16 4.636-7.161-4.636z" />
  </svg>
);

const loadScript = (id, src, attrs = {}) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    Object.keys(attrs).forEach((key) => {
      script.setAttribute(key, attrs[key]);
    });
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
};

const DocumentSource = ({ attributes, setAttributes, setIsProModalOpen }) => {
  const { documentSource } = attributes;
  const { doc, viewer } = documentSource;

  const CLIENT_ID = window.ppvBlocks?.credentials?.google?.client_id;
  const API_KEY = window.ppvBlocks?.credentials?.google?.api_key;
  const APP_ID = window.ppvBlocks?.credentials?.google?.project_number;
  const dropboxKey = window.ppvBlocks?.credentials?.dropbox?.app_key;

  const hasGoogleCredentials = !!(CLIENT_ID && API_KEY && APP_ID);
  const hasDropboxCredentials = !!dropboxKey;

  const [googleAccessToken, setGoogleAccessToken] = useState(
    sessionStorage.getItem("de_google_access_token") || null
  );
  const [googlePickerInited, setGooglePickerInited] = useState(false);
  const [googleGisInited, setGoogleGisInited] = useState(false);
  const googleTokenClient = useRef(null);

  // Load Dropbox SDK dynamically
  useEffect(() => {
    if (hasDropboxCredentials) {
      loadScript("dropboxjs", "https://www.dropbox.com/static/api/2/dropins.js", {
        "data-app-key": dropboxKey,
      }).catch((err) => console.error("Failed to load Dropbox SDK", err));
    }
  }, [dropboxKey, hasDropboxCredentials]);

  // Load Google Drive API SDKs dynamically
  useEffect(() => {
    if (!hasGoogleCredentials) return;

    // Load GAPI
    if (window.gapi) {
      if (!googlePickerInited) {
        window.gapi.load("client:picker", async () => {
          try {
            await window.gapi.client.load(
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
            );
            setGooglePickerInited(true);
          } catch (e) {
            console.error("GAPI client load failed", e);
          }
        });
      }
    } else {
      loadScript("google-api-script", "https://apis.google.com/js/api.js")
        .then(() => {
          window.gapi.load("client:picker", async () => {
            try {
              await window.gapi.client.load(
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
              );
              setGooglePickerInited(true);
            } catch (e) {
              console.error("GAPI client load failed", e);
            }
          });
        })
        .catch((err) => console.error("Failed to load GAPI script", err));
    }

    // Load GIS
    if (window.google?.accounts?.oauth2) {
      if (!googleTokenClient.current) {
        googleTokenClient.current = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
          callback: "", // set dynamically
        });
        setGoogleGisInited(true);
      }
    } else {
      loadScript("google-gis-script", "https://accounts.google.com/gsi/client")
        .then(() => {
          googleTokenClient.current = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
            callback: "", // set dynamically
          });
          setGoogleGisInited(true);
        })
        .catch((err) => console.error("Failed to load GIS script", err));
    }
  }, [hasGoogleCredentials, CLIENT_ID]);

  const updateSource = (key, value) => {
    setAttributes({
      documentSource: {
        ...documentSource,
        [key]: value,
      },
    });
  };

  const handleGoogleAuth = () => {
    if (!googleTokenClient.current) return;

    googleTokenClient.current.callback = async (response) => {
      if (response.error) {
        console.error("Google Auth error", response);
        return;
      }
      setGoogleAccessToken(response.access_token);
      sessionStorage.setItem("de_google_access_token", response.access_token);
      createGooglePicker(response.access_token);
    };

    if (!googleAccessToken) {
      googleTokenClient.current.requestAccessToken({ prompt: "consent" });
    } else {
      googleTokenClient.current.requestAccessToken({ prompt: "" });
    }
  };

  const createGooglePicker = (token) => {
    if (!window.google?.picker) return;

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setDeveloperKey(API_KEY)
      .setAppId(APP_ID)
      .setOAuthToken(token)
      .addView(view)
      .addView(new window.google.picker.DocsUploadView())
      .setCallback(googlePickerCallback)
      .build();

    picker.setVisible(true);
  };

  const handleGoogleSelect = () => {
    if (googleAccessToken) {
      createGooglePicker(googleAccessToken);
    }
  };

  const handleGoogleSignout = () => {
    if (googleAccessToken) {
      try {
        window.google.accounts.oauth2.revoke(googleAccessToken);
      } catch (e) {
        console.error("Token revocation failed", e);
      }
      setGoogleAccessToken(null);
      sessionStorage.removeItem("de_google_access_token");
    }
  };

  const googlePickerCallback = async (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      if (data.docs && data.docs.length > 0) {
        const url = data.docs[0].embedUrl || data.docs[0].url;
        updateSource("doc", url);
        updateSource("googleDrive", true);
      }
    }
  };

  const handleDropboxSelect = () => {
    if (window.Dropbox) {
      window.Dropbox.choose({
        success: function (files) {
          if (files && files.length > 0) {
            const url = files[0].link;
            updateSource("doc", url);
            updateSource("googleDrive", false);
          }
        },
        cancel: function () {},
        linkType: "preview",
        multiselect: false,
        folderselect: false,
      });
    } else {
      console.warn("Dropbox API not loaded yet.");
    }
  };

  const isGoogleDriveLink = doc && (doc.includes("drive.google.com") || doc.includes("docs.google.com"));
  const isDropboxLink = doc && doc.includes("dropbox.com");
  const isFromDriveOrDropbox = isGoogleDriveLink || isDropboxLink;
  const isDocPdf = isPDF(doc);

  const showViewerOption = true;

  const premiumProps = {
    isPremium: window.ppvBlocks?.isPremium === true || window.ppvBlocks?.isPremium === '1' || window.ppvBlocks?.isPremium === 1,
    setIsProModalOpen: setIsProModalOpen,
  };

  return (
    <PanelBody
      className="bPlPanelBody"
      title={
        <div className="bplde-panel-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#3858E9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>{__("Document Source", "document-emberdder")}</span>
        </div>
      }
      initialOpen={true}
    >
      <InlineMediaUpload
        className="mt10"
        label={__("Document File", "document-emberdder")}
        value={doc}
        types={[
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ]}
        onChange={(media) => {
          const url = media?.url || media || "";
          updateSource("doc", url);
          if (media?.id) {
            setAttributes({ docId: media.id });
          }
        }}
        placeholder={__("Enter URL or upload file", "document-emberdder")}
      />

      {showViewerOption && (
        <div className="mt10">
          <BtnGroup
            label={__("Viewer", "document-emberdder")}
            labelPosition="top"
            value={viewer}
            onChange={(val) => updateSource("viewer", val)}
            options={[
              { label: __("Default", "document-emberdder"), value: "default" },
              {
                label: (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {__("Custom PDF", "document-emberdder")}
                    <span style={{
                      backgroundColor: "#8b5cf6",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("PDF Only", "document-emberdder")}
                    </span>
                    <span style={{
                      backgroundColor: "#3858e9",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("New", "document-emberdder")}
                    </span>
                  </span>
                ),
                value: "custom"
              },
              {
                label: (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {__("Flipbook", "document-emberdder")}
                    <span style={{
                      backgroundColor: "#8b5cf6",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("PDF Only", "document-emberdder")}
                    </span>
                    <span style={{
                      backgroundColor: "#3858e9",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("New", "document-emberdder")}
                    </span>
                  </span>
                ),
                value: "flipbook"
              },
              {
                label: (
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {__("Slider", "document-emberdder")}
                    <span style={{
                      backgroundColor: "#8b5cf6",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("PDF Only", "document-emberdder")}
                    </span>
                    <span style={{
                      backgroundColor: "#3858e9",
                      color: "#ffffff",
                      fontSize: "9px",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      fontWeight: "bold",
                      lineHeight: "1",
                      textTransform: "uppercase"
                    }}>
                      {__("New", "document-emberdder")}
                    </span>
                  </span>
                ),
                value: "slider"
              },
            ]}
            help={__("Select the document viewer engine. Note: Custom PDF, Flipbook, and Slider engines only support PDF documents.", "document-emberdder")}
            Component={BtnGroup}
          />
        </div>
      )}

      <Notice status="premium" isIcon={true}>
        {__(
          "Skip the manual uploads — embed directly from Google Drive and Dropbox with one click. The cloud document picker is available in Document Embedder Pro.",
          "document-emberdder"
        )}
      </Notice>
    </PanelBody>
  );
};

export default DocumentSource;
