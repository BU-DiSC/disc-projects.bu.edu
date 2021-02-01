function getNORaw(workload){
	const bufferLength = parseInt(b.value);
	const baseAlg = parseInt(baseAlg_numOp.value);
	const alpha_val = parseInt(alpha.value);

	var data = [];
	for (var i = 0; i < workload.length; i++){
		var result = calculate(workload[i],bufferLength,alpha_val, baseAlg);
		
		var totalCost = [];
		var bMiss = [];
		var numWrites = [];
		for (var j = 0; j < result.length; j++){
			totalCost.push(result[j][1]+alpha_val*result[j][3]);
			bMiss.push(result[j][0]);
			numWrites.push(result[j][2]);
		}

		data.push([totalCost,bMiss,numWrites]);
	}

	return data;
}


function updateNO(data){

	const steps = parseInt($('#steps').val());
	const type = parseInt(type_read.value);

	var typeData = [];

	const rawData = JSON.parse(JSON.stringify(data)); //deep copy raw data array

	for (var i = 0; i < rawData.length; i++){
		typeData.push(rawData[i][type - 1]);
	}

	var normalized = [];

	for (var i = 0; i < 5; i++){
		var baseArray = [];
		for (var j = 0; j < typeData.length; j++){
			baseArray.push(typeData[j][i]);
		}
		normalized.push(baseArray);
	}

	for (var i = 0; i < normalized[0].length; i++){
		const first = normalized[0][i];
		for (var j = 0; j < normalized.length; j++){
			normalized[j][i] = normalized[j][i]/first;
		}
	}

	var ctx = document.querySelector('#graphNO').getContext('2d');
	if (window.numOpGraph != undefined)
		window.numOpGraph.destroy();
	window.numOpGraph = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [steps, steps * 2, steps * 3, steps * 4, steps * 5, steps * 6, steps * 7, steps * 8, steps * 9, steps * 10],
			datasets: [
				{
					label: $('#baseAlg_numOp option:selected').text(),
					data: normalized[0],
					backgroundColor: 'rgba(255, 99, 132, 0.2)',
					borderColor: 'rgba(255,99,132,1)',
					borderWidth: 1,
					fill: false,
				},

				// {
				// 	label: "COW(n,E)",
				// 	data: normalized[1],
				// 	backgroundColor: 'rgba(54, 162, 235, 0.2)',
				// 	borderColor: 'rgba(54, 162, 235, 1)',
				// 	borderWidth: 1,
				// 	fill: false,
				// 	pointStyle:'cross'
				// },

				// {
				// 	label: "COW-X(n,E)",
				// 	data: normalized[2],
				// 	backgroundColor: 'rgba(255, 206, 86, 0.2)',
				// 	borderColor: 'rgba(255, 206, 86, 1)',
				// 	borderWidth: 1,
				// 	fill: false,
				// 	pointStyle:'rect'
				// },

				{
					label: "COW(n)",
					data: normalized[3],
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					fill: false,
					pointStyle:'triangle'
				},

				{
					label: "COW-X(n)",
					data: normalized[4],
					backgroundColor: 'rgba(153, 50, 204, 0.2)',
					borderColor: 'rgba(153, 50, 204, 1)',
					borderWidth: 1,
					fill: false,
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
						labelString: "Normalized "+$('#type_numOp option:selected').text()+" (w.r.t. "+$('#baseAlg_numOp option:selected').text()+")",
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
						labelString: 'Number of Operations',
						fontFamily:$('.graphContainer h3').css('font-family'),
						fontSize:15
					},
					ticks:{
						beginAtZero: true
					}
				}]
			},
			title: {
				display: true,
				text: $('#type_numOp option:selected').text(),
				fontSize: 23,
				fontStyle: 'normal',
				padding: 20,
				fontColor: 'black',
				fontFamily: 'Poppins',
			},
			legend: {
				display: true,
				labels:{
					usePointStyle:true,
				}
			},
			elements: {
				line: {
					tension: 0,
				}
			},
			animation:{
				onComplete: function(animation){
					$('.spinner-numOp').hide();
					$('#recalc_numOp').prop('disabled', true);
					$('#graphNO').show();
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
