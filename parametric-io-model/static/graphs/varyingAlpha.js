//all in one graph
function getVA(workload){

	const bLen = parseInt($('#b').val());
	const base = parseInt($('#baseAlg').val());

	var rawData = [];
	const alphas = [1,2,4,8];
	
	for (var alpha of alphas){

		const result = calculate(workload,bLen,alpha,base);

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

function normalizeData(data){

	//Normalise data
	const first = data[0];
	for (var i = 0; i < data.length; i++){
		data[i] = data[i]/first;
	}
	return data;
}

function updateVA(data){

	const type = parseInt($('#type').val()) - 1;

	const rawData = JSON.parse(JSON.stringify(data)); //deep copy raw data array

	var normalized = [];
	for (var i = 0; i < rawData.length; i++){
		normalized.push(rawData[i][type]);
	}
	//for raw data
	const rawDataset = [{
		label:"n = 8",
		data: data[3][type],
		backgroundColor: 'rgba(255, 99, 132, 0.2)',
		borderColor: 'rgba(255,99,132,1)',
		borderWidth: 1,
	}]

	//for normalised data
	const normalizedDataset = [{
			label: "n = 1",
			data: normalizeData(normalized[0]),
			backgroundColor: 'rgba(255, 99, 132, 0.2)',
			borderColor: 'rgba(255,99,132,1)',
			borderWidth: 1,
		},{
			label: "n = 2",
			data: normalizeData(normalized[1]),
			backgroundColor: 'rgba(54, 162, 235, 0.2)',
			borderColor: 'rgba(54, 162, 235, 1)',
			borderWidth: 1,
		},{
			label: "n = 4",
			data: normalizeData(normalized[2]),
			backgroundColor: 'rgba(255, 206, 86, 0.2)',
			borderColor: 'rgba(255, 206, 86, 1)',
			borderWidth: 1
		},{
			label: "n = 8",
			data: normalizeData(normalized[3]),
			backgroundColor: 'rgba(75, 192, 192, 0.2)',
			borderColor: 'rgba(75, 192, 192, 1)',
			borderWidth: 1
		}];

	//y-axis max value configuration
	if (!($('#rawData').is(":checked"))){
		Chart.scaleService.updateScaleDefaults('linear', {
		    ticks: {
		        max: 1.2,
		    }
		});
	} else {
		Chart.scaleService.updateScaleDefaults('linear', {
		    ticks: {}
		});
	}

	var ctx = document.querySelector('#graph').getContext('2d');
	if (window.VAChart != undefined)
		window.VAChart.destroy();
	window.VAChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: [$('#baseAlg option:selected').text(), "COW(n)", "COW-X(n)", "COW(n,E)", "COW-X(n,E)"],
			datasets: $('#rawData').is(':checked')?rawDataset:normalizedDataset,
		},
		options: {
			annotation:$('#rawData').is(':checked')?null:{
				annotations:[{
			        type: 'line',
			        mode: 'horizontal',
			        scaleID: 'y-axis-0',
			        value: 1,
			        borderColor: 'grey',
			        borderWidth: 1,
			        label: {
			            enabled: true,
			            content: 'LRU'
			        }
			     }]
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
					},
					gridLines: {
						display: false,
					},
					offset: true,
					scaleLabel: {
						display: true,
						labelString: ($('#rawData').is(':checked')?"":'Normalized ')+$('#type option:selected').text(),
						fontFamily: $('.graphContainer h3').css('font-family'),
						fontSize: 13,
					}
				}],
				xAxes: [{
					gridLines: {
						display: false,
					},
					barPercentage:1,
					categoryPercetage:0.5,
					scaleLabel: {
						display: true,
						labelString: 'Algorithms',
						fontFamily: 'Poppins',
						fontSize:15
					}
				}]
			},
			title: {
				display: true,
				text: 'Normalized '+$('#type option:selected').text(),
				fontSize: 21,
				fontStyle: 'normal',
				fontFamily: 'Poppins',
				padding: 20,
				fontColor: 'black'
			},
			animation:{
				onComplete:function(animation){
					$('.spinner-va').hide();
					$('#graph').show();
				}
			}
		},
		layout:{
			padding: {
				top: 5
			}
		}
	});
}
//
