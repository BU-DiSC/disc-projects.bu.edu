
setTimeout(scenario1, 200);
// setTimeout(function(){ 
//   $(document).ready(function(){
//     $('[data-toggle="tooltip"]').tooltip({
//      'delay': { show: 0, hide: 0 }
//     }); 
//   });
// }, 50);

// $('a').tooltip({
     // 'delay': { show: 5000, hide: 3000 }
// });

function initChart() {

    var monkeyTiering = {
        y: [-1],
        x: [-1],
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Monkey - Tiering',
        text: [ "" ],
        marker: { size: 7, symbol: 'circle' },
        line: {width: 1}
    };

    var monkeyLeveling = {
        y: [-1],
        x: [-1],
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Monkey - Leveling',
        text: [ "" ],
        marker: { size: 7, symbol: 'circle'},
        line: {width: 1}
    };

    var state_of_artTiering = {
        y: [-1],
        x: [-1],
        mode: 'lines+markers',
        type: 'scatter',
        name: 'State-of-the-art - Tiering',
        text: [ "" ],
        marker: { size: 7, symbol: 'square'  },
        line: {width: 1}
    };

    var state_of_artLeveling = {
        y: [-1],
        x: [-1],
        mode: 'lines+markers',
        type: 'scatter',
        name: 'State-of-the-art - Leveling',
        text: [ "" ],
        marker: { size: 7, symbol: 'square' },
        line: {width: 1}
    };

    var selected_point = {
        y: [-1],
        x: [-1],
        mode: 'markers',
        type: 'scatter',
        name: 'Selected point',
        text: [ "" ],
        marker: { size: 13, symbol: 'star', color: 'black' },
        line: {width: 1}
    };

  var monkeyPoint = {
        y: [-1],
        x: [-1],
        mode: 'markers',
        type: 'scatter',
        name: 'Monkey - Selected Configuration',
        text: [ "" ],
        marker: { size: 13, symbol: 'star', color: 'black' },
        line: {width: 1}
    };

    var stateOfArtPoint = {
        y: [-1],
        x: [-1],
        mode: 'markers',
        type: 'scatter',
        name: 'State-of-the-art - Selected Configuration',
        text: [ "" ],
        marker: { size: 11, symbol: 'cross', color: 'black' },
        line: {width: 1}
    };

    var data = [ state_of_artTiering, state_of_artLeveling, stateOfArtPoint, monkeyTiering , monkeyLeveling, monkeyPoint];

    var xmin=0;
    var ymin=0;
    var xmax=2;
    var ymax=2;

    var layout = 
    { 
        xaxis: {
            title: 'Update cost (I/Os)',
            range: [ xmin, xmax ] 
        },
        yaxis: {
            title: 'Lookup cost (I/Os)',
            range: [ymin, ymax]
        },
        //title:'Pareto frontiers for State-of-the-art and Monkey Tuning'
        title:''
    };

    Plotly.newPlot('myDiv', data, layout);


}

function addPoint(tieringVsLeveling, T, mfilter, conf, monkeyTW, monkeyTR, monkeyT_Ratio, use_monkey) {
                var meetingR;
                var N_used = conf.N * (T-1) / T;
                if (use_monkey) {
                    meetingR = get_accurate_R(mfilter / 1024, T, N_used, conf.B, conf.P, tieringVsLeveling);
                }
                else {
                    meetingR = get_R_uniform_strategy(mfilter  / 1024, T, N_used, conf.B, conf.P, tieringVsLeveling);
                }
                var meetingW = get_W(N_used, T, conf.B, conf.P, tieringVsLeveling);
                    monkeyTW.push(meetingW.toFixed(4));
                    monkeyTR.push(meetingR.toFixed(3));
                    monkeyT_Ratio.push("Ratio: "+T);   
                return {W: meetingW, R: meetingR};
}





function drawChart() {

    var inputParameters = parseInputTextBoxes();

    var N=inputParameters.N;
    var E=inputParameters.E;
    var mbuffer=inputParameters.mbuffer;
    var T=inputParameters.T;
    var mfilter=inputParameters.mfilter;
    var P=inputParameters.P;
    var isLeveled=inputParameters.isLeveled;

    var conf = new LSM_config();
    conf.T=-1;
    conf.L=-1;
    conf.P=mbuffer / P;
    conf.N=N;
    conf.M=mbuffer+mfilter;
    conf.E=E;
    conf.B=P/E;

    var smoothing=false;
//print_csv_experiment(input_conf, num_commas, print_details, fix_buffer_size = -1, use_monkey = true, smoothing = false, differentiate_tiered_leveled = true) 
    var monkey_pareto = print_csv_experiment(conf, 0, false, mbuffer, true, smoothing)
    var state_of_art_pareto = print_csv_experiment(conf, 0, false, mbuffer, false, smoothing)

    var monkeyTW = new Array();
    var monkeyTR = new Array();
    var monkeyT_Ratio= new Array();
    var monkeyLW = new Array();
    var monkeyLR = new Array();
    var monkeyL_Ratio= new Array();

    // console.log("isLeveled  " + isLeveled + " \n");
    var part1_monkey_point = getPoint(isLeveled, T, mfilter, conf, 1);
    var part1_state_of_the_art_point = getPoint(isLeveled, T, mfilter, conf, 0);
    //console.log("leveltier  " + leveltier);
    // console.log(part1_monkey_point);
    // console.log(part1_state_of_the_art_point);

    /*var p1 = getPoint(leveltier, T, mfilter, conf, 0);
    var p2 = getPoint(!leveltier, T, mfilter, conf, 0);
    console.log("test");
    console.log(p1);
    console.log(p2);*/


    for (var i=0;i<monkey_pareto.length;i++)
    {
        if (monkey_pareto[i].L==0)
        {
            if (monkey_pareto[i].T > 4) {
                monkeyTW.push(monkey_pareto[i].W.toFixed(4));
                monkeyTR.push(monkey_pareto[i].R.toFixed(3));
                monkeyT_Ratio.push("Ratio: " + monkey_pareto[i].T);
            }
        }
        else
        {
            if (monkeyLW.length==0)
            {
                addPoint(0, 4, mfilter, conf, monkeyTW, monkeyTR, monkeyT_Ratio, 1);
                addPoint(0, 3, mfilter, conf, monkeyTW, monkeyTR, monkeyT_Ratio, 1);
                addPoint(0, 2, mfilter, conf, monkeyTW, monkeyTR, monkeyT_Ratio, 1);
                addPoint(1, 2, mfilter, conf, monkeyLW, monkeyLR, monkeyL_Ratio, 1);
                addPoint(1, 3, mfilter, conf, monkeyLW, monkeyLR, monkeyL_Ratio, 1);
                addPoint(1, 4, mfilter, conf, monkeyLW, monkeyLR, monkeyL_Ratio, 1);
            }
            if (monkey_pareto[i].T > 4) {
                monkeyLW.push(monkey_pareto[i].W.toFixed(4));
                monkeyLR.push(monkey_pareto[i].R.toFixed(3));
                monkeyL_Ratio.push("Ratio: " + monkey_pareto[i].T);
            }
        }
    }

    var state_of_artTW = new Array();
    var state_of_artTR = new Array();
    var state_of_artT_Ratio= new Array();
    var state_of_artLW = new Array();
    var state_of_artLR = new Array();
    var state_of_artL_Ratio= new Array();
    var meetSoA_R,meetSoA_W;
    var highestSoA_R;
    for (var i=0;i<state_of_art_pareto.length;i++)
    {
        if (state_of_art_pareto[i].L==0)
        {
            if (state_of_artTW.length == 0) {
                highestSoA_R = state_of_art_pareto[i].R;
                highestSoA_W = state_of_art_pareto[i].W;
            }
            if (state_of_art_pareto[i].T > 4) {
                state_of_artTW.push(state_of_art_pareto[i].W.toFixed(4));
                state_of_artTR.push(state_of_art_pareto[i].R.toFixed(3));
                state_of_artT_Ratio.push("Ratio: "+state_of_art_pareto[i].T);
            }
        }
        else
        {
            if (state_of_artLW.length==0)
            {
                addPoint(0, 4, mfilter, conf, state_of_artTW, state_of_artTR, state_of_artT_Ratio, 0);
                addPoint(0, 3, mfilter, conf, state_of_artTW, state_of_artTR, state_of_artT_Ratio, 0);
                addPoint(0, 2, mfilter, conf, state_of_artTW, state_of_artTR, state_of_artT_Ratio, 0);
                var meeting_point = addPoint(1, 2, mfilter, conf, state_of_artLW, state_of_artLR, state_of_artL_Ratio, 0);
                addPoint(1, 3, mfilter, conf, state_of_artLW, state_of_artLR, state_of_artL_Ratio, 0);
                addPoint(1, 4, mfilter, conf, state_of_artLW, state_of_artLR, state_of_artL_Ratio, 0);
                
                meetSoA_R = meeting_point.R;
                meetSoA_W = meeting_point.W;
            }
            if (state_of_art_pareto[i].T > 4) {
              state_of_artLW.push(state_of_art_pareto[i].W.toFixed(4));
               state_of_artLR.push(state_of_art_pareto[i].R.toFixed(3));
               state_of_artL_Ratio.push("Ratio: "+state_of_art_pareto[i].T);
            }   
        }
    }





    var monkeyPoint = {
        y: [part1_monkey_point.R],
        x: [part1_monkey_point.W],
        mode: 'markers',
        type: 'scatter',
        name: 'Monkey - Selected Configuration',
        text: [ "Ratio: "+T ],
        marker: { size: 13, symbol: 'star', color: 'black' },
        line: {width: 1}
    };

    var stateOfArtPoint = {
        y: [part1_state_of_the_art_point.R],
        x: [part1_state_of_the_art_point.W],
        mode: 'markers',
        type: 'scatter',
        name: 'State-of-the-art - Selected Configuration',
        text: [ "Ratio: "+T ],
        marker: { size: 11, symbol: 'cross', color: 'black' },
        line: {width: 1}
    };


    var monkeyTiering = {
        y: monkeyTR,
        x: monkeyTW,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Monkey - Tiering',
        text: monkeyT_Ratio,
        marker: { size: 7, symbol: 'circle' },
        line: {width: 1}
    };

    var monkeyLeveling = {
        y: monkeyLR,
        x: monkeyLW,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'Monkey - Leveling',
        // text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
        text: monkeyL_Ratio,
        marker: { size: 7, symbol: 'circle'},
        line: {width: 1}
    };

    var state_of_artTiering = {
        y: state_of_artTR,
        x: state_of_artTW,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'State-of-the-art - Tiering',
        text: state_of_artT_Ratio,
        marker: { size: 7, symbol: 'square' },
        line: {width: 1}
    };

    var state_of_artLeveling = {
        y: state_of_artLR,
        x: state_of_artLW,
        mode: 'lines+markers',
        type: 'scatter',
        name: 'State-of-the-art - Leveling',
        // text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
        text: state_of_artL_Ratio,
        marker: { size: 7, symbol: 'square' },
        line: {width: 1}
    };



    var data = [ state_of_artTiering, state_of_artLeveling, stateOfArtPoint, monkeyTiering , monkeyLeveling, monkeyPoint];


    var xmin=0;
    var ymin=0;
    var xmax=meetSoA_W*3;
    var ymax=Math.min(highestSoA_R, meetSoA_R*3);

    var layout = 
    { 
        xaxis: {
            title: 'Update cost (I/Os)',
            range: [ xmin, xmax ] 
        },
        yaxis: {
            title: 'Lookup cost (I/Os)',
            range: [ymin, ymax]
        },
        //title:'Pareto frontiers for State-of-the-art and Monkey Tuning'
        title:''
    };

    Plotly.newPlot('myDiv', data, layout);

}

