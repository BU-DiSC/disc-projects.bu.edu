var disappearMenu = (function($) {          
        $(document).ready(function(){                    
            $(window).scroll(function(){                          
                if ($(this).scrollTop() > 250) {
                    $('.navbar').fadeIn(200);
                } else {
                    $('.navbar').fadeOut(200);
                }
            });
        });
    })(jQuery);