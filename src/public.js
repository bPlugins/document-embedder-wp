/* global bplde_obj, $ */
import "./public.css";
// const ios = () => {
//   if (typeof window === `undefined` || typeof navigator === `undefined`)
//     return false;

//   return /iPhone|iPad|iPod/i.test(
//     navigator.userAgent ||
//       navigator.vendor ||
//       (window.opera && window.opera?.toString() === `[object Opera]`)
//   );
// };

document.addEventListener("DOMContentLoaded", function () {
  const docs = document.querySelectorAll(".ppv_container");

  Object.values(docs).map((doc) => {
    const isLightbox = Boolean(doc.dataset.lightbox);
    const ppvLightBoxEl = document.querySelector(".ppv-lightbox-overlay");
    const lightCloseBtn = doc.querySelector(".bplde-lightbox-close");
    if (isLightbox) {
      const lightBtn = doc.querySelector(".ppv-lightbox-btn");
      lightBtn &&
        lightBtn.addEventListener("click", function () {
          ppvLightBoxEl.classList.add("open");
          loadFrameIfNotLoaded(doc);
        });
      lightCloseBtn &&
        lightCloseBtn.addEventListener("click", function () {
          ppvLightBoxEl.classList.remove("open");
        });
    } else {
      loadFrameIfNotLoaded(doc);
    }
  });

  function loadFrameIfNotLoaded(doc) {
    if (!doc) return false;
    const iframe = doc.querySelector("iframe:not(.pdfp_library)");
    const ppvLoading = doc.querySelector(".ppv-lightbox-loading");
    const loader = doc.querySelector(".ppv-loading");
    if (iframe && iframe.contentDocument !== null) {
      const source = iframe.src;
      iframe.src = source;
      setTimeout(() => {
        loadFrameIfNotLoaded(doc);
      }, 1200);
    } else {
      if (ppvLoading) {
        ppvLoading.style.display = "none";
      }
      if (loader) {
        loader.style.display = "none";
      }
    }
  }

  // Handle direct download tracking
  const directDownloads = document.querySelectorAll('.ppv-direct-download');
  directDownloads.forEach(btn => {
      btn.addEventListener('click', function(e) {
          if (typeof bplde_obj === 'undefined') return;
          e.preventDefault();
          
          const docId = this.dataset.docId;
          const self = this;
          const originalContent = self.innerHTML;
          self.innerHTML = 'Downloading...';

          // Open tab before AJAX to avoid popup blockers
          let newTab = null;
          if (self.dataset.behavior === 'newtab') {
              newTab = window.open('about:blank', '_blank');
          }

          // Track and then redirect
          jQuery.ajax({
              url: bplde_obj.ajax_url,
              type: 'POST',
              data: {
                  action: 'de_track_download',
                  nonce: bplde_obj.track_nonce,
                  document_id: docId
              },
              success: function(response) {
                  if (response.success) {
                      // Update counter label if it exists
                      const countLabel = self.closest('p, div').querySelector('.ppv-download-count');
                      if (countLabel) {
                          countLabel.innerText = response.data.count + ' downloads';
                      }

                      // Redirect to download endpoint with the new nonce
                      const downloadUrl = bplde_obj.rest_url + 'download/' + docId + '?de_nonce=' + response.data.nonce;
                      if (self.dataset.behavior === 'newtab' && newTab) {
                          newTab.location.href = downloadUrl;
                      } else {
                          window.location.href = downloadUrl;
                      }
                      
                      // Reset button text after a bit
                      setTimeout(() => {
                          self.innerHTML = originalContent;
                      }, 1000);
                  } else {
                      alert('Tracking error: ' + (response.data || 'Unknown error'));
                      self.innerHTML = originalContent;
                      if (newTab) newTab.close();
                  }
              },
              error: function() {
                  self.innerHTML = originalContent;
                  if (newTab) newTab.close();
              }
          });
      });
  });

});
