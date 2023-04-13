Behaviour.specify("TEXTAREA.codemirror", "textarea", 0, function (e) {
  var config = e.getAttribute("codemirror-config");
  if (!config) {
    config = "";
  }
  config = eval("({" + config + "})");
  if (!config.onBlur) {
    config.onBlur = function (editor) {
      editor.save();
      editor.getTextArea().dispatchEvent(new Event("change"));
    };
  }
  var codemirror = CodeMirror.fromTextArea(e, config);
  e.codemirrorObject = codemirror;
  if (typeof codemirror.getScrollerElement !== "function") {
    // Maybe older versions of CodeMirror do not provide getScrollerElement method.
    codemirror.getScrollerElement = function () {
      return findElementsBySelector(
        codemirror.getWrapperElement(),
        ".CodeMirror-scroll"
      )[0];
    };
  }
  var lineCount = codemirror.lineCount();
  var lineHeight = codemirror.defaultTextHeight();

  var scroller = codemirror.getScrollerElement();
  scroller.setAttribute("style", "border:none;");
  scroller.style.height = Math.max(lineHeight * lineCount + 30, 130) + "px";

  // the form needs to be populated before the "Apply" button
  if (e.closest("form")) {
    // Protect against undefined element
    Element.on(e.closest("form"), "jenkins:apply", function () {
      e.value = codemirror.getValue();
    });
  }
});

Behaviour.specify(
  "DIV.textarea-preview-container",
  "textarea",
  100,
  function (e) {
    var previewDiv = findElementsBySelector(e, ".textarea-preview")[0];
    var showPreview = findElementsBySelector(e, ".textarea-show-preview")[0];
    var hidePreview = findElementsBySelector(e, ".textarea-hide-preview")[0];
    $(hidePreview).hide();
    $(previewDiv).hide();

    showPreview.onclick = function () {
      // Several TEXTAREAs may exist if CodeMirror is enabled. The first one has reference to the CodeMirror object.
      var textarea = e.parentNode.getElementsByTagName("TEXTAREA")[0];
      var text = "";
      //Textarea object will be null if the text area is disabled.
      if (textarea == null) {
        textarea = e.parentNode.getElementsByClassName("jenkins-readonly")[0];
        text = textarea != null ? textarea.innerText : "";
      } else {
        text = textarea.codemirrorObject
          ? textarea.codemirrorObject.getValue()
          : textarea.value;
      }
      var render = function (txt) {
        $(hidePreview).show();
        $(previewDiv).show();
        previewDiv.innerHTML = txt;
        layoutUpdateCallback.call();
      };

      new Ajax.Request(rootURL + showPreview.getAttribute("previewEndpoint"), {
        parameters: {
          text: text,
        },
        onSuccess: function (obj) {
          render(obj.responseText);
        },
        onFailure: function (obj) {
          render(
            obj.status + " " + obj.statusText + "<HR/>" + obj.responseText
          );
        },
      });
      return false;
    };

    hidePreview.onclick = function () {
      $(hidePreview).hide();
      $(previewDiv).hide();
    };
  }
);
