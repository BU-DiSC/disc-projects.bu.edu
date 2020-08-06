// The following is for the show-more show-less buttons
$(".show-more a").each(function() {
    var $link = $(this);
    var $content = $link.parent().prev("span.text-content");

    // console.log($link);

    var visibleHeight = $content[0].clientHeight;
    var actualHide = $content[0].scrollHeight - 1;

    // console.log(actualHide);
    // console.log(visibleHeight);

    if (actualHide > visibleHeight) {
        $link.show();
    } else {
        // $link.hide();
    }
});



$(".show-more a").on("click", function() {
    var $link = $(this);
    var $content = $link.parent().prev("span.text-content");
    var linkText = $link.text();
    var id = $(this)[0].id; 
    $content.toggleClass("short-text, full-text");

    $link.text(getShowLinkText(linkText, id));

    return false;
});



function getShowLinkText(currentText, id) {
    var newText = '';
    var caption;
    if (id == "caption1") {
       caption=document.getElementById("figure1_caption");
       if (currentText.toUpperCase() === "SHOW MORE...") {
          newText = "Show less.";
          caption.innerHTML = "<strong>Figure 1.</strong> The LSM-tree design space exhibits a trade-off between lookup cost and update cost that can be navigated by tuning the merge policy and size ratio. In general, the curve for Monkey  dominates the curve for the state-of-the-art because Monkey minimizes worst-case query cost by allocating main memory among the Bloom filters so as to minimize the sum of their false positive rates. To generate these curves, we plug different combinations of the merge policy and the size ratio into our closed-form equations for lookup cost and update cost, and we plot lookup cost against update cost for corresponding values of the merge policy and size ratio.  ";
      } else {
          newText = "Show more...";
          caption.innerHTML = "<strong>Figure 1.</strong> The LSM-tree design space exhibits a trade-off between lookup cost and update cost that can be navigated by tuning the merge policy and size ratio. ";
      }
    }
    else  {
       caption=document.getElementById("figure2_caption");
       
          if (currentText.toUpperCase() === "SHOW MORE...") {
          newText = "Show less.";
          caption.innerHTML = "<strong>Figure 2.</strong>  Monkey allocates relatively more main memory (i.e., lower false positive rates) to Bloom filters at shallower levels of the LSM-tree. The LSM-tree structure and visualisation in this figure is dynamically generated based on the configuration selected above. Note that there is a slight discrepency between the overall lookup/update costs in Figures 1 and 2 for corresponding configurations due to rounding errors . ";
       } else {
          newText = "Show more...";
          caption.innerHTML = "<strong>Figure 2.</strong> Monkey allocates relatively more main memory (i.e., lower false positive rates) to Bloom filters at shallower levels of the LSM-tree.     ";
      }
    }

    return newText;
}