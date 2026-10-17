import { createRoot } from "react-dom/client";
import "./style.scss";
import "./Skeleton.scss";
import FrontendDocLibrary from "./Components/Frontend/FrontendDocLibrary";

document.addEventListener("DOMContentLoaded", () => {
  const documentLibraryBlockEls = document.querySelectorAll(
    ".wp-block-bpldl-document-library"
  );

  documentLibraryBlockEls.forEach((documentLibraryBlockEl) => {
    const postData = JSON.parse(documentLibraryBlockEl.dataset.postData);

    createRoot(documentLibraryBlockEl).render(
      <>
        <FrontendDocLibrary
          attributes={postData}
          id={documentLibraryBlockEl.id}
        />
      </>
    );

    documentLibraryBlockEl?.removeAttribute("data-postData");
  });
});
