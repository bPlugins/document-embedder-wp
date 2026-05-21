import { createRoot } from "react-dom/client";
import AddNewLibrary from "./Updated";

document.addEventListener("DOMContentLoaded", () => {
  const allLibraryPageEl = document.getElementById(
    "bpldeDocumentLibraryWrapper"
  );
  createRoot(allLibraryPageEl).render(
    <AddNewLibrary isPremium={allLibraryPageEl.dataset.isPremium} />
  );
});