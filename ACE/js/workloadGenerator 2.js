$(document).ready(function(){

	/*First & Second Graphs*/
    //input fields
    const $b = $('#b'); //buffer size
    const $n = $('#n'); //disk size
    const $x = $('#x'); //number of operations
    const $e = $('#e'); //read percentage
    const $alpha = $('#alpha'); //asymmetry
    const $s = $('#s'); //skewness
    const $d = $('#d'); //skewness data

    

    //[b,n,x,s,d,e,alpha]
    const workload1 = [250, 5000, 50000, 80, 15, 60, 8];
    const workload2 = [2500, 5000, 50000, 80, 15, 60, 8];
    const workload3 = [500, 5000, 50000, 80, 15, 90, 8];
    const workload4 = [500, 5000, 50000, 80, 15, 20, 8];
    const workload5 = [500, 10000, 50000, 95, 5, 60, 8];
    const workload6 = [500, 500, 50000, 100, 100, 60, 8];
    const test = [5, 50, 20, 80, 15, 40, 4];
    var workloads = [workload1, workload2, workload3, workload4, workload5, workload6, test];
    var inputs = [$b, $n, $x, $s, $d, $e, $alpha];
    
    //Workload Changes
    const $workload = $('#workload');
    $workload.change(function(){
    	var workloadIndex = parseInt($(this).val());
    	if (workloadIndex > 0){
    		var workload = workloads[workloadIndex - 1];
    		inputs.forEach((element, index) => {
                element.prop("disabled",true); 
                element.val(workload[index]);
            });
    	}
    	else{
    		inputs.forEach((element) => element.prop("disabled",false));
    	}
    });
    
    /*Change table titles*/
    const $alg = $('#baseAlg');
    $alg.change(function(){
    	var algx = parseInt($(this).val());
    	if (algx ==  0){
    		$("#base-alg-table-title").text("baseLRU");
            $("#ACE-alg-table-title").text("ACE-LRU");
    	}
    	else{
            $("#base-alg-table-title").text("baseCFLRU");
            $("#ACE-alg-table-title").text("ACE-CFLRU");
        }
    });

    $("#play-button").click(function(){
        calculate(generateWorkload(),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
    });

    $("#graph").click(function(){
        RWgraph();
        Bgraph();
    })


function generateWorkload(){

    var b_val = parseInt(b.value);
    var n_val = parseInt(n.value);
    var x_val = parseInt(x.value);
    var e_val = parseInt(e.value);
    var s_val = parseInt(s.value);
    var d_val = parseInt(d.value);

    //generate workload
    var pageId;
    var endPageId = n_val*(d_val/100);
    var workload = [];

    for(i = 0; i < x_val; i++){

        const typeDecider = Math.random()*100;
        const skewed = Math.random()*100;

        if (skewed < s_val)
            pageId = Math.ceil(Math.random()*endPageId);
        else
            pageId = Math.ceil(Math.random()*(n_val - endPageId) + endPageId);

        if (typeDecider < e_val)
            workload.push(['R', pageId]);
        else
            workload.push(['W', pageId]);

    }
    return workload;

}

//Generate workload with read/write ratio as parameter
function RWWorkload(e_val){

    var b_val = parseInt(b.value);
    var n_val = parseInt(n.value);
    var x_val = parseInt(x.value);
    var s_val = parseInt(s.value);
    var d_val = parseInt(d.value);

    //generate workload
    var pageId;
    var endPageId = n_val*(d_val/100);
    var workload = [];

    for(i = 0; i < x_val; i++){

        const typeDecider = Math.random()*100;
        const skewed = Math.random()*100;

        if (skewed < s_val)
            pageId = Math.ceil(Math.random()*endPageId);
        else
            pageId = Math.ceil(Math.random()*(n_val - endPageId) + endPageId);

        if (typeDecider < e_val)
            workload.push(['R', pageId]);
        else
            workload.push(['W', pageId]);

    }
    return workload;

}

//generate graph for varying Read/Write ratio
function RWgraph(){
        var temp1 = IOcalc(RWWorkload(20),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
        var temp2 = IOcalc(RWWorkload(40),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
        var temp3 = IOcalc(RWWorkload(60),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
        var temp4 = IOcalc(RWWorkload(80),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
        var RWlayout = {
            xaxis: {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showline: false,
                title: "%read/write ratio"
            },
            yaxis: {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showline: false, 
                title: "# write IO"
            },
            title: "Read/Write %"
        };
        let baseAlgTitle="";
        let ACEAlgTitle="";
        let something = parseInt($("#baseAlg").val())
        if(something == 0){
            baseAlgTitle = "base-LRU"
            ACEAlgTitle = "ACE-LRU"
        }else{
            baseAlgTitle = "base-CFLRU"
            ACEAlgTitle = "ACE-CFLRU"
        }
        var x1 = [20, 40, 60, 80];
        var y1 = [temp1[0], temp2[0], temp3[0], temp4[0]];
    
    
        var x2 = [20, 40, 60, 80];
        var y2 = [temp1[1], temp2[1], temp3[1], temp4[1]];
        
        var RWData = [
            {x: x1, y: y1, mode:"lines", name:baseAlgTitle},
            {x: x2, y: y2, mode:"lines", name:ACEAlgTitle}
        ];
        
        Plotly.newPlot('RWplot', RWData, RWlayout);
}

//generate graph for varying Buffer size
function Bgraph(){
    var temp1 = IOcalc(generateWorkload(),10, parseInt(alpha.value), parseInt($("#baseAlg").val()));
    var temp2 = IOcalc(generateWorkload(),50, parseInt(alpha.value), parseInt($("#baseAlg").val()));
    var temp3 = IOcalc(generateWorkload(),250, parseInt(alpha.value), parseInt($("#baseAlg").val()));
    var temp4 = IOcalc(generateWorkload(),1000, parseInt(alpha.value), parseInt($("#baseAlg").val()));
    var Blayout = {
        xaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            title: "Bufferpool Size"
        },
        yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false, 
            title: "# write IO"
        },
        title: "Buffer Size"
    };

    let baseAlgTitle="";
    let ACEAlgTitle="";
    let something = parseInt($("#baseAlg").val())
    if(something == 0){
        baseAlgTitle = "base-LRU"
        ACEAlgTitle = "ACE-LRU"
    }else{
        baseAlgTitle = "base-CFLRU"
        ACEAlgTitle = "ACE-CFLRU"
    }
    
    var x1 = [10, 50, 250, 1000];
    var y1 = [temp1[0], temp2[0], temp3[0], temp4[0]];


    var x2 = [10, 50, 250, 1000];
    var y2 = [temp1[1], temp2[1], temp3[1], temp4[1]];
    
    var BData = [
        {x: x1, y: y1, mode:"lines", name:baseAlgTitle},
        {x: x2, y: y2, mode:"lines", name:ACEAlgTitle}
    ];
    
    Plotly.newPlot('Bplot', BData, Blayout);
}
})