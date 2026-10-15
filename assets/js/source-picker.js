/**
 * Document source panel (BPLDE_Source_Picker).
 *
 * The Media Library card writes the picked URL into the CSF `doc` field
 * (#picker_field) and fires `change` on it: that is the field that saves, and the
 * change is what the live preview listens for. The cloud cards are plain links to
 * the Pro pricing page, so they need no script.
 */
(function ($) {
  "use strict";

  var data = window.bpldeSourcePicker || {};
  var i18n = data.i18n || {};
  var icons = data.icons || {};
  var BOX_SHARED_LINK = /^https?:\/\/((?:[a-z0-9-]+\.)*box\.com)\/(?:embed\/|embed_widget\/)?s\/([a-z0-9]+)/i;

  $(function () {
    var $picker = $("#ppv .bplde-source-picker");
    var field = document.getElementById("picker_field");
    if (!$picker.length || !field) return;

    var $current = $picker.find(".bplde-sp-current");

    function describe(url) {
      var host = "";
      var path = url;
      try {
        var parsed = new URL(url, window.location.href);
        host = parsed.hostname;
        path = parsed.pathname;
      } catch (e) {
        // Relative or malformed: fall through to the raw string.
      }

      var name = decodeURIComponent((path.split("/").filter(Boolean).pop() || url).replace(/\+/g, " "));

      if (/(^|\.)(drive|docs)\.google\.com$/.test(host)) {
        return { key: "google", label: i18n.google, name: i18n.driveFile };
      }
      if (/(^|\.)dropbox(usercontent)?\.com$/.test(host)) {
        return { key: "dropbox", label: i18n.dropbox, name: name };
      }
      if (BOX_SHARED_LINK.test(url)) {
        return { key: "box", label: i18n.box, name: name };
      }
      if (!host || host === window.location.hostname) {
        return { key: "media", label: i18n.media, name: name };
      }
      return { key: "url", label: i18n.url, name: name };
    }

    function renderCurrent() {
      var url = (field.value || "").trim();
      if (!url) {
        $current.prop("hidden", true);
        return;
      }

      var info = describe(url);
      $current.find(".bplde-sp-current__icon").html(icons[info.key] || "");
      $current.find(".bplde-sp-current__name").text(info.name).attr("title", url);
      $current.find(".bplde-sp-current__source").text(info.label);
      $current.prop("hidden", false);
    }

    function setDoc(url) {
      field.value = url;
      // 'input' for anything typing-driven, 'change' for CSF and the live preview.
      $(field).trigger("input").trigger("change");
      renderCurrent();
    }

    $(field).on("input change", renderCurrent);
    renderCurrent();

    $current.on("click", ".bplde-sp-current__remove", function () {
      setDoc("");
    });

    var mediaFrame = null;

    $picker.on("click", 'button.bplde-sp-card[data-source="media"]', function () {
      if (!window.wp || !wp.media) return;
      if (!mediaFrame) {
        mediaFrame = wp.media({
          title: i18n.mediaTitle,
          multiple: false,
          button: { text: i18n.mediaButton },
        });
        mediaFrame.on("select", function () {
          var file = mediaFrame.state().get("selection").first().toJSON();
          if (file && file.url) setDoc(file.url);
        });
      }
      mediaFrame.open();
    });
  });
})(jQuery);
