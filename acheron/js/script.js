$(function () { // Same as document.addEventListener("DOMContentLoaded"...
  // enable tooltip
  // $('[data-toggle="tooltip"]').tooltip()
  // enable tooltip for dynamic content
  $('body').tooltip({
    selector: '[data-toggle="tooltip"]',
    html: true,
  });



  $("#switch-for-update-granularity").on("click", function() {
    var label = $(this).next();
    if ($(this).hasClass("checked")) {
      $(this).removeClass("checked");
      label.attr("data-original-title", "Update per operation (flush/compaction)")
        .tooltip("show");
    } else {
      $(this).addClass("checked");
      label.attr("data-original-title", "Update per stable state after every flush")
        .tooltip("show");
    }
  });

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 991) {
      $("#collapsable-nav").collapse('hide');
    }
  });

  // In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});
