import React from "react";
import Header from "../Components/Pages/Header";
import Footer from "../Components/Pages/Footer";

const GettingStartedContainer = () => {
  return (
    <>
      <Header>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button type="button" className="add-new-btn">Get Pro</button>
        </div>
      </Header>

      <div className="vfd-content">
        <div className="vfd-card-header">
          <h2>Getting Started with Voice Feedback</h2>
          <p>
            Learn how to set up and use voice feedback forms to collect valuable
            insights from your users. Follow our step-by-step guide to get
            started in minutes.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default GettingStartedContainer;
