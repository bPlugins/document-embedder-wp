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

  // Handle Email Gate Modal
  const gateButtons = document.querySelectorAll('.ppv-email-gate-btn');
  gateButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
          e.preventDefault();
          const docId = this.dataset.docId;
          const behavior = this.dataset.behavior || 'download';
          const modal = document.getElementById('ppv-gate-modal-' + docId);
          if (modal) {
              modal.style.display = 'flex';
              const form = modal.querySelector('.ppv-email-gate-form');
              if (form) {
                  form.dataset.behavior = behavior;
              }
          }
      });
  });

  const closeButtons = document.querySelectorAll('.ppv-close-modal');
  closeButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
          e.preventDefault();
          this.closest('.ppv-email-gate-modal-wrapper').style.display = 'none';
      });
  });

  const gateForms = document.querySelectorAll('.ppv-email-gate-form');
  gateForms.forEach(form => {
      form.addEventListener('submit', function(e) {
          e.preventDefault();
          const submitBtn = this.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerText;
          submitBtn.innerText = 'Processing...';
          submitBtn.disabled = true;

          const behavior = this.dataset.behavior || 'download';

          const formData = new FormData(this);
          const email = (formData.get('email') || '').trim();
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(email)) {
              alert('Please enter a valid email address.');
              submitBtn.innerText = originalText;
              submitBtn.disabled = false;
              return;
          }

          // Open tab before fetch to avoid popup blockers
          let newTab = null;
          if (behavior === 'newtab') {
              newTab = window.open('about:blank', '_blank');
          }

          const data = {
              name: formData.get('name'),
              email: email,
              document_id: formData.get('document_id')
          };

          fetch(bplde_obj.rest_url + 'gate-download', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
          })
          .then(res => res.json())
          .then(res => {
              if (res.success && res.url) {
                  // close modal
                  this.closest('.ppv-email-gate-modal-wrapper').style.display = 'none';
                  
                  if (behavior === 'newtab' && newTab) {
                      newTab.location.href = res.url;
                  } else {
                      window.location.href = res.url;
                  }
              } else {
                  alert(res.message || 'Error processing request');
                  if (newTab) newTab.close();
              }
          })
          .catch(err => {
              alert('Error connecting to server.');
              if (newTab) newTab.close();
          })
          .finally(() => {
              submitBtn.innerText = originalText;
              submitBtn.disabled = false;
          });
      });
  });

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
