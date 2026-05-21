import { createRoot } from "react-dom/client";
import GettingStartedContainer from "./GettingStartedContainer";
import "./GettingStarted.scss";

document.addEventListener("DOMContentLoaded", () => {
  const settingsPageEl = document.getElementById("vfdGettingStartedWrapper");

  createRoot(settingsPageEl).render(<GettingStartedContainer />);
});
