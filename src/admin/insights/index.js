import { createRoot } from "react-dom/client";

import "./style.scss";
import App from "./App";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("bpldeInsights");
  if (!root) return;

  const info = JSON.parse(root.dataset.info || "{}");
  root.removeAttribute("data-info");

  createRoot(root).render(<App info={info} />);
});
