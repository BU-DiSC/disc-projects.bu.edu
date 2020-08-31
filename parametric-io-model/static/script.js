$(document).ready(function(){
    /*Resizing*/
    //Initial settings
    if (window.matchMedia("(max-width: 992px)").matches) {
    }

    // When window resizes
    $(window).resize(function(){
        if (window.matchMedia("(max-width: 992px)").matches) {
        } else {

        }
    });

    /*Footer on hover*/
    $('#bu_footer').mouseover(function(){
        $(this).attr("src", "images/logos/bu.png");
    });

    $('#bu_footer').mouseout(function(){
        $(this).attr("src", "images/logos/bu_gs.png");
    });

    $('#midas_footer').mouseover(function(){
        $(this).attr("src", "images/logos/disc_6.png");
    });

    $('#midas_footer').mouseout(function(){
        $(this).attr("src", "images/logos/disc_6_gs.png");
    });

    $('.closeInputs').click(function(){
        $('.fixedInputs').children('#inputs').toggle();
        $('.closeInputs').toggle();
    });

    $('.openInputs').click(function(){
        $('.fixedInputs').children('#inputs').toggle();
        $('.closeInputs').toggle();
    });
});

$(document).scroll(function(){
    const top = $('.fixedInputs').offset().top;
    if ($('.fixedInputs').offset().top > 1800){
        $('.closeInputs').show();
        $('.fixedInputs').css({"border-bottom":"0.5px solid grey"});
    } else {
        $('.closeInputs').hide();
        $('.fixedInputs').children('#inputs').show();
        $('.fixedInputs').css({"border-bottom":"0px"});
    }
})