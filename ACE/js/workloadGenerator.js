//check if input values are too high
function capacity() {
    var isComparative = $("#comparative-analysis").is(":visible");

    var b_val = parseFloat($(isComparative ? "#cmp-b" : "#b").val());
    var n_val = parseFloat($(isComparative ? "#cmp-n" : "#n").val());
    var x_val = parseFloat($(isComparative ? "#cmp-x" : "#x").val());
    var e_val = parseFloat($(isComparative ? "#cmp-e" : "#e").val());
    var alpha_val = parseFloat($(isComparative ? "#cmp-alpha" : "#alpha").val());
    var s_val = parseFloat($(isComparative ? "#cmp-s" : "#s").val());
    var d_val = parseFloat($(isComparative ? "#cmp-d" : "#d").val());
    var asym_val = parseFloat($(isComparative ? "#cmp_asym" : "#asym").val());
    var lat_val = parseFloat($(isComparative ? "#cmp_base_latency_rw" : "#lat").val());

    if (isNaN(b_val) || !Number.isInteger(b_val) || b_val <= 0) {
        alert("Buffer pool size must be a integer greater than 0.");
        return false;
    }
    
    if (isNaN(n_val) || !Number.isInteger(n_val) || n_val < b_val || b_val <= 0) {
        alert("Disk size must be an integer at least equal to the buffer size and greater than 0.");
        return false;
    }
    
    if (isNaN(x_val) || !Number.isInteger(x_val) || x_val <= 1) {
        alert("Number of operations must be an integer greater than 1.");
        return false;
    }
    
    if (isNaN(e_val) || e_val < 0 || e_val > 100) {
        alert("Read percentage must be between 0% and 100%.");
        return false;
    }
    
    if (isNaN(alpha_val) || alpha_val <= 0) {
        alert("Concurrency must be a greater than 0.");
        return false;
    }
    
    if (isNaN(s_val) || s_val < 0 || s_val > 100) {
        alert("Skewness must be between 0% and 100%.");
        return false;
    }
    
    if (isNaN(d_val) || d_val < 0 || d_val > 100) {
        alert("Target data skew must be between 0% and 100%.");
        return false;
    }
    
    if (isNaN(asym_val) || asym_val < 1) {
        alert("Asymmetry (write/read latency ratio) must be a number greater than or equal to 1");
        return false;
    }
    
    if (isNaN(lat_val) || lat_val <= 0) {
        alert("Base latency must be greater than 0 μs");
        return false;
    }
    

    return true;
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
    const workload1 = [100, 5000, 50000, 80, 15, 60]; //small buffer
    const workload2 = [250, 5000, 50000, 80, 15, 60]; // large buffer
    const workload3 = [150, 5000, 50000, 80, 15, 90]; // read heavy
    const workload4 = [150, 5000, 50000, 80, 15, 20]; //write heavy
    const workload5 = [150, 10000, 50000, 95, 5, 60];  // skewed
    const workload6 = [150, 500, 50000, 100, 100, 60];  // uniform
    const test = [5, 50, 20, 80, 15, 40];

    const device1 = [12.4, 3.0, 6]; // PCI
    const device2 = [100, 1.5, 9]; // SATA
    const device3 = [6.8, 1.1, 5]; // Optane
    const device4 = [180, 2.0, 19]; // Virtual

    var devices = [device1, device2, device3, device4]
    var workloads = [workload1, workload2, workload3, workload4, workload5, workload6, test];
    var inputs = [$b, $n, $x, $s, $d, $e, $alpha];
    let RWPlotData = {
        xVals: [],
        raw: [],       // [LRU_y, ACELRU_y, CFLRU_y, ACECFLRU_y, LRUWSR_y, ACELRUWSR_y]
        speedup: []    // [LRU_speedup, CFLRU_speedup, LRUWSR_speedup]
    };

    let Bgraph_cache = {
        xVals: [],
        raw: {
          LRU: [], ACE_LRU: [], CFLRU: [], ACE_CFLRU: [], LRUWSR: [], ACE_LRUWSR: []
        },
        speedup: {
          LRU: [], CFLRU: [], LRUWSR: []
        },
        layout: null
      };
    
$(document).on("change", "#workload, #cmp_workload_rw, #cmp_workload_bp", function() {
    var workloadIndex = parseInt($(this).val());
    var id = $(this).attr("id");

    console.log("Workload changed:", id, "Index:", workloadIndex);

    var ids = [];
    
    if (id === "workload") {
        ids = ["b", "n", "x", "s", "d", "e"];
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
    const deviceIndex = parseInt($(this).val()) - 1;
    const id = $(this).attr("id");

    const device = devices[deviceIndex];

    if (!device) {
        console.warn("Invalid device index selected:", deviceIndex);
        return;
    }

    console.log("Device changed:", id, "Index:", deviceIndex, "Values:", device);

    // Assign target input field IDs based on which dropdown was used
    let latencyId, asymId, alphaId;

    if (id === "device") {
        latencyId = "lat";
        asymId = "asym";
        alphaId = "alpha";
    } else if (id === "cmp_device_rw") {
        latencyId = "cmp_base_latency_rw";
        asymId = "cmp_alpha_rw";
        alphaId = "cmp_kappa_rw";
    } else if (id === "cmp_device_bp") {
        latencyId = "cmp_base_latency_bp";
        asymId = "cmp_alpha_bp";
        alphaId = "cmp_kappa_bp";
    }

    // Update the corresponding fields
    $("#" + latencyId).val(device[0]);
    $("#" + asymId).val(device[1]);
    $("#" + alphaId).val(device[2]);

    // Enable the inputs in case they were disabled
    $("#" + latencyId).prop("disabled", false);
    $("#" + asymId).prop("disabled", false);
    $("#" + alphaId).prop("disabled", false);
});

// Log user edits to individual input fields
$(document).on("input", "input[type='number']", function () {
    const id = $(this).attr("id");
    const newValue = $(this).val();
    console.log(`User manually changed ${id} → ${newValue}`);
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

    var progress = 0;
    let g = document.createElement("progress");  // Create loading bar
    g.setAttribute("id", "experiment-progress");
    g.setAttribute("value", 0);
    g.setAttribute("max", "100");
    document.getElementById("loadingbar").appendChild(g);
    
    $("#graph").click(function() {
        console.log("User clicked 'Run Experiment'. Generating updated plots...");
    
        progress = 0;  // Reset progress
    
        g.setAttribute("value", progress);
        g.setAttribute("max", "30");
        document.getElementById("loadingbar").appendChild(g);
    
        setTimeout(() => {
            RWgraph();  // Now the RW plot updates only when the user clicks the button
            Bgraph();   // Buffer pool graph updates only when the user clicks the button
            ACELRUgraph(); 
        }); // **2-second delay before executing the graphs**
    });
    $(".toggle-switch").on("click", ".toggle-option", function () {
        var $clicked = $(this);
        var $switch = $clicked.closest(".toggle-switch");
    
        $switch.find(".toggle-option").removeClass("active");
        $clicked.addClass("active");
    
        var mode = $clicked.data("mode");       // "raw" or "speedup"
        var target = $switch.data("target");    // "RWplot" or "Bplot"
    
        switch (target) {
            case "RWplot":
                drawRWplot(mode);
                break;
            case "Bplot":
                drawBplot(mode);
                break;
        }
    });
    
    
    
    
function update(p){
    g.setAttribute("value", p);
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

function RWgraph() {
    var b = parseInt($("#cmp_buffer_size_rw").val());
    var a = parseInt($("#cmp_kappa_rw").val()); 
    var read_latency = parseInt($("#cmp_base_latency_rw").val());
    var asymmetry = parseInt($("#cmp_alpha_rw").val());
    var write_latency = read_latency * asymmetry;

    var xVals = [];
    var LRU_y = [], ACELRU_y = [], CFLRU_y = [], ACECFLRU_y = [], LRUWSR_y = [], ACELRUWSR_y = [];
    var LRU_speedup = [], CFLRU_speedup = [], LRUWSR_speedup = [];

    (function myLoop(i) {
        setTimeout(function () {
            progress++;

            const LRUstats = IOcalc(RWWorkload(i), b, a, 0);
            const CFLRUstats = IOcalc(RWWorkload(i), b, a, 1);
            const LRUWSRstats = IOcalc(RWWorkload(i), b, a, 2);

            const LRU_Lat = (LRUstats[0] * write_latency + LRUstats[1] * read_latency) / 1000;
            const ACELRU_Lat = (LRUstats[2] * write_latency + LRUstats[3] * read_latency) / 1000;
            const CFLRU_Lat = (CFLRUstats[0] * write_latency + CFLRUstats[1] * read_latency) / 1000;
            const ACECFLRU_Lat = (CFLRUstats[2] * write_latency + CFLRUstats[3] * read_latency) / 1000;
            const LRUWSR_Lat = (LRUWSRstats[0] * write_latency + LRUWSRstats[1] * read_latency) / 1000;
            const ACELRUWSR_Lat = (LRUWSRstats[2] * write_latency + LRUWSRstats[3] * read_latency) / 1000;

            xVals.push(i);
            LRU_y.push(LRU_Lat);
            ACELRU_y.push(ACELRU_Lat);
            CFLRU_y.push(CFLRU_Lat);
            ACECFLRU_y.push(ACECFLRU_Lat);
            LRUWSR_y.push(LRUWSR_Lat);
            ACELRUWSR_y.push(ACELRUWSR_Lat);

            LRU_speedup.push(LRU_Lat / ACELRU_Lat);
            CFLRU_speedup.push(CFLRU_Lat / ACECFLRU_Lat);
            LRUWSR_speedup.push(LRUWSR_Lat / ACELRUWSR_Lat);

            update(progress);

            if (i < 100) {
                i += 10;
                myLoop(i);
            } else {
                RWPlotData = {
                    xVals: [...xVals],
                    raw: [LRU_y, ACELRU_y, CFLRU_y, ACECFLRU_y, LRUWSR_y, ACELRUWSR_y],
                    speedup: [LRU_speedup, CFLRU_speedup, LRUWSR_speedup]
                };

                drawRWplot("raw");  // Default view
            }
        }, 100);
    })(0);
}

function drawRWplot(mode) {
    const x = RWPlotData.xVals;

    let traces = [];

    const libertineFontStyle = {
        family: 'Linux Libertine, serif',
        size: 19, // ≈ 1.18rem
        color: '#111',
        weight: 400
    };
    let layout = {
        font: libertineFontStyle,
        xaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: true,
            title: {
                text: "Read Ratio (%)",
                standoff: 10  // ✅ Correctly placed after layout is defined
            }
        },
        yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: true,
            title: (mode === "raw") ? "Workload latency (ms)" : "Speedup"
        }
    };

    if (mode === "raw") {
        const [LRU, ACELRU, CFLRU, ACECFLRU, LRUWSR, ACELRUWSR] = RWPlotData.raw;

        traces = [
            { x: x, y: LRU, name: "LRU", mode: "scatter", marker: { size: 12, symbol: 'circle-open' } },
            { x: x, y: ACELRU, name: "ACE-LRU", mode: "scatter", marker: { size: 12, symbol: 'diamond-open' } },
            { x: x, y: CFLRU, name: "CFLRU", mode: "scatter", marker: { size: 12, symbol: 'square-open' } },
            { x: x, y: ACECFLRU, name: "ACE-CFLRU", mode: "scatter", marker: { size: 12, symbol: 'x-open' } },
            { x: x, y: LRUWSR, name: "LRU-WSR", mode: "scatter", marker: { size: 12, symbol: 'triangle-up-open' } },
            { x: x, y: ACELRUWSR, name: "ACE-LRUWSR", mode: "scatter", marker: { size: 12, symbol: 'triangle-down-open' } }
        ];
        // ✅ Flatten and find max Y value from all raw traces
        const allY = [...LRU, ...ACELRU, ...CFLRU, ...ACECFLRU, ...LRUWSR, ...ACELRUWSR];
        let maxY = Math.max(...allY);
        maxY = Math.ceil(maxY * 100) / 100 + 15;  // Round and pad

        // ✅ Override yaxis layout for raw mode
        layout.yaxis.autorange = false;
        layout.yaxis.range = [0, maxY];

        document.getElementById("RWplot-caption").innerHTML =
            `<b>ACE consistently reduces latency across read/write mixes</b>`;
    } else {
        const [LRU, CFLRU, LRUWSR] = RWPlotData.speedup;

        traces = [
            { x: x, y: LRU, name: "ACE-LRU", mode: "scatter", marker: { size: 12, symbol: 'x-open' }, line: { dash: "solid" } },
            { x: x, y: CFLRU, name: "ACE-CFLRU", mode: "scatter", marker: { size: 12, symbol: 'square-open' }, line: { dash: "solid" } },
            { x: x, y: LRUWSR, name: "ACE-LRUWSR", mode: "scatter", marker: { size: 12, symbol: 'circle-open' }, line: { dash: "solid" } }
        ];

        document.getElementById("RWplot-caption").innerHTML =
            `<b>Write-heavy workloads benefit more from ACE</b>`;
    }

    Plotly.newPlot('RWplot', traces, layout);
}


//generate graph for varying Buffer size
function Bgraph() {
    let diskSize = parseInt($("#cmp_disk_size_bp").val());
    let a = parseInt($("#cmp_kappa_bp").val());
    let read_latency = parseInt($("#cmp_base_latency_bp").val());
    let asymmetry = parseInt($("#cmp_alpha_bp").val());
    let write_latency = read_latency * asymmetry;
  
    let xVals = [];
    let raw = {
      LRU: [], ACE_LRU: [], CFLRU: [], ACE_CFLRU: [], LRUWSR: [], ACE_LRUWSR: []
    };
    let speedup = {
      LRU: [], CFLRU: [], LRUWSR: []
    };
  
    (function myLoop(i) {
      setTimeout(function () {
        progress++;
  
        const LRUstats = IOcalc(BPWorkload(), diskSize * (i / 100), a, 0);
        const CFLRUstats = IOcalc(BPWorkload(), diskSize * (i / 100), a, 1);
        const LRUWSRstats = IOcalc(BPWorkload(), diskSize * (i / 100), a, 2);
  
        const LRU = (LRUstats[0] * write_latency + LRUstats[1] * read_latency) / 1000;
        const ACE_LRU = (LRUstats[2] * write_latency + LRUstats[3] * read_latency) / 1000;
        const CFLRU = (CFLRUstats[0] * write_latency + CFLRUstats[1] * read_latency) / 1000;
        const ACE_CFLRU = (CFLRUstats[2] * write_latency + CFLRUstats[3] * read_latency) / 1000;
        const LRUWSR = (LRUWSRstats[0] * write_latency + LRUWSRstats[1] * read_latency) / 1000;
        const ACE_LRUWSR = (LRUWSRstats[2] * write_latency + LRUWSRstats[3] * read_latency) / 1000;
  
        xVals.push(i);
        raw.LRU.push(LRU);
        raw.ACE_LRU.push(ACE_LRU);
        raw.CFLRU.push(CFLRU);
        raw.ACE_CFLRU.push(ACE_CFLRU);
        raw.LRUWSR.push(LRUWSR);
        raw.ACE_LRUWSR.push(ACE_LRUWSR);
  
        speedup.LRU.push(LRU / ACE_LRU);
        speedup.CFLRU.push(CFLRU / ACE_CFLRU);
        speedup.LRUWSR.push(LRUWSR / ACE_LRUWSR);
  
        update(progress);
  
        if (i < 20) {
          i += 2;
          myLoop(i);
        } else {
          Bgraph_cache.xVals = xVals;
          Bgraph_cache.raw = raw;
          Bgraph_cache.speedup = speedup;
          Bgraph_cache.layout = {
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
              showline: true
            },
            title: ""
          };
          drawBplot("raw");
        }
      }, 100);
    })(1);
  }
  
  function drawBplot(mode) {
    const x = Bgraph_cache.xVals;
    const layout = JSON.parse(JSON.stringify(Bgraph_cache.layout));

    // ✅ Apply font style and fix x-axis padding
    layout.font = {
        family: 'Linux Libertine',
        size: 19, // 1.18rem ≈ 18.88px
        color: '#111',
        weight: 400
    };
    layout.xaxis.title = {
        text: "Buffer pool size (%)",
        standoff: 10  // Reduce space between axis line and label
    };

    let traces = [];

    if (mode === "raw") {
        traces = [
            { x, y: Bgraph_cache.raw.LRU, mode: "scatter", name: "LRU", marker: { size: 12, symbol: 'circle-open' } },
            { x, y: Bgraph_cache.raw.ACE_LRU, mode: "scatter", name: "ACE-LRU", marker: { size: 12, symbol: 'diamond-open' } },
            { x, y: Bgraph_cache.raw.CFLRU, mode: "scatter", name: "CFLRU", marker: { size: 12, symbol: 'square-open' } },
            { x, y: Bgraph_cache.raw.ACE_CFLRU, mode: "scatter", name: "ACE-CFLRU", marker: { size: 12, symbol: 'x-open' } },
            { x, y: Bgraph_cache.raw.LRUWSR, mode: "scatter", name: "LRU-WSR", marker: { size: 12, symbol: 'triangle-up-open' } },
            { x, y: Bgraph_cache.raw.ACE_LRUWSR, mode: "scatter", name: "ACE-LRUWSR", marker: { size: 12, symbol: 'triangle-down-open' } }
        ];
        layout.yaxis.title = {
            text: "Workload latency (ms)"
        };
        document.getElementById("Bplot-caption").innerHTML =
            '<b>ACE is beneficial across a wide range of bufferpool size</b>';
    } else {
        traces = [
            { x, y: Bgraph_cache.speedup.LRU, mode: "scatter", name: "ACE-LRU", marker: { size: 12, symbol: 'x-open' } },
            { x, y: Bgraph_cache.speedup.CFLRU, mode: "scatter", name: "ACE-CFLRU", marker: { size: 12, symbol: 'square-open' } },
            { x, y: Bgraph_cache.speedup.LRUWSR, mode: "scatter", name: "ACE-LRUWSR", marker: { size: 12, symbol: 'circle-open' } }
        ];
        layout.yaxis.title = {
            text: "Speedup"
        };
        document.getElementById("Bplot-caption").innerHTML =
            '<b>ACE improves performance more for smaller bufferpools</b>';
    }

    Plotly.newPlot("Bplot", traces, layout);
}

  


function ACELRUgraph(){
    var b = parseInt($("#cmp_buffer_size_rw").val());
    var a = parseInt($("#cmp_kappa_rw").val()); 
    
    var xVals = []; // Ensure x-axis values match RWgraph
    var Speedup = [[], [], [], []]; // Speedup = LRU Latency / ACE-LRU Latency

    var SSDConfigs = [
        [12.4, 3.0, 6],  // PCI (α = 3.0)
        [180, 2.0, 19],  // Virtual (α = 2.0)
        [100, 1.5, 9],   // SATA (α = 1.5)
        [6.8, 1.1, 5]    // Optane (α = 1.1)
    ];

    let deviceLabels = [
        "PCI (α = 3.0)", 
        "Cloud-based (α = 2.0)", 
        "SATA (α = 1.5)", 
        "Optane (α = 1.1)"
    ];

    (function myLoop(i) {
        setTimeout(function() {
            progress++;

            if (i >= 0) {
                xVals.push(i);

                for (let j = 0; j < SSDConfigs.length; j++) {
                    let workloadStatsLRU = IOcalc(RWWorkload(i), b, a, 0);
                    let workloadStatsACE = IOcalc(RWWorkload(i), b, a, 1);
                    
                    let base_latency = SSDConfigs[j][0];
                    let asymmetry = SSDConfigs[j][1];
                    let write_latency = base_latency * asymmetry;

                    let LRU_Latency = (workloadStatsLRU[0] * write_latency + workloadStatsLRU[1] * base_latency) / 1000;
                    let ACE_Latency = (workloadStatsACE[2] * write_latency + workloadStatsACE[3] * base_latency) / 1000;
                    
                    Speedup[j].push(LRU_Latency / ACE_Latency);
                }
            }

            update(progress);

            if (i < 100){
                i += 10;
                myLoop(i);
            } else {
                let speedupTraces = [];

                for (let j = 0; j < SSDConfigs.length; j++) {
                    speedupTraces.push({
                        x: xVals,
                        y: Speedup[j],  
                        mode: "scatter",
                        name: deviceLabels[j],
                        marker: { size: 12, symbol: 'triangle-up-open' },
                        line: { dash: "solid" }
                    });
                }
                let layout = {
                    font: {
                        family: 'Linux Libertine',
                        size: 19,
                        color: '#111',
                        weight: 400
                    },
                    xaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: true,
                        title: {
                            text: "Read Ratio (%)",
                            standoff: 10
                        }
                    },
                    yaxis: {
                        autorange: true,
                        showgrid: false,
                        zeroline: false,
                        showline: true, 
                        title: {
                            text: "Speedup"
                        }
                    }
                };

                Plotly.newPlot('LRUplot', speedupTraces, layout);

                document.getElementById("LRUplot-caption").innerHTML =
                    `<b>Devices with higher asymmetry (α) gain more from ACE</b>`;

                if(progress == 23){
                    $("#loadingbar").empty();
                }
            }
        }, 100);
    })(0);
}

})