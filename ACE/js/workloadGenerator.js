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
    
    var b = parseInt($("#b").val())
    var a = parseInt($("#alpha").val());

    var LRUx1 = [];
    var LRUy1 = [];
    var LRUx2 = [];
    var LRUy2 = [];
    var CFLRUx1 = [];
    var CFLRUy1 = [];
    var CFLRUx2 = [];
    var CFLRUy2 = [];

    for(var i = 0; i < 100; i+=10){
        var LRUstats = IOcalc(RWWorkload(i),b, a, 0);
        LRUx1.push(i);
        LRUy1.push(LRUstats[0] * .4);
        LRUx2.push(i);
        LRUy2.push(LRUstats[1] * .4);

        var CFLRUstats = IOcalc(RWWorkload(i),b, a, 1);
        CFLRUx1.push(i);
        CFLRUy1.push(CFLRUstats[0] * .4);
        CFLRUx2.push(i);
        CFLRUy2.push(CFLRUstats[1] * .4);
    }

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
                title: "Workload latency (ms)"
            },
            title: "Read/Write %"
        };
        
        var RWData = [
            {x: LRUx1, y: LRUy1, mode:"scatter", name:"Base LRU"},
            {x: LRUx2, y: LRUy2, mode:"scatter", name:"ACE LRU"},
            {x: CFLRUx1, y: CFLRUy1, mode:"scatter", name:"Base CFLRU"},
            {x: CFLRUx2, y: CFLRUy2, mode:"scatter", name:"ACE CFLRU"},
        ];
        
        Plotly.newPlot('RWplot', RWData, RWlayout);
}

//generate graph for varying Buffer size
function Bgraph(){

    var ops = parseInt($('#x').val());
    var a = parseInt($("#alpha").val());

    var LRUx1 = [];
    var LRUy1 = [];
    var LRUx2 = [];
    var LRUy2 = [];
    var CFLRUx1 = [];
    var CFLRUy1 = [];
    var CFLRUx2 = [];
    var CFLRUy2 = [];

    for(var i = 1; i < 20; i = i += 2){
        var LRUstats = IOcalc(generateWorkload(),ops/100*i, a, 0);
        LRUx1.push(i);
        LRUy1.push(LRUstats[0] * .4);
        LRUx2.push(i);
        LRUy2.push(LRUstats[1] * .4);

        var CFLRUstats = IOcalc(generateWorkload(),i, a, 1);
        CFLRUx1.push(i);
        CFLRUy1.push(CFLRUstats[0] * .4);
        CFLRUx2.push(i);
        CFLRUy2.push(CFLRUstats[1] * .4);
    }

        var Blayout = {
            xaxis: {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showline: false,
                title: "Bufferpool size"
            },
            yaxis: {
                autorange: true,
                showgrid: false,
                zeroline: false,
                showline: false, 
                title: "Workload latency (ms)"
            },
            title: "Buffer Size"
        };
        
        var BData = [
            {x: LRUx1, y: LRUy1, mode:"scatter", name:"Base LRU"},
            {x: LRUx2, y: LRUy2, mode:"scatter", name:"ACE LRU"},
            {x: CFLRUx1, y: CFLRUy1, mode:"scatter", name:"Base CFLRU"},
            {x: CFLRUx2, y: CFLRUy2, mode:"scatter", name:"ACE CFLRU"},
        ];
        
        Plotly.newPlot('Bplot', BData, Blayout);
    
}
})