/* global bplde_obj */
import "./public.css";

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

    if (iframe) {
      iframe.addEventListener("load", function() {
        if (ppvLoading) ppvLoading.style.display = "none";
        if (loader) loader.style.display = "none";
      });
      // Fallback in case load event already fired or fails to fire
      setTimeout(() => {
        if (ppvLoading) ppvLoading.style.display = "none";
        if (loader) loader.style.display = "none";
      }, 3000);
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
                      let downloadUrl = bplde_obj.rest_url + 'download/' + docId + '?de_nonce=' + response.data.nonce;
                      // Only present for logged-in users; see the rest_nonce comment in PHP.
                      if (bplde_obj.rest_nonce) {
                          downloadUrl += '&_wpnonce=' + encodeURIComponent(bplde_obj.rest_nonce);
                      }
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
                      // The refusal payload is an object; a spent download allowance carries a
                      // message written for the visitor, so show that rather than "[object Object]".
                      const data = response.data || {};
                      const message = (typeof data === 'string') ? data : (data.message || 'Unknown error');
                      alert(data.limit_reached ? message : 'Tracking error: ' + message);
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
