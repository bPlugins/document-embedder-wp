/**
 * Live preview for the Document edit screen.
 *
 * Reads the values sitting in the metabox form and posts a COPY of them into the preview
 * iframe. form#post itself is never submitted or modified — only read — so previewing can
 * never save, autosave or otherwise touch the document.
 */
(function ($) {
  $(function () {
    var $panel = $("#bplde-preview");
    if (!$panel.length) {
      return;
    }

    var $frame = $("#bplde-preview-frame");
    var $form = $("#bplde-preview-form");
    if (!$frame.length || !$form.length) {
      return;
    }

    var settings = window.bpldePreview || {};
    var strings = settings.i18n || {};
    var $status = $panel.find(".bplde-preview-status");

    // Tablet is 900px so it lands inside render.php's max-width:991px query without
    // tripping the 767px mobile one; mobile is comfortably below 767px.
    var DEVICE_WIDTHS = {
      desktop: "100%",
      tablet: "900px",
      mobile: "420px",
    };

    var DEBOUNCE_MS = 700;

    // A form-target navigation never updates the iframe's src attribute, so load state cannot
    // be read off the element — it is tracked here instead.
    var pending = false;
    var retried = false;

    var setStatus = function (text, isBusy) {
      $status.text(text || "").toggleClass("is-busy", !!isBusy);
    };

    // Every top-level ppv key the form actually renders, including fields that currently
    // submit nothing (an emptied repeater renders only CSF's "___" template row). PHP needs
    // this to tell "cleared by the user" apart from "not on screen", otherwise deleting all
    // overlays would keep previewing the saved ones.
    var renderedKeys = function () {
      var keys = {};
      $("form#post")
        .find('[name^="ppv["], [name^="___ppv["]')
        .each(function () {
          var match = this.name.match(/^_*ppv\[([A-Za-z0-9_-]+)\]/);
          if (match) {
            keys[match[1]] = true;
          }
        });
      return Object.keys(keys).join(",");
    };

    var render = function (isRetry) {
      // serializeArray() respects checked state, multi-selects and disabled inputs, so the
      // payload is exactly what a real save would submit. CSF prefixes its repeater template
      // rows with "___", which the "ppv[" test excludes on its own.
      var fields = $("form#post")
        .serializeArray()
        .filter(function (field) {
          return field.name.indexOf("ppv[") === 0;
        });

      $form.empty();

      fields.forEach(function (field) {
        $("<input>", { type: "hidden", name: field.name })
          .val(field.value)
          .appendTo($form);
      });

      $("<input>", { type: "hidden", name: "bplde_rendered_keys" })
        .val(renderedKeys())
        .appendTo($form);

      if (!isRetry) {
        retried = false;
      }
      pending = true;
      setStatus(strings.updating, true);
      $form[0].submit();
    };

    var schedule = (function () {
      var timer = null;
      return function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { render(false); }, DEBOUNCE_MS);
      };
    })();

    var setDevice = function (device) {
      if (!DEVICE_WIDTHS[device]) {
        return;
      }
      $frame.css("width", DEVICE_WIDTHS[device]);
      $panel
        .find(".bplde-preview-device")
        .removeClass("is-active")
        .filter('[data-device="' + device + '"]')
        .addClass("is-active");
    };

    $panel.on("click", ".bplde-preview-device", function () {
      setDevice($(this).data("device"));
    });

    $panel.on("click", ".bplde-preview-refresh", function () {
      render(false);
    });

    // Mirror the metabox's own "Set Height & Width For" toggle so the two never disagree.
    $(document).on("change", 'input[name="ppv[device_preview]"]', function () {
      setDevice($(this).val());
    });

    // Any settings change re-renders. 'input' covers typing; 'change' covers switchers,
    // selects, colour pickers and the media upload field.
    $(document).on("change", ".csf-wrapper :input", schedule);
    $(document).on(
      "input",
      '.csf-wrapper input[type="text"], .csf-wrapper input[type="number"], .csf-wrapper textarea',
      schedule
    );

    // Only OUR rendered document counts as a finished preview. An iframe still fires load for
    // its implicit blank document, and treating that as success both lies in the status line
    // and hides the case where a POST was lost.
    var framedPreviewLoaded = function (frame) {
      try {
        var doc = frame.contentDocument;
        return !!(doc && doc.body && doc.body.classList.contains("bplde-preview-document"));
      } catch (e) {
        return false;
      }
    };

    $frame.on("load", function () {
      if (!pending) {
        return;
      }

      if (framedPreviewLoaded(this)) {
        pending = false;
        retried = false;
        setStatus(strings.ready, false);
        return;
      }

      // The frame settled on something that is not the preview — the submission was raced.
      // Re-send once; anything past that is a real failure and the user has Refresh.
      if (!retried) {
        retried = true;
        render(true);
      }
    });

    // Size the iframe to its content so the preview never grows its own scrollbar.
    window.addEventListener("message", function (event) {
      if (settings.origin && event.origin !== settings.origin) {
        return;
      }
      var data = event.data;
      if (!data || data.type !== "bplde-preview-height") {
        return;
      }
      var height = parseInt(data.height, 10);
      if (!height) {
        return;
      }
      $frame.css("height", Math.min(Math.max(height, 240), 2000) + "px");
    });

    // --- Go-to-preview button --------------------------------------------------------------
    // Permanently visible; the preview box sits below the configuration box, so this is the
    // shortcut down to it from anywhere on the page.
    var $jump = $("#bplde-preview-jump");
    var $box = $("#bplde_live_preview");

    if ($jump.length && $box.length) {
      $jump.on("click", function () {
        // Expand first if the user collapsed the box, otherwise scrolling lands on a header
        // with nothing under it.
        if ($box.hasClass("closed")) {
          $box.find(".handlediv").first().trigger("click");
        }

        var adminBar = $("#wpadminbar").length ? $("#wpadminbar").outerHeight() : 0;
        var top = $box.offset().top - adminBar - 12;

        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    }


    // First render waits for the page to finish loading, so the frame has no navigation of its
    // own in flight to overwrite the result.
    if (document.readyState === "complete") {
      render(false);
    } else {
      $(window).one("load", function () { render(false); });
    }
  });
})(jQuery);
