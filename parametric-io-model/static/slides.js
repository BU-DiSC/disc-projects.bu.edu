$(document).ready(function(){
	$first = $('.firstitem');
	$second = $('.seconditem');
	$third = $('.thirditem');
	$slideshow = $('#slideshow');

	$('#coneAlpha').click(function(){
		$first.prop("src", "images/algorithms/CONEn_1.png");
		$second.prop("src", "images/algorithms/CONEn_2.png");
		$third.prop("src", "images/algorithms/CONEn_3.png");
		$slideshow.show();
		//$slideshow.carousel(0).show();
	});

	$('#coneXAlpha').click(function(){
		$first.prop("src", "images/algorithms/CONEXn_1.png");
		$second.prop("src", "images/algorithms/CONEXn_2.png");
		$third.prop("src", "images/algorithms/CONEXn_3.png");
		$slideshow.show();
		//$slideshow.carousel(0).show();
	});

	$('#cowAlpha').click(function(){
		$first.prop("src", "images/algorithms/COWn_1.png");
		$second.prop("src", "images/algorithms/COWn_2.png");
		$third.prop("src", "images/algorithms/COWn_3.png");
		$slideshow.show();
		//$slideshow.carousel(0).show();
	});

	$('#cowXAlpha').click(function(){
		$first.prop("src", "images/algorithms/COWXn_1.png");
		$second.prop("src", "images/algorithms/COWXn_2.png");
		$third.prop("src", "images/algorithms/COWXn_3.png");
		$slideshow.show();
		//$slideshow.carousel(0).show();
	});

	$('#all').click(function(){
		$first.prop("src", "images/algorithms/All_1.png");
		$second.prop("src", "images/algorithms/All_2.png");
		$third.prop("src", "images/algorithms/All_3.png");
		$slideshow.show();
		//$slideshow.carousel(0).show();
	});
});