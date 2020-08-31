function getBPRaw(workload, bufferPoolRatio){
	const baseAlg = parseInt(baseAlg_buff.value);
	const alpha = parseInt($('#alpha').val());
	const n_val = parseInt(n.value);

	var rawData = [];
	for (var i = 0; i < workload.length; i++){
		const result = calculate(workload[i],n_val*bufferPoolRatio[i]/100,alpha, baseAlg);

		var totalCost = [];
		var bMiss = [];
		var numWrites = [];
		for (var j = 0; j < result.length; j++){
			totalCost.push(result[j][1]+alpha*result[j][3]);
			bMiss.push(result[j][0]);
			numWrites.push(result[j][2]);
		}

		rawData.push([totalCost, bMiss, numWrites]);
	}
	return rawData;
}

function getPlots(data, index, ratio){
	const res = [
		{ x: ratio[0], y: data[0][index] },
		{ x: ratio[1], y: data[1][index] },
		{ x: ratio[2], y: data[2][index] },
		{ x: ratio[3], y: data[3][index] },
		{ x: ratio[4], y: data[4][index] },
		{ x: ratio[5], y: data[5][index] },
		{ x: ratio[6], y: data[6][index] },
		{ x: ratio[7], y: data[7][index] },
		{ x: ratio[8], y: data[8][index] },
		{ x: ratio[9], y: data[9][index] },
	];
	return res;
}

function updateBP(data, bufferPoolRatio){

	const type = parseInt(type_buff.value);

	const rawData = JSON.parse(JSON.stringify(data)); //deep copy raw data array

	var yCor = [];
	for (var i = 0; i < rawData.length; i++){
		yCor.push(rawData[i][type - 1]);
	}

	yCor = yCor.map(y => normalizeData(y));

	var ctx = document.querySelector('#graphBP').getContext('2d');
	if (window.four != undefined)
		window.four.destroy();
	window.four = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: [
				{
					label: $('#baseAlg_buff option:selected').text(),
					data: getPlots(yCor,0, bufferPoolRatio),
					borderColor: 'rgba(255, 99, 132, 0.5)',
					backgroundColor: 'rgba(255,99,132,0.5)',
					showLine:true,
					borderWidth:1.2,
					fill:false,
				},

				{
					label: "CONE-n",
					data: getPlots(yCor,1, bufferPoolRatio),
					borderColor: 'rgba(54, 162, 235, 0.5)',
					backgroundColor: 'rgba(54, 162, 235, 0.5)',
					borderWidth:1.2,
					showLine:true,
					fill:false,
					pointStyle:'cross'
				},

				{
					label: "CONE-Xn",
					data: getPlots(yCor,2, bufferPoolRatio),
					borderColor: 'rgba(255, 206, 86, 0.5)',
					backgroundColor: 'rgba(255, 206, 86, 0.5)',
					borderWidth:1.2,
					showLine:true,
					fill:false,
					pointStyle:'rect'
				},

				{
					label: "COW-n",
					data: getPlots(yCor,3, bufferPoolRatio),
					borderColor: 'rgba(75, 192, 192, 1)',
					backgroundColor: 'rgba(75, 192, 192, 1)',
					borderWidth:1.2,
					showLine:true,
					fill:false,
					pointStyle:'triangle'
				},

				{
					label: "COW-Xn",
					data: getPlots(yCor,4, bufferPoolRatio),
					borderColor: 'rgba(153, 50, 204, 0.5)',
					backgroundColor: 'rgba(153, 50, 204, 0.5)',
					borderWidth:1.2,
					showLine:true,
					fill:false,
					pointStyle:'star'
				},
			]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						max:1.2
					},
					gridLines: {
						display: false,
					},
					offset: true,
					scaleLabel: {
						display: true,
						labelString: "Normalized "+$('#type_buff option:selected').text()+" (w.r.t. "+$('#baseAlg_buff option:selected').text()+")",
						fontFamily: $('.graphContainer h3').css('font-family'),
						fontSize: 15,
					}
				}],
				xAxes: [{
					gridLines: {
						display: false,
					},
					barPercentage:0.5,
					scaleLabel: {
						display: true,
						labelString: 'Buffer Pool Ratio (%)',
						fontFamily:$('.graphContainer h3').css('font-family'),
						fontSize:15
					},
					ticks:{
						beginAtZero: true,
						min: 0,
						max:100,
						stepSize:5,
					},
					distribution: 'linear'
				}]
			},
			title: {
				display: true,
				text: $('#type_buff option:selected').text(),
				fontSize: 23,
				fontStyle: 'normal',
				padding: 20,
				fontColor: 'black',
				fontFamily: 'Poppins',
			},
			legend: {
				display: true,
			},
			elements: {
				line: {
					tension: 0,
				}
			},
			animation:{
				onComplete: function(animation){
					$('.spinner-buff').hide();
					$('#recalc_buff').prop('disabled', true);
					$('#graphBP').show();
				}
			}
		},
		layout:{
			padding: {
				top:5
			}
		}
	});
}
//
