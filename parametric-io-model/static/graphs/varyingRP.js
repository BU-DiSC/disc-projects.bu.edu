function getRPRaw(workload){
	const baseAlg = parseInt(baseAlg_read.value);
	const alpha_val = parseInt(alpha.value);
	const b_val = parseInt(b.value);

	var data = [];
	for (var i = 0; i < workload.length; i++){
		const result = calculate(workload[i],b_val,alpha_val, baseAlg);

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

function updateRP(data){

	var typeData = [];
	const type = parseInt(type_read.value);

	const rawData = JSON.parse(JSON.stringify(data)); //deep copy raw data array

	for (var i = 0; i < rawData.length; i++){
		typeData.push(normalizeData(rawData[i][type - 1]));
	}

	var normalized = [];
	for (var i = 0; i < 5; i++){
		var baseArray = [];
		for (var j = 0; j < typeData.length; j++){
			baseArray.push(typeData[j][i]);
		}
		normalized.push(baseArray);
	}

	var ctx = document.querySelector('#graphRP').getContext('2d');
	if (window.readGraph != undefined)
		window.readGraph.destroy();
	window.readGraph = new Chart(ctx, {
		type: 'line',
		data: {
			labels: ["5%","20%", "35%", "50%", "65%", "80%", "95%"],
			datasets: [
				{
					label: $('#baseAlg_read option:selected').text(),
					data: normalized[0],
					backgroundColor: 'rgba(255, 99, 132, 0.2)',
					borderColor: 'rgba(255,99,132,1)',
					borderWidth: 1,
					fill: false,
				},

				{
					label: "CONE-n",
					data: normalized[1],
					backgroundColor: 'rgba(54, 162, 235, 0.2)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1,
					fill: false,
				},

				{
					label: "CONE-Xn",
					data: normalized[2],
					backgroundColor: 'rgba(255, 206, 86, 0.2)',
					borderColor: 'rgba(255, 206, 86, 1)',
					borderWidth: 1,
					fill: false,
				},

				{
					label: "COW-n",
					data: normalized[3],
					backgroundColor: 'rgba(75, 192, 192, 0.2)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 1,
					fill: false,
				},

				{
					label: "COW-Xn",
					data: normalized[4],
					backgroundColor: 'rgba(153, 50, 204, 0.2)',
					borderColor: 'rgba(153, 50, 204, 1)',
					borderWidth: 1,
					fill: false,
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
						labelString: "Normalized "+$('#type_read option:selected').text()+" (w.r.t. "+$('#baseAlg_read option:selected').text()+")",
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
						labelString: 'Read Percentage',
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
				text: $('#type_read option:selected').text(),
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
					$('.spinner-read').hide();
					$('#recalc_read').prop('disabled', true);
					$('#graphRP').show();
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
