$(document).ready(function(){
	$first = $('#firstSlide');
	$second = $('#secondSlide');
	$third = $('#thirdSlide');
	$fourth = $('#fourthSlide');

	$('#coneAlpha').click(function(){
		if ($('#carouselIndicators').css('display') == 'none')
			$('#carouselIndicators').show();
		$first.attr("src", "images/algorithms/1.png");
		$second.attr("src", "images/algorithms/2.png");
		$third.attr("src", "images/algorithms/3.png");
		$fourth.attr("src", "images/algorithms/4.png");
	});

	$('#coneXAlpha').click(function(){
		if ($('#carouselIndicators').css('display') == 'none')
			$('#carouselIndicators').show();
		$first.attr("src", "images/algorithms/1.png");
		$second.attr("src", "images/algorithms/2.png");
		$third.attr("src", "images/algorithms/3.png");
		$fourth.attr("src", "images/algorithms/4.png");
	});

	$('#cowAlpha').click(function(){
		if ($('#carouselIndicators').css('display') == 'none')
			$('#carouselIndicators').show();
		$first.attr("src", "images/algorithms/1.png");
		$second.attr("src", "images/algorithms/2.png");
		$third.attr("src", "images/algorithms/3.png");
		$fourth.attr("src", "images/algorithms/4.png");
	});

	$('#cowXAlpha').click(function(){
		if ($('#carouselIndicators').css('display') == 'none')
			$('#carouselIndicators').show();
		$first.attr("src", "images/algorithms/1.png");
		$second.attr("src", "images/algorithms/2.png");
		$third.attr("src", "images/algorithms/3.png");
		$fourth.attr("src", "images/algorithms/4.png");
	});
});