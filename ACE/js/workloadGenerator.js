$(document).ready(function(){
    var playing = false;

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
    const workload1 = [100, 5000, 50000, 80, 15, 60, 12];
    const workload2 = [250, 5000, 50000, 80, 15, 60, 12];
    const workload3 = [150, 5000, 50000, 80, 15, 90, 12];
    const workload4 = [150, 5000, 50000, 80, 15, 20, 12];
    const workload5 = [150, 10000, 50000, 95, 5, 60, 12];
    const workload6 = [150, 500, 50000, 100, 100, 60, 12];
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
        playing = false;
    });
    
    /*Change table titles*/
    const $alg = $('#baseAlg');
    $alg.change(function(){
    	var algx = parseInt($(this).val());
    	if (algx ==  0){
    		$("#base-alg-table-title").text("LRU");
            $("#ACE-alg-table-title").text("ACE-LRU");
    	}
    	else if(algx == 1){
            $("#base-alg-table-title").text("CFLRU");
            $("#ACE-alg-table-title").text("ACE-CFLRU");
        }else{
            $("#base-alg-table-title").text("LRUWSR");
            $("#ACE-alg-table-title").text("ACE-LRUWSR");
        }
        playing = false;
    });

    $("#play-button").click(function(){
        if(capacity()){
            if(!playing){
                calculate(generateWorkload(),parseInt(b.value), parseInt(alpha.value), parseInt($("#baseAlg").val()));
            }
            playing = true;
        }
    });

    $("#finish-button").click(function(){
        playing = false;
    });

    var progress = 0;
    var g = document.createElement("progress");
    var graphDone = false;
    $("#graph").click(function(){
        if(graphDone){
            alert("hi there")
            progress = 0;
            $("#Bplot").delete();
            $("#RWplot").delete();
        }

        g.setAttribute("value", progress);
        g.setAttribute("max", "22");
        document.getElementById("loadingbar").appendChild(g);
       
        RWgraph();
        Bgraph();
        graphDone = true
    });

function update(p){
    g.setAttribute("value", p);
}

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
    var LRUWSRx1 = [];
    var LRUWSRy1 = [];
    var LRUWSRx2 = [];
    var LRUWSRy2 = [];

    (function myLoop(i) {
        setTimeout(function() {
            progress++;
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

            var LRUWSRstats = IOcalc(RWWorkload(i),b, a, 2);
            LRUWSRx1.push(i);
            LRUWSRy1.push(LRUWSRstats[0] * .4);
            LRUWSRx2.push(i);
            LRUWSRy2.push(LRUWSRstats[1] * .4);

            update(progress);
            
        if (i < 100){
            i+=10;
            myLoop(i);
        }
        else if(i == 100){
            {
            var LRUtrace = {

                x: LRUx1, 
                y: LRUy1, 
                mode:"scatter", 
                name:"LRU",
                marker: {
                    size: 12,
                    symbol: 'circle-open'
                }
            }
        
            var ACELRUtrace = {
        
                x: LRUx2, 
                y: LRUy2, 
                mode:"scatter", 
                name:"ACELRU",
                marker: {
                    size: 12,
                    symbol: 'diamond-open'
                }
            }
        
            var CFLRUtrace = {
        
                x: CFLRUx1, 
                y: CFLRUy1, 
                mode:"scatter", 
                name:"CFLRU",
                marker: {
                    size: 12,
                    symbol: 'square-open'
                }
            }
        
            var ACECFLRUtrace = {
        
                x: CFLRUx2, 
                y: CFLRUy2, 
                mode:"scatter", 
                name:"ACECFLRU",
                marker: {
                    size: 12,
                    symbol: 'x-open'
                }
            }
        
            var LRUWSRtrace = {
        
                x: LRUWSRx1, 
                y: LRUWSRy1, 
                mode:"scatter", 
                name:"LRUWSR",
                marker: {
                    size: 12,
                    symbol: 'triangle-up-open'
                }
            }
        
            var ACELRUWSRtrace = {
        
                x: LRUWSRx2, 
                y: LRUWSRy2, 
                mode:"scatter", 
                name:"ACELRUWSR",
                marker: {
                    size: 12,
                    symbol: 'triangle-down-open'
                }
            }
        
            var RWlayout = {
                xaxis: {
                    autorange: true,
                    showgrid: false,
                    zeroline: false,
                    showline: true,
                    title: "%read/write ratio"
                },
                yaxis: {
                    autorange: true,
                    showgrid: false,
                    zeroline: false,
                    showline: true, 
                    title: "Workload latency (ms)"
                },
                title: "Read/Write %"
            };
            
            var RWData = [LRUtrace, ACELRUtrace, CFLRUtrace, ACECFLRUtrace, LRUWSRtrace, ACELRUWSRtrace];
            
            Plotly.newPlot('RWplot', RWData, RWlayout);
            progress++;
            }
          }
        }, 100)
    })(0);     
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
    var LRUWSRx1 = [];
    var LRUWSRy1 = [];
    var LRUWSRx2 = [];
    var LRUWSRy2 = [];

    (function myLoop(i) {
        setTimeout(function() {
            progress++;
            var LRUstats = IOcalc(generateWorkload(),ops*(i/100), a, 0);
            LRUx1.push(i);
            LRUy1.push(LRUstats[0] * .4);
            LRUx2.push(i);
            LRUy2.push(LRUstats[1] * .4);

            var CFLRUstats = IOcalc(generateWorkload(),ops*(i/100), a, 1);
            CFLRUx1.push(i);
            CFLRUy1.push(CFLRUstats[0] * .4);
            CFLRUx2.push(i);
            CFLRUy2.push(CFLRUstats[1] * .4);

            var LRUWSRstats = IOcalc(generateWorkload(),ops*(i/100), a, 2);
            LRUWSRx1.push(i);
            LRUWSRy1.push(LRUWSRstats[0] * .4);
            LRUWSRx2.push(i);
            LRUWSRy2.push(LRUWSRstats[1] * .4);
            update(progress);
            
        if (i < 20){
            i+=2;
            myLoop(i);
        }
        else if(i > 20){
            {
                var LRUtrace = {

                    x: LRUx1, 
                    y: LRUy1, 
                    mode:"scatter", 
                    name:"LRU",
                    marker: {
                        size: 12,
                        symbol: 'circle-open'
                    }
                }
                
                var ACELRUtrace = {
            
                    x: LRUx2, 
                    y: LRUy2, 
                    mode:"scatter", 
                    name:"ACELRU",
                    marker: {
                        size: 12,
                        symbol: 'diamond-open'
                    }
                }
            
                var CFLRUtrace = {
            
                    x: CFLRUx1, 
                    y: CFLRUy1, 
                    mode:"scatter", 
                    name:"CFLRU",
                    marker: {
                        size: 12,
                        symbol: 'square-open'
                    }
                }
            
                var ACECFLRUtrace = {
            
                    x: CFLRUx2, 
                    y: CFLRUy2, 
                    mode:"scatter", 
                    name:"ACECFLRU",
                    marker: {
                        size: 12,
                        symbol: 'x-open'
                    }
                }
            
                var LRUWSRtrace = {
            
                    x: LRUWSRx1, 
                    y: LRUWSRy1, 
                    mode:"scatter", 
                    name:"LRWSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-up-open'
                    }
                }
            
                var ACELRUWSRtrace = {
            
                    x: LRUWSRx2, 
                    y: LRUWSRy2, 
                    mode:"scatter", 
                    name:"ACELRUWSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-down-open'
                    }
                }
            
                var BData = [LRUtrace, ACELRUtrace, CFLRUtrace, ACECFLRUtrace, LRUWSRtrace, ACELRUWSRtrace];
                
                var Blayout = {
                    xaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: true,
                        title: "Bufferpool size (% of Workload)"
                    },
                    yaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: true, 
                        title: "Workload latency (ms)"
                    },
                    title: "Buffer Size"
                };
                console.log("graph");
                Plotly.newPlot('Bplot', BData, Blayout);
                progress++;
            }
          }
        }, 100)
        
    })(1);
}

//check if input values are too high
function capacity(){

    if( parseInt(b.value) > 500 || parseInt(b.value) < 0){
        window.alert("buffer pool size is too large or invalid");
    }
    else if(parseInt(n.value) > 10000 || parseInt(n.value) < parseInt(b.value)){
        window.alert("disk size is too large");
    }
    else if(parseInt(x.value) > 100000 || parseInt(x.value) < parseInt(b.value)){
        window.alert("workload size is too large");
    }
    else if(parseInt(e.value) > 100 || parseInt(e.value) < 0){
        window.alert("read ratio cannot exceed 100%");
    }
    else if(parseInt(alpha.value) > 20 || parseInt(alpha.value) < 0){
        window.alert("current SSD concurrency is too large or invalid");
    }
    else if(parseInt(s.value) > 100 || parseInt(s.value) < 0){
        window.alert("skewness cannot exceed 100% or be negative");
    }
    else if(true){
        return true;
    }

    inputs.forEach((element, index) => {
        element.prop("disabled",true); 
        element.val(workload1[index]);
    });
}

})


  