$(document).ready(function(){
    $("#b, #n, #x, #s, #d, #e, #alpha").prop("disabled", false);
    $("#cmp-b-rw, #cmp-n-rw, #cmp-x-rw, #cmp-s-rw, #cmp-d-rw, #cmp-e-rw, #cmp-alpha-rw").prop("disabled", false);
    $("#cmp-b-bp, #cmp-n-bp, #cmp-x-bp, #cmp-s-bp, #cmp-d-bp, #cmp-e-bp, #cmp-alpha-bp").prop("disabled", false);
    var playing = false;

	/*First & Second Graphs*/
    //input fields
    const $b = $('#b'); //buffer size
    const $n = $('#n'); //disk size
    const $x = $('#x'); //number of operations
    const $e = $('#e'); //read percentage
    const $alpha = $('#alpha'); //asymmetry
    const $s = $('#s'); //skewness
    const $d = $('#d'); // skewness data

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
// Workload Changes
// Workload Changes for Interactive & Comparative Experiments
// Workload Changes for Interactive & Comparative Experiments
$(document).on("change", "#workload, #cmp-workload-rw, #cmp-workload-bp", function() {
    var workloadIndex = parseInt($(this).val());
    var id = $(this).attr("id");

    console.log("Workload changed:", id, "Index:", workloadIndex);

    var ids = [];
    
    if (id === "workload") {
        ids = ["b", "n", "x", "s", "d", "e", "alpha"];
    } else if (id === "cmp-workload-rw") {
        ids = ["cmp-b-rw", "cmp-n-rw", "cmp-x-rw", "cmp-s-rw", "cmp-d-rw", "cmp-e-rw", "cmp-alpha-rw"];
    } else if (id === "cmp-workload-bp") {
        ids = ["cmp-b-bp", "cmp-n-bp", "cmp-x-bp", "cmp-s-bp", "cmp-d-bp", "cmp-e-bp", "cmp-alpha-bp"];
    }

    if (workloadIndex > 0 && workloadIndex <= workloads.length) {
        var workload = workloads[workloadIndex - 1];

        console.log("Selected Workload Values:", workload);

        ids.forEach((fieldId, index) => {
            var element = $("#" + fieldId);
            if (element.length) {
                element.val(workload[index]); // ✅ Set workload values
                element.prop("disabled", false); // ✅ Keep fields editable
                console.log(`Updated ${fieldId} → ${workload[index]}`);
            } else {
                console.warn(`Field ${fieldId} not found!`);
            }
        });

        console.log("Workload updated successfully.");
    } else {
        // Enable manual input if "Custom Workload" is selected
        ids.forEach((fieldId) => $("#" + fieldId).prop("disabled", false));
    }

    playing = false;
});




    
    // Change table titles when algorithm changes
    $(document).on("change", "#baseAlg, #cmp-baseAlg", function(){
        var isComparative = $("#comparative-analysis").is(":visible");
        var selectedAlg = parseInt($(this).val());

        if (isComparative) {
            $("#cmp-baseAlg").val(selectedAlg);
        } else {
            $("#baseAlg").val(selectedAlg);
        }

        var titles = {
            0: ["LRU", "ACE-LRU"],
            1: ["CFLRU", "ACE-CFLRU"],
            2: ["LRUWSR", "ACE-LRUWSR"]
        };

        $("#base-alg-table-title").text(titles[selectedAlg][0]);
        $("#ACE-alg-table-title").text(titles[selectedAlg][1]);

        playing = false;
    });

    // Play button handler
$("#play-button").click(function(){
    if(capacity()){
        if (!playing) { // ✅ Prevent unnecessary resets
            var isComparative = $("#comparative-analysis").is(":visible");
            var b_val = parseInt($(isComparative ? "#cmp-b" : "#b").val());
            var alpha_val = parseInt($(isComparative ? "#cmp-alpha" : "#alpha").val());
            var baseAlg = parseInt($(isComparative ? "#cmp-baseAlg" : "#baseAlg").val());

            playing = true; // ✅ Set BEFORE calling calculate()
            calculate(generateWorkload(), b_val, alpha_val, baseAlg);
        }
    }
});


    $("#finish-button").click(function(){
        playing = false;
    });

    var progress = 0;
    var g = document.createElement("progress");
    var graphDone = false;
    $("#graph").click(function() {
        console.log("User clicked 'Run Experiment'. Generating updated plots...");
    
        progress = 0;  // Reset progress
    
        // 🔹 Do NOT clear the previous graphs
        // $("#Bplot").empty();
        // $("#RWplot").empty();
    
        g.setAttribute("value", progress);
        g.setAttribute("max", "23");
        document.getElementById("loadingbar").appendChild(g);
    
        RWgraph();  // Now the RW plot updates only when the user clicks the button
        Bgraph();   // Buffer pool graph updates only when the user clicks the button
    });
    
    

function update(p){
    g.setAttribute("value", p);
}

function generateWorkload(){
    var isComparative = $("#comparative-analysis").is(":visible");
    var isRW = $("#cmp-workload-rw").is(":visible");
    var isBP = $("#cmp-workload-bp").is(":visible");

    var b_val, n_val, x_val, e_val, s_val, d_val;

    if (isComparative) {
        if (isRW) {
            b_val = parseInt($("#cmp-b-rw").val());
            n_val = parseInt($("#cmp-n-rw").val());
            x_val = parseInt($("#cmp-x-rw").val());
            e_val = parseInt($("#cmp-e-rw").val());
            s_val = parseInt($("#cmp-s-rw").val());
            d_val = parseInt($("#cmp-d-rw").val());
        } else if (isBP) {
            b_val = parseInt($("#cmp-b-bp").val());
            n_val = parseInt($("#cmp-n-bp").val());
            x_val = parseInt($("#cmp-x-bp").val());
            e_val = parseInt($("#cmp-e-bp").val());
            s_val = parseInt($("#cmp-s-bp").val());
            d_val = parseInt($("#cmp-d-bp").val());
        }
    } else {
        // Individual experiment
        b_val = parseInt($("#b").val());
        n_val = parseInt($("#n").val());
        x_val = parseInt($("#x").val());
        e_val = parseInt($("#e").val());
        s_val = parseInt($("#s").val());
        d_val = parseInt($("#d").val());
    }

    // Generate workload
    var pageId;
    var endPageId = n_val * (d_val / 100);
    var workload = [];

    for (let i = 0; i < x_val; i++) {
        const typeDecider = Math.random() * 100;
        const skewed = Math.random() * 100;

        if (skewed < s_val)
            pageId = Math.ceil(Math.random() * endPageId);
        else
            pageId = Math.ceil(Math.random() * (n_val - endPageId) + endPageId);

        if (typeDecider < e_val)
            workload.push(['R', pageId]);
        else
            workload.push(['W', pageId]);
    }
    return workload;
}



//Generate workload with read/write ratio as parameter
function RWWorkload(e_val) {
    var isComparative = $("#comparative-analysis").is(":visible");

    var b_val = parseInt($(isComparative ? "#cmp-b-rw" : "#b").val());
    var n_val = parseInt($(isComparative ? "#cmp-n-rw" : "#n").val());
    var x_val = parseInt($(isComparative ? "#cmp-x-rw" : "#x").val());
    var s_val = parseInt($(isComparative ? "#cmp-s-rw" : "#s").val());
    var d_val = parseInt($(isComparative ? "#cmp-d-rw" : "#d").val());

    var pageId;
    var endPageId = n_val * (d_val / 100);
    var workload = [];

    for (let i = 0; i < x_val; i++) {
        const typeDecider = Math.random() * 100;
        const skewed = Math.random() * 100;

        pageId = (skewed < s_val) ? 
            Math.ceil(Math.random() * endPageId) : 
            Math.ceil(Math.random() * (n_val - endPageId) + endPageId);

        workload.push(typeDecider < e_val ? ['R', pageId] : ['W', pageId]);
    }
    return workload;
}



//generate graph for varying Read/Write ratio
function RWgraph(){

    var isComparative = $("#comparative-analysis").is(":visible");
    var b = parseInt($(isComparative ? "#cmp-b-rw" : "#b").val());
    var a = parseInt($(isComparative ? "#cmp-alpha-rw" : "#alpha").val());

    

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

    var LRUstats = [];
    var CFLRUstats = [];
    var LRUWSRstats = [];

    var LRUtrace = {};
    var ACELRUtrace = {};
    var CFLRUtrace = {};
    var ACECFLRUtrace = {};
    var LRUWSRtrace = {};
    var ACELRUWSRtrace = {};
    var RWlayout = {};
    var RWData = [];

    (function myLoop(i) {
        setTimeout(function() {
            progress++;
            LRUstats = IOcalc(RWWorkload(i),b, a, 0);
            LRUx1.push(i);
            LRUy1.push(LRUstats[0] * .4);
            LRUx2.push(i);
            LRUy2.push(LRUstats[1] * .4);

            CFLRUstats = IOcalc(RWWorkload(i),b, a, 1);
            CFLRUx1.push(i);
            CFLRUy1.push(CFLRUstats[0] * .4);
            CFLRUx2.push(i);
            CFLRUy2.push(CFLRUstats[1] * .4);

            LRUWSRstats = IOcalc(RWWorkload(i),b, a, 2);
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
                LRUtrace = {

                    x: LRUx1, 
                    y: LRUy1, 
                    mode:"scatter", 
                    name:"LRU",
                    marker: {
                        size: 12,
                        symbol: 'circle-open'
                    }
                }
            
                ACELRUtrace = {
            
                    x: LRUx2, 
                    y: LRUy2, 
                    mode:"scatter", 
                    name:"ACE-LRU",
                    marker: {
                        size: 12,
                        symbol: 'diamond-open'
                    }
                }
            
                CFLRUtrace = {
            
                    x: CFLRUx1, 
                    y: CFLRUy1, 
                    mode:"scatter", 
                    name:"CFLRU",
                    marker: {
                        size: 12,
                        symbol: 'square-open'
                    }
                }
            
                ACECFLRUtrace = {
            
                    x: CFLRUx2, 
                    y: CFLRUy2, 
                    mode:"scatter", 
                    name:"ACE-CFLRU",
                    marker: {
                        size: 12,
                        symbol: 'x-open'
                    }
                }
            
                LRUWSRtrace = {
            
                    x: LRUWSRx1, 
                    y: LRUWSRy1, 
                    mode:"scatter", 
                    name:"LRU-WSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-up-open'
                    }
                }
            
                ACELRUWSRtrace = {
            
                    x: LRUWSRx2, 
                    y: LRUWSRy2, 
                    mode:"scatter", 
                    name:"ACE-LRUWSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-down-open'
                    }
                }
            
                RWlayout = {
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
                
                RWData = [LRUtrace, ACELRUtrace, CFLRUtrace, ACECFLRUtrace, LRUWSRtrace, ACELRUWSRtrace];
                Plotly.newPlot('RWplot', RWData, RWlayout);
                
                if(progress==23){
                    $("#loadingbar").empty();
                }
            }
          }
        }, 100)
    })(0);     
}

//generate graph for varying Buffer size
function Bgraph(){
    
    var isComparative = $("#comparative-analysis").is(":visible");
    var diskSize = parseInt($(isComparative ? "#cmp-n-bp" : "#n").val());
    var a = parseInt($(isComparative ? "#cmp-alpha-bp" : "#alpha").val());
    
    

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

    var LRUstats = [];
    var CFLRUstats = [];
    var LRUWSRstats = [];

    var LRUtrace = {};
    var ACELRUtrace = {};
    var CFLRUtrace = {};
    var ACECFLRUtrace = {};
    var LRUWSRtrace = {};
    var ACELRUWSRtrace = {};
    var BData = [];
    var Blayout = {};

    (function myLoop(i) {
        setTimeout(function() {
            progress++;
            LRUstats = IOcalc(generateWorkload(),diskSize*(i/100), a, 0);
            LRUx1.push(i);
            LRUy1.push(LRUstats[0] * .4);
            LRUx2.push(i);
            LRUy2.push(LRUstats[1] * .4);

            CFLRUstats = IOcalc(generateWorkload(),diskSize*(i/100), a, 1);
            CFLRUx1.push(i);
            CFLRUy1.push(CFLRUstats[0] * .4);
            CFLRUx2.push(i);
            CFLRUy2.push(CFLRUstats[1] * .4);

            LRUWSRstats = IOcalc(generateWorkload(),diskSize*(i/100), a, 2);
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
                LRUtrace = {

                    x: LRUx1, 
                    y: LRUy1, 
                    mode:"scatter", 
                    name:"LRU",
                    marker: {
                        size: 12,
                        symbol: 'circle-open'
                    }
                }
                
                ACELRUtrace = {
            
                    x: LRUx2, 
                    y: LRUy2, 
                    mode:"scatter", 
                    name:"ACE-LRU",
                    marker: {
                        size: 12,
                        symbol: 'diamond-open'
                    }
                }
            
                CFLRUtrace = {
            
                    x: CFLRUx1, 
                    y: CFLRUy1, 
                    mode:"scatter", 
                    name:"CFLRU",
                    marker: {
                        size: 12,
                        symbol: 'square-open'
                    }
                }
            
                ACECFLRUtrace = {
            
                    x: CFLRUx2, 
                    y: CFLRUy2, 
                    mode:"scatter", 
                    name:"ACE-CFLRU",
                    marker: {
                        size: 12,
                        symbol: 'x-open'
                    }
                }
            
                LRUWSRtrace = {
            
                    x: LRUWSRx1, 
                    y: LRUWSRy1, 
                    mode:"scatter", 
                    name:"LRU-WSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-up-open'
                    }
                }
            
                ACELRUWSRtrace = {
            
                    x: LRUWSRx2, 
                    y: LRUWSRy2, 
                    mode:"scatter", 
                    name:"ACE-LRUWSR",
                    marker: {
                        size: 12,
                        symbol: 'triangle-down-open'
                    }
                }
            
                BData = [LRUtrace, ACELRUtrace, CFLRUtrace, ACECFLRUtrace, LRUWSRtrace, ACELRUWSRtrace];
                
                Blayout = {
                    xaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: true,
                        title: "Bufferpool size (% of disk size)"
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
                
                $("#loadingbar").empty();
                
            }
          }
        }, 100)
        
    })(1);
}

//check if input values are too high
function capacity() {
    var isComparative = $("#comparative-analysis").is(":visible");
    
    var b_val = parseInt($(isComparative ? "#cmp-b" : "#b").val());
    var n_val = parseInt($(isComparative ? "#cmp-n" : "#n").val());
    var x_val = parseInt($(isComparative ? "#cmp-x" : "#x").val());
    var e_val = parseInt($(isComparative ? "#cmp-e" : "#e").val());
    var alpha_val = parseInt($(isComparative ? "#cmp-alpha" : "#alpha").val());
    var s_val = parseInt($(isComparative ? "#cmp-s" : "#s").val());

    if (b_val > 500 || b_val < 0) {
        window.alert("Buffer pool size is too large or invalid");
        return false;
    }
    if (n_val > 10000 || n_val < b_val) {
        window.alert("Disk size is too large or smaller than the buffer size");
        return false;
    }
    if (x_val > 100000 || x_val < b_val) {
        window.alert("Workload size is too large or smaller than the buffer");
        return false;
    }
    if (e_val > 100 || e_val < 0) {
        window.alert("Read ratio cannot exceed 100%");
        return false;
    }
    if (alpha_val > 20 || alpha_val < 0) {
        window.alert("Current SSD concurrency is too large or invalid");
        return false;
    }
    if (s_val > 100 || s_val < 0) {
        window.alert("Skewness cannot exceed 100% or be negative");
        return false;
    }

    return true;
}


})