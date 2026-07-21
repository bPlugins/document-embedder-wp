import React, { useState } from "react";

const EmailGate = ({
  onClose,
  postId,
  downloadBehavior = "download",
  downloadButtonText = "Download",
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      name,
      email,
      document_id: postId,
    };

    let newTab = null;
    if (downloadBehavior === "newtab") {
      newTab = window.open("about:blank", "_blank");
    }

    const restUrl = window.bplde_obj?.rest_url || "/wp-json/docembedder/v1/";
    fetch(`${restUrl}gate-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.url) {
          onClose();
          if (onSuccess) {
            onSuccess();
          }
          if (downloadBehavior === "newtab" && newTab) {
            newTab.location.href = res.url;
          } else {
            window.location.href = res.url;
          }
        } else {
          alert(res.message || "Error processing request");
          if (newTab) newTab.close();
        }
      })
      .catch(() => {
        alert("Error connecting to server.");
        if (newTab) newTab.close();
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div
      className="ppv-email-gate-modal-wrapper"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      <div
        className="ppv-email-gate-modal-content"
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "400px",
          position: "relative",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <button
          type="button"
          className="ppv-close-modal"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#999",
          }}
        >
          &times;
        </button>
        <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
          Download Document
        </h3>
        <form className="ppv-email-gate-form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Name</label>
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "10px",
              background: "#007cba",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            {submitting ? "Processing..." : downloadButtonText}
          </button>
          <p
            className="ppv-gate-secure-text"
            style={{ fontSize: "11px", color: "#666", marginTop: "10px", textAlign: "center" }}
          >
            Your details are saved securely.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmailGate;
