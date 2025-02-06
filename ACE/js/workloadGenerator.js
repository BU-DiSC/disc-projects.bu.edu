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
    const workload1 = [100, 5000, 50000, 80, 15, 60, 12]; //small buffer
    const workload2 = [250, 5000, 50000, 80, 15, 60, 12]; // large buffer
    const workload3 = [150, 5000, 50000, 80, 15, 90, 12]; // read heavy
    const workload4 = [150, 5000, 50000, 80, 15, 20, 12]; //write heavy
    const workload5 = [150, 10000, 50000, 95, 5, 60, 12];  // skewed
    const workload6 = [150, 500, 50000, 100, 100, 60, 12];  // uniform
    const test = [5, 50, 20, 80, 15, 40, 4];

    const device1 = [12.4, 3.0, 6]; // PCI
    const device2 = [100, 1.5, 9]; // SATA
    const device3 = [6.8, 1.1, 5]; // Optane
    const device4 = [180, 2.0, 19]; // Virtual

    var devices = [device1, device2, device3, device4]
    var workloads = [workload1, workload2, workload3, workload4, workload5, workload6, test];
    var inputs = [$b, $n, $x, $s, $d, $e, $alpha];
    
$(document).on("change", "#workload, #cmp_workload_rw, #cmp_workload_bp", function() {
    var workloadIndex = parseInt($(this).val());
    var id = $(this).attr("id");

    console.log("Workload changed:", id, "Index:", workloadIndex);

    var ids = [];
    
    if (id === "workload") {
        ids = ["b", "n", "x", "s", "d", "e", "alpha"];
    } else if (id === "cmp_workload_rw") {
        ids = ["cmp_buffer_size_rw", "cmp_disk_size_rw", "cmp_operations_rw", 
            "cmp_skew_d_rw", "cmp_skew_t_rw", "cmp_read_percentage_rw", "cmp_kappa_rw"];
    } else if (id === "cmp_workload_bp") {
        ids = ["cmp_buffer_size_bp", "cmp_disk_size_bp", "cmp_operations_bp", 
            "cmp_skew_d_bp", "cmp_skew_t_bp", "cmp_read_percentage_bp", "cmp_kappa_bp"];
    }

    if (workloadIndex > 0 && workloadIndex <= workloads.length) {
        var workload = workloads[workloadIndex - 1];

        console.log("Selected Workload Values:", workload);

        ids.forEach((fieldId, index) => {
            var element = $("#" + fieldId);
            if (element.length) {
                element.val(workload[index]);
                element.prop("disabled", false);
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

$(document).on("change", "#device, #cmp_device_rw, #cmp_device_bp", function() {
    var deviceIndex = parseInt($(this).val()) - 1; // Convert 1-based index to 0-based

    console.log("Device changed:", this.id, "Index:", deviceIndex + 1);

    if (deviceIndex >= 0 && deviceIndex < devices.length) {
        var selectedDevice = devices[deviceIndex];

        console.log("Selected Device Values:", selectedDevice);

        // Determine which section triggered the change
        if (this.id === "device") {
            // Individual Analysis Fields
            $("#lat").val(selectedDevice[0]);
            $("#asym").val(selectedDevice[1]);
            $("#alpha").val(selectedDevice[2]);

            console.log(`Updated [Individual] → Latency: ${selectedDevice[0]}, Asymmetry: ${selectedDevice[1]}, Concurrency: ${selectedDevice[2]}`);
        } else if (this.id === "cmp_device_rw") {
            // Comparative Analysis (Read/Write) Fields
            $("#cmp_base_latency_rw").val(selectedDevice[0]);
            $("#cmp_alpha_rw").val(selectedDevice[1]);
            $("#cmp_kappa_rw").val(selectedDevice[2]);

            console.log(`Updated [Read/Write] → Latency: ${selectedDevice[0]}, Alpha: ${selectedDevice[1]}, Kappa: ${selectedDevice[2]}`);
        } else if (this.id === "cmp_device_bp") {
            // Comparative Analysis (Buffer Pool) Fields
            $("#cmp_base_latency_bp").val(selectedDevice[0]);
            $("#cmp_alpha_bp").val(selectedDevice[1]);
            $("#cmp_kappa_bp").val(selectedDevice[2]);

            console.log(`Updated [Buffer Pool] → Latency: ${selectedDevice[0]}, Alpha: ${selectedDevice[1]}, Kappa: ${selectedDevice[2]}`);
        }
    } else {
        console.warn("Invalid device index selected.");
    }
});
$(document).ready(function(){
    var playing = false;
    // Finish the simulation (for either experiment)
    $("#finish-button").click(function(){
        playing = false;
        finishSimulation();
    });

    // Update Workload based on selected configuration (either individual or comparative)
    function updateWorkload(experimentType) {
        let workloadData;
        if (experimentType === "individual") {
            // Get data from individual experiment inputs
            workloadData = {
                bufferSize: $('#b').val(),
                diskSize: $('#n').val(),
                readRatio: $('#e').val(),
                // Other inputs here
            };
        } else {
            // Get data from comparative experiment inputs
            workloadData = {
                bufferSize: $('#cmp-b-rw').val(),
                diskSize: $('#cmp-n-rw').val(),
                readRatio: $('#cmp-e-bp').val(),
                // Other inputs here
            };
        }

        console.log(workloadData);
        // Now you can pass this to the simulation
    }
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

    var b_val, n_val, x_val, e_val, s_val, d_val;

    // Individual experiment
    b_val = parseInt($("#b").val());
    n_val = parseInt($("#n").val());
    x_val = parseInt($("#x").val());
    e_val = parseInt($("#e").val());
    s_val = parseInt($("#s").val());
    d_val = parseInt($("#d").val());

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

function BPWorkload(){

    var b_val, n_val, x_val, e_val, s_val, d_val;

    // Individual experiment
    b_val = parseInt($("#cmp_buffer_size_bp").val());  // Buffer size
    n_val = parseInt($("#cmp_disk_size_bp").val());    // Disk size
    x_val = parseInt($("#cmp_operations_bp").val());   // # Operations
    e_val = parseInt($("#cmp_read_percentage_bp").val()); // Read percentage
    s_val = parseInt($("#cmp_skew_d_bp").val());  // Skewness (% of hot data)
    d_val = parseInt($("#cmp_skew_t_bp").val());  // Target Skewness on % of data

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
    var n_val = parseInt($("#cmp_disk_size_rw").val()); // Disk size
    var x_val = parseInt($("#cmp_operations_rw").val()); // # Operations
    var s_val = parseInt($("#cmp_skew_d_rw").val()); // Skewness (% of hot data)
    var d_val = parseInt($("#cmp_skew_t_rw").val()); // Target Skewness on % of data

    var pageId;
    var endPageId = n_val * (d_val / 100); // Defines "hot" data region
    var workload = [];

    for (let i = 0; i < x_val; i++) {
        const typeDecider = Math.random() * 100; // Read/Write decision
        const skewed = Math.random() * 100; // Skewed access decision

        // Select a page ID based on skewness
        pageId = (skewed < s_val) ? 
            Math.ceil(Math.random() * endPageId) : 
            Math.ceil(Math.random() * (n_val - endPageId) + endPageId);

        // Determine whether it's a read ('R') or write ('W')
        workload.push(typeDecider < e_val ? ['R', pageId] : ['W', pageId]);
    }

    return workload;
}

//generate graph for varying Read/Write ratio
function RWgraph(){
    var b = parseInt($("#cmp_buffer_size_rw").val());
    var a = parseInt($("#cmp_kappa_rw").val()); 

    var read_latency = parseInt($("#cmp_base_latency_rw").val());
    var asymmetry = parseInt($("#cmp_alpha_rw").val());
    var write_latency = read_latency * asymmetry;
    
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
            LRUy1.push((LRUstats[0] * write_latency + LRUstats[1] * read_latency)/1000);
            LRUx2.push(i);
            LRUy2.push((LRUstats[2] * write_latency + LRUstats[3] * read_latency)/1000);

            CFLRUstats = IOcalc(RWWorkload(i),b, a, 1);
            CFLRUx1.push(i);
            CFLRUy1.push((CFLRUstats[0] * write_latency + CFLRUstats[1] * read_latency)/1000);
            CFLRUx2.push(i);
            CFLRUy2.push((LRUstats[2] * write_latency + LRUstats[3] * read_latency)/1000);

            LRUWSRstats = IOcalc(RWWorkload(i),b, a, 2);
            LRUWSRx1.push(i);
            LRUWSRy1.push((LRUWSRstats[0] * write_latency + LRUWSRstats[1] * read_latency)/1000);
            LRUWSRx2.push(i);
            LRUWSRy2.push((LRUWSRstats[2] * write_latency + LRUWSRstats[3] * read_latency)/1000);

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
    var diskSize = parseInt($("#cmp_disk_size_bp").val());
    var a = parseInt($("#cmp_kappa_bp").val()); 
    var read_latency = parseInt($("#cmp_base_latency_bp").val());
    var asymmetry = parseInt($("#cmp_alpha_bp").val());
    var write_latency = read_latency * asymmetry;

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
            LRUstats = IOcalc(BPWorkload(),diskSize*(i/100), a, 0);
            LRUx1.push(i);
            LRUy1.push((LRUstats[0] * write_latency + LRUstats[1] * read_latency)/1000);
            LRUx2.push(i);
            LRUy2.push((LRUstats[2] * write_latency + LRUstats[3] * read_latency)/1000);

            CFLRUstats = IOcalc(BPWorkload(),diskSize*(i/100), a, 1);
            CFLRUx1.push(i);
            CFLRUy1.push((CFLRUstats[0] * write_latency + CFLRUstats[1] * read_latency)/1000);
            CFLRUx2.push(i);
            CFLRUy2.push((CFLRUstats[2] * write_latency + CFLRUstats[3] * read_latency)/1000);

            LRUWSRstats = IOcalc(BPWorkload(),diskSize*(i/100), a, 2);
            LRUWSRx1.push(i);
            LRUWSRy1.push((LRUWSRstats[0] * write_latency + LRUWSRstats[1] * read_latency)/1000);
            LRUWSRx2.push(i);
            LRUWSRy2.push((LRUWSRstats[2] * write_latency + LRUWSRstats[3] * read_latency)/1000);
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