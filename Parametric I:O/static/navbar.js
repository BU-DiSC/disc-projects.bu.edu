$(document).ready(function(){
    // navigation bar settings
    $('.hamburger-menu').click(function () {
        $('.animated-icon').toggleClass('open');
    });

    $('.nav-item').click(function(){
        $('.animated-icon').toggleClass('open');
        $('#navbarSupportedContent').collapse('toggle');
    });
});
