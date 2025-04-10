var pauser = false;
var reloader = 0;
var delay = 200;
var playing = false;
var firstWrite = true;
var aceLatency = [];
var traditionalLatency = [];
var bufferHistory = [];
var dirtyHistory = [];
var coldflagHistory = [];
var usesHistory = [];

var ACEbufferHistory = [];
var ACEdirtyHistory = [];
var ACEcoldflagHistory = [];
var ACEusesHistory = [];

var bufferHitHistory = [];
var bufferMissHistory = [];
var readIOHistory = [];
var writeIOHistory = [];
var pagesWrittenHistory = [];
var pagesReadHistory = [];
var pagesEvictedHistory = [];
var pagesPrefetchedHistory = [];

var ACEbufferHitHistory = [];
var ACEbufferMissHistory = [];
var ACEreadIOHistory = [];
var ACEwriteIOHistory = [];
var ACEpagesWrittenHistory = [];
var ACEpagesReadHistory = [];
var ACEpagesEvictedHistory = [];
var ACEpagesPrefetchedHistory = [];


var tradLatency = 0;
var aceLatencyval = 0;

var aceWriteBatches = [];
var traditionalWriteBatches = [];
function initializeEmptyPlots() {
    console.log("📊 Initializing empty plots...");

    // Empty traces for Write Batches Plot
    var writeBatchesData = [
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'ACE-Algorithm',
            line: {color: '#1B2631'}
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Traditional Algorithm',
            line: {color: 'red'}
        }
    ];

    var writeBatchesLayout = {
        title: '',
        xaxis: { title: 'Operation Steps' },
        yaxis: { title: '# Write Batches' },
        showlegend: true
    };

    // Empty traces for Latency Plot
    var latencyData = [
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'ACE-Algorithm Latency',
            line: {color: '#1B2631'}
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Traditional Algorithm Latency',
            line: {color: 'red'}
        }
    ];

    var latencyLayout = {
        title: '',
        xaxis: { title: 'Operation Steps' },
        yaxis: { title: 'Latency (ms)' },
        showlegend: true
    };

    // Create the empty plots
    Plotly.newPlot('write-batches-graph', writeBatchesData, writeBatchesLayout);
    Plotly.newPlot('latency-graph', latencyData, latencyLayout);
}

$(document).ready(function(){
    initializeEmptyPlots(); 
    $("#ACEAlert").css('visibility', 'hidden');
    function cleanACEBufferDisplay() {
        console.log("🔄 Cleaning ACE buffer display...");
        $("#ACE-alg-table tr").each(function () {
            $('td', this).each(function (index) {
                if (!ACEbuffer[index]) {
                    $(this).css("background-color", "#F2F3F4");  // ✅ Super Light Grey (empty)
                }
            });
        });
    }
    
    $(document).ready(function() {
        function resetPlots() {
            console.log("🔄 Resetting Write Batches and Latency plots...");
        
            // Clear write batches and latency arrays
            aceWriteBatches = [];
            traditionalWriteBatches = [];
            aceLatency = [];
            traditionalLatency = [];
        
            // Reset the Write Batches Plot
            var writeBatchesPlot = document.getElementById('write-batches-graph');
            if (writeBatchesPlot) {
                Plotly.react(writeBatchesPlot, [], {
                    title: '',
                    xaxis: { title: 'Operation steps' },
                    yaxis: { title: '#Write Batches' },
                    showlegend: true
                });
            }
        
            // Reset the Latency Plot
            var latencyPlot = document.getElementById('latency-graph');
            if (latencyPlot) {
                Plotly.react(latencyPlot, [], {
                    title: '',
                    xaxis: { title: 'Operation steps' },
                    yaxis: { title: 'Latency (ms)' },
                    showlegend: true
                });
            }
        }
        

        function handleInputChange() {
            console.log("🔄 Input changed, resetting stats, stopping simulation, and clearing plots...");
        
            // ✅ Stop the Simulation
            playing = false;
            pauser = false;
            reloader = 1;  // Ensure myLoop stops execution
        
            // ✅ Reset Simulation State
            firstWrite = true;
            p = 0; // Reset step counter
        
            // ✅ Clear Write Batches and Latency Data
            aceWriteBatches = [];
            traditionalWriteBatches = [];
            aceLatency = [];
            traditionalLatency = [];
        
            // ✅ Hide ACE Alert and Reset Blue Border
            $("#ACEAlert").css('visibility', 'hidden');
            $("#ACERow").css({ "border-color": "transparent", "border-width": "0px" });
        
            // ✅ Remove Tables
            $("#base-alg-table").remove();
            $("#ACE-alg-table").remove();
        
            // ✅ Reset Buffer and Metrics
            buffer = [];
            dirty = [];
            coldflag = [];
            uses = {};
            
            ACEbuffer = [];
            ACEdirty = [];
            ACEcoldflag = [];
            ACEuses = {};
        
            bufferHit = 0;
            bufferMiss = 0;
            readIO = 0;
            writeIO = 0;
            pagesWritten = 0;
            pagesRead = 0;
            pagesEvicted = 0;
            pagesPrefetched = 0;
        
            ACEbufferHit = 0;
            ACEbufferMiss = 0;
            ACEreadIO = 0;
            ACEwriteIO = 0;
            ACEpagesWritten = 0;
            ACEpagesRead = 0;
            ACEpagesEvicted = 0;
            ACEpagesPrefetched = 0;
        
            // ✅ Reset UI Metrics Display
            resetStats();
            updateProgress(0, 100);
        
            // ✅ Reset the Plots
            resetPlots();
        
            // ✅ Ensure Play Button is Re-enabled
            $("#play-button").prop("disabled", false);
        
            console.log("✅ Simulation reset. Waiting for Play button.");
        }
        
    
        // ✅ Attach event listeners to all relevant inputs
        $("#workload, #n, #b, #e, #device, #asym, #baseAlg, #s, #lat, #alpha, #x, #d").on("change input", handleInputChange);
    });
    
    $("#backward-button").click(function() {
        if (!workload || workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot step backward.");
            return;
        }
    
        playing = false;  // Pause simulation
        pauser = true;    // Ensure it's paused
        reloader = 1;     // Stop auto-execution
    
        if (p > 0) {  
            p--;  // ✅ Decrement BEFORE restoring state
            console.log(`⏮️ Backward: Step ${p}`);
    
            // ✅ Restore state from `p`
            resetStepState(p);
    
            // ✅ Update UI (table, stats, progress bar)
            baseDisplay();
            ACEDisplay();
            updateProgress(p, workload.length);
    
            // ✅ Update the plots (WITHOUT resetting them)
            updateWriteBatchesPlot(aceWriteBatches.slice(0, p + 1), traditionalWriteBatches.slice(0, p + 1));
            updateLatencyPlot(aceLatency.slice(0, p + 1), traditionalLatency.slice(0, p + 1));
        } else {
            console.warn("⚠️ Already at the first step.");
        }
    });
    
    
    
    function resetStepState(stepIndex) {
        console.log(`🔄 Rolling back to step ${stepIndex}...`);
    
        if (stepIndex < 0) {
            console.warn("⚠️ Cannot go below step 0.");
            return;
        }
    
        if (!bufferHistory[stepIndex] || !dirtyHistory[stepIndex]) {
            console.warn(`⚠️ Missing history for step ${stepIndex}, skipping rollback.`);
            return;
        }
    
        try {
            // ✅ Restore buffer states from `stepIndex`
            buffer = JSON.parse(JSON.stringify(bufferHistory[stepIndex]));
            dirty = JSON.parse(JSON.stringify(dirtyHistory[stepIndex]));
            coldflag = JSON.parse(JSON.stringify(coldflagHistory[stepIndex]));
            uses = JSON.parse(JSON.stringify(usesHistory[stepIndex]));
    
            ACEbuffer = JSON.parse(JSON.stringify(ACEbufferHistory[stepIndex]));
            ACEdirty = JSON.parse(JSON.stringify(ACEdirtyHistory[stepIndex]));
            ACEcoldflag = JSON.parse(JSON.stringify(ACEcoldflagHistory[stepIndex]));
            ACEuses = JSON.parse(JSON.stringify(ACEusesHistory[stepIndex]));
    
            // ✅ Restore step metrics from `stepIndex`
            bufferHit = bufferHitHistory[stepIndex] || 0;
            bufferMiss = bufferMissHistory[stepIndex] || 0;
            readIO = readIOHistory[stepIndex] || 0;
            writeIO = writeIOHistory[stepIndex] || 0;
            pagesWritten = pagesWrittenHistory[stepIndex] || 0;
            pagesRead = pagesReadHistory[stepIndex] || 0;
            pagesEvicted = pagesEvictedHistory[stepIndex] || 0;
            pagesPrefetched = pagesPrefetchedHistory[stepIndex] || 0;
    
            ACEbufferHit = ACEbufferHitHistory[stepIndex] || 0;
            ACEbufferMiss = ACEbufferMissHistory[stepIndex] || 0;
            ACEreadIO = ACEreadIOHistory[stepIndex] || 0;
            ACEwriteIO = ACEwriteIOHistory[stepIndex] || 0;
            ACEpagesWritten = ACEpagesWrittenHistory[stepIndex] || 0;
            ACEpagesRead = ACEpagesReadHistory[stepIndex] || 0;
            ACEpagesEvicted = ACEpagesEvictedHistory[stepIndex] || 0;
            ACEpagesPrefetched = ACEpagesPrefetchedHistory[stepIndex] || 0;
    
            // ✅ Restore Latency Values
            tradLatency = traditionalLatency[stepIndex] || 0;
            aceLatencyval = aceLatency[stepIndex] || 0;
    
            // ✅ Update Plots with Restored Latency
            updateLatencyPlot(aceLatency.slice(0, stepIndex + 1), traditionalLatency.slice(0, stepIndex + 1));
    
            console.log(`✅ Successfully restored state at step ${stepIndex}.`);
        } catch (error) {
            console.error("❌ Error restoring step state:", error);
        }
    }
    
    
    
    $("#forward-button").click(function() {
        if (!workload || workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot step forward.");
            return;
        }
    
        playing = false;  // ✅ Pause simulation (but allow resuming)
        pauser = true;    // ✅ Ensure it's paused
        reloader = 0;     // ✅ Allow resuming instead of stopping execution
    
        if (p < workload.length - 1) {  
            bufferHistory[p] = JSON.parse(JSON.stringify(buffer));
            dirtyHistory[p] = JSON.parse(JSON.stringify(dirty));
            coldflagHistory[p] = JSON.parse(JSON.stringify(coldflag));
            usesHistory[p] = JSON.parse(JSON.stringify(uses));
    
            ACEbufferHistory[p] = JSON.parse(JSON.stringify(ACEbuffer));
            ACEdirtyHistory[p] = JSON.parse(JSON.stringify(ACEdirty));
            ACEcoldflagHistory[p] = JSON.parse(JSON.stringify(ACEcoldflag));
            ACEusesHistory[p] = JSON.parse(JSON.stringify(ACEuses));
    
            bufferHitHistory[p] = bufferHit;
            bufferMissHistory[p] = bufferMiss;
            readIOHistory[p] = readIO;
            writeIOHistory[p] = writeIO;
            pagesWrittenHistory[p] = pagesWritten;
            pagesReadHistory[p] = pagesRead;
            pagesEvictedHistory[p] = pagesEvicted;
            pagesPrefetchedHistory[p] = pagesPrefetched;
    
            ACEbufferHitHistory[p] = ACEbufferHit;
            ACEbufferMissHistory[p] = ACEbufferMiss;
            ACEreadIOHistory[p] = ACEreadIO;
            ACEwriteIOHistory[p] = ACEwriteIO;
            ACEpagesWrittenHistory[p] = ACEpagesWritten;
            ACEpagesReadHistory[p] = ACEpagesRead;
            ACEpagesEvictedHistory[p] = ACEpagesEvicted;
            ACEpagesPrefetchedHistory[p] = ACEpagesPrefetched;
    
            traditionalLatency[p] = tradLatency;
            aceLatency[p] = aceLatencyval;
    
            // ✅ Move forward
            p++;
            console.log(`▶️ Forward: Step ${p}`);
    
            // Execute next step
            baseAlgorithm(p);
            ACEAlgorithm(p);
    
            // ✅ Update metrics
            tradLatency = calculateLatency(writeIO, readIO, false) / 1000;
            aceLatencyval = calculateLatency(ACEwriteIO, ACEreadIO, true) / 1000;
    
            traditionalLatency[p] = tradLatency;
            aceLatency[p] = aceLatencyval;
    
            // ✅ Update performance metric display
            $("#base-alg-latency").text(tradLatency.toFixed(2));
            $("#ace-alg-latency").text(aceLatencyval.toFixed(2));
    
            // ✅ Ensure write batches arrays update
            aceWriteBatches.push(ACEwriteIO);
            traditionalWriteBatches.push(writeIO);
    
            // ✅ Update Display, Progress Bar, and Plots
            baseDisplay();
            ACEDisplay();
            updateProgress(p, workload.length);
            updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
            updateLatencyPlot(aceLatency, traditionalLatency);
    
        } else {
            console.warn("⚠️ Already at the last step.");
        }
    });
    

    
    
    

    $("#fast-button").click(function(){
        delay = 15;    
    });
    
    $("#medium-button").click(function(){
        delay = 200;
    });

    $("#slow-button").click(function(){
        delay = 1000;
    });

    $("#finish-button").click(function(){
        finisher();
    });
    const baseReadLatency = parseFloat($('#lat').val());  // Fetch base latency from #lat field
    const asymmetry = parseFloat($('#asym').val());  // Fetch asymmetry from #asym field
    function calculateLatency(writeBatches, diskPagesRead, isACE) {
        let writeLatency = baseReadLatency * (isACE ? asymmetry : 1);  // LRU and ACE share the same formula
        let totalLatency = (writeBatches * writeLatency) + (diskPagesRead * baseReadLatency);
        
        return totalLatency;
    }   
    function myLoop(remainingSteps) {
        if (reloader == 1) { 
            console.warn("🛑 myLoop has been stopped.");
            return;
        }
    
        if (remainingSteps <= 0) {
            console.log("✅ myLoop completed all steps.");
            playing = false;
            return;
        }
    
        setTimeout(function() {
            if (reloader == 1) return; // Stop execution if `finisher()` was called
    
            if (!pauser) {
                baseAlgorithm(p);
                ACEAlgorithm(p);
                baseDisplay();
                ACEDisplay();
    
                if (p < workload.length - 1) {  
                    p++;
                    updateProgress(p, workload.length);
                }
    
                aceWriteBatches.push(ACEwriteIO);
                traditionalWriteBatches.push(writeIO);
    
                tradLatency = calculateLatency(writeIO, readIO, false) / 1000;
                aceLatencyval = calculateLatency(ACEwriteIO, ACEreadIO, true) / 1000;
    
                aceLatency.push(aceLatencyval);
                traditionalLatency.push(tradLatency);
    
                updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
                updateLatencyPlot(aceLatency, traditionalLatency);
    
                console.log(`✅ Step after increment: ${p}`);
                console.log(`✅ Progress updated to: ${Math.round((p / workload.length) * 100)}%`);
            }
    
            if (firstWrite && ACEpagesWritten > 0) {
                $("#ACEAlert").css('visibility', 'visible');
                $("#ACERow").css({
                    "border-color": "blue",
                    "border-width": "4px",
                    "border-style": "solid"
                });
                firstWrite = false;
            }
    
            if (playing) { // ✅ Only continue if playing is true
                myLoop(remainingSteps - 1);
            } else {
                console.log("⏸️ Simulation paused or manually stepped forward.");
            }
        }, delay);
    }
    
    
    $("#play-button").click(function() {
        if (playing) {
            pauser = !pauser; // Toggle pause/play
            if (pauser) {
                console.log("⏸️ Simulation paused.");
            } else {
                console.log("▶️ Simulation resumed.");
                reloader = 0; // ✅ Allow myLoop to execute
                myLoop(workload.length - p); // ✅ Resume from current step
            }
        } else {
            playing = true; // ✅ Ensure playing is set to true when resuming
            pauser = false; // ✅ Ensure it's not paused when starting
            reloader = 0;   // ✅ Reset reloader so simulation continues
            console.log("▶️ Starting simulation...");
            myLoop(workload.length - p); // ✅ Start from current step
        }
    });
    
    $("#progress-bar").on("input", function () {
        if (!workload || workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot update progress.");
            return;
        }
    
        let newProgress = parseInt($(this).val());
        let newStep = Math.round((newProgress / 100) * (workload.length - 1)); // ✅ Ensure index is within range
    
        // ✅ Ensure newStep stays within valid bounds
        newStep = Math.max(0, Math.min(newStep, workload.length - 1));
    
        console.log(`⏩ Manual Progress Change: ${newProgress}% → Step ${newStep}`);
    
        // ✅ Reset simulation state
        resetStats();
        
        buffer = [];
        dirty = [];
        coldflag = [];
        uses = {};
        
        ACEbuffer = [];
        ACEdirty = []; // ✅ FIX: Properly reset ACE dirty tracking
        ACEcoldflag = [];
        ACEuses = {};
    
        bufferHit = 0;
        bufferMiss = 0;
        readIO = 0;
        writeIO = 0;
        pagesWritten = 0;
        pagesRead = 0;
        pagesEvicted = 0;
        pagesPrefetched = 0;
    
        ACEbufferHit = 0;
        ACEbufferMiss = 0;
        ACEreadIO = 0;
        ACEwriteIO = 0;
        ACEpagesWritten = 0;
        ACEpagesRead = 0;
        ACEpagesEvicted = 0;
        ACEpagesPrefetched = 0;
    
        // ✅ Re-run simulation from step 0 to newStep
        for (let i = 0; i <= newStep; i++) {
            if (workload[i] !== undefined) {  // ✅ Guard clause to prevent undefined access
                baseAlgorithm(i);
                ACEAlgorithm(i);
            } else {
                console.warn(`Skipping invalid workload index: ${i}`);
            }
        }
    
        // ✅ Force UI redraw without marking empty pages as dirty
        cleanACEBufferDisplay();
    
        // ✅ Update global step
        p = newStep;
    
        // ✅ Recalculate and update display
        baseDisplay();
        ACEDisplay();
        updateProgress(p, workload.length);
    });
    
    
    
    
    
});
/* Progress Bar Update Function */
function updateProgress(currentStep, totalSteps) {
    let progressPercent = Math.round((currentStep / totalSteps) * 100);
    console.log(`✅ Step ${currentStep}/${totalSteps} → Progress: ${progressPercent}%`);

    $("#progress-bar").val(progressPercent);  // Update slider value
    $("#progress-label").text(progressPercent + "%");  // Update label
    $("#progress-bar").trigger('change');  // Force DOM refresh
}

function getAlgorithmDisplayName(algorithmFunction, algorithmList, prefix = "") {
    const algorithmNames = ["LRU", "CFLRU", "LRU-WSR"];
    let index = algorithmList.indexOf(algorithmFunction);
    return index !== -1 ? prefix + algorithmNames[index] : "Unknown Algorithm";
}

function updateWriteBatchesPlot(aceData, traditionalData) {
    console.log("Updating Write Batches Plot with data: ", aceData, traditionalData);

    let xValues = Array.from({ length: p + 1 }, (_, i) => i + 1);
    let aceDataValues = aceData.slice(0, p + 1);
    let traditionalDataValues = traditionalData.slice(0, p + 1);

    let aceAlgorithmName = getAlgorithmDisplayName(ACEAlgorithm, [ACELRU, ACECFLRU, ACELRUWSR], "ACE-");
    let baseAlgorithmName = getAlgorithmDisplayName(baseAlgorithm, [baseLRU, baseCFLRU, baseLRUWSR]);

    var trace1 = {
        x: xValues,
        y: aceDataValues, 
        type: 'scatter',
        mode: 'lines+markers',
        name: aceAlgorithmName, // ✅ ACE algorithm name dynamically set
        line: {color: '#1B2631'}
    };

    var trace2 = {
        x: xValues,
        y: traditionalDataValues, 
        type: 'scatter',
        mode: 'lines+markers',
        name: baseAlgorithmName, // ✅ Base algorithm name dynamically set
        line: {color: 'red'}
    };

    var layout = {
        title: '',
        xaxis: { title: 'Operation steps' },
        yaxis: { title: '#Write Batches' },
        showlegend: true
    };

    var data = [trace1, trace2];

    var plotDiv = document.getElementById('write-batches-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, data, layout);  
    } else {
        Plotly.newPlot('write-batches-graph', data, layout);
    }
}

function updateLatencyPlot(aceLatency, traditionalLatency) {
    console.log("Updating Latency Plot with data: ", aceLatency, traditionalLatency);

    let xValues = Array.from({ length: p + 1 }, (_, i) => i + 1);
    let aceLatencyValues = aceLatency.slice(0, p + 1);
    let traditionalLatencyValues = traditionalLatency.slice(0, p + 1);

    let aceAlgorithmName = getAlgorithmDisplayName(ACEAlgorithm, [ACELRU, ACECFLRU, ACELRUWSR], "ACE-");
    let baseAlgorithmName = getAlgorithmDisplayName(baseAlgorithm, [baseLRU, baseCFLRU, baseLRUWSR]);

    var trace1 = {
        x: xValues,
        y: aceLatencyValues, 
        type: 'scatter',
        mode: 'lines+markers',
        name: aceAlgorithmName, // ✅ ACE algorithm name dynamically set
        line: {color: '#1B2631'}
    };

    var trace2 = {
        x: xValues,
        y: traditionalLatencyValues, 
        type: 'scatter',
        mode: 'lines+markers',
        name: baseAlgorithmName, // ✅ Base algorithm name dynamically set
        line: {color: 'red'}
    };

    var layout = {
        title: '',
        xaxis: { title: 'Operation steps' },
        yaxis: { title: 'Latency (ms)' },
        showlegend: true
    };

    var data = [trace1, trace2];

    var plotDiv = document.getElementById('latency-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, data, layout);
    } else {
        Plotly.newPlot('latency-graph', data, layout);
    }
}





/*Base Variables*/
var buffer;
var dirty;
var coldflag;
var uses;
var baseTotalBuffer = [];

var bufferHit;
var bufferMiss;
var readIO;
var writeIO;
var baseWriteIO;
var pagesWritten;
var pagesRead;
var pagesEvicted;
var pagesPrefetched;

/*ACE Variables*/
var ACEbuffer;
var ACEdirty;
var ACEcoldflag;
var ACEuses;
var ACETotalBuffer = [];

var ACEbufferHit;
var ACEbufferMiss;
var ACEreadIO;
var ACEwriteIO;
var ACEpagesWritten;
var ACEpagesRead;
var ACEpagesEvicted;
var ACEpagesPrefetched;

/*Independant Variables*/
var bufferLength;
var alphaVal;
var workload;
var p;
var ACEAlgorithm = null;
var baseAlgorithm = null;

function calculate(wload, bLen, alpha, baseAlg){
    reloader = 0;
    //global variables
    workload = wload; 
    bufferLength = bLen;
    alphaVal = alpha;
    p = 0;
    let totalSteps = workload.length;
    console.log("Starting simulation..."); // ✅ Debug log
    updateProgress(0, totalSteps); // Reset progress bar
    //assign selected algorithm
    const ACEalgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
    ACEAlgorithm = ACEalgorithms[baseAlg];
    const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
    baseAlgorithm = baseAlgorithms[baseAlg];
    //base bufferpool
    buffer = [];
    dirty = [];
    coldflag = [];
    uses = {};
    //base metric
    bufferHit = 0;
    bufferMiss = 0;
    readIO = 0;
    writeIO = 0;
    pagesWritten = 0;
    pagesRead = 0;
    pagesEvicted = 0;
    pagesPrefetched = 0;
    //ACE bufferpool
    ACEbuffer = [];
    ACEdirty = [];
    ACEcoldflag = [];
    ACEuses = {};
    //ACE metrics
    ACEbufferHit = 0;
    ACEbufferMiss = 0;
    ACEreadIO = 0;
    ACEwriteIO = 0;
    ACEpagesWritten = 0;
    ACEpagesRead = 0;
    ACEpagesEvicted = 0;
    ACEpagesPrefetched = 0;
    $("#base-alg-table").remove();
    $("#ACE-alg-table").remove();
    //base bufferpool
    var baseTotalCells = 0;
    var basetable = $('<table>').attr("id", "base-alg-table").addClass("table cmp-indiv-mp");
    for(var i = 0; i <= bufferLength / 20; i++){
        if(i == 0){
            var row = $('<tr>').addClass("tablecell");
            row.css("margin-top", "6px");
        }else{
            var row = $('<tr>').addClass("tablecell");
        }
        for(var k = 0; k < 20 && baseTotalCells < Math.ceil(bufferLength); k++){
            row.append($("<td>"));
            baseTotalCells++;
        }
        basetable.append(row);
    }
    $('#table1').append(basetable);
    
    //ACE bufferpool
    var ACETotalCells = 0;
    var ACEtable = $('<table>').attr("id", "ACE-alg-table").addClass("table cmp-indiv-mp");
    for(var i = 0; i <= bufferLength / 20; i++){
        if(i == 0){
            var row = $('<tr>').attr("id", "ACERow").addClass("tablecell");
        }else{
            var row = $('<tr>').addClass("tablecell");
        }
        for(var k = 0; k < 20 && ACETotalCells < Math.ceil(bufferLength); k++){
            row.append($("<td>"));
            ACETotalCells++;
        }
        ACEtable.append(row);
    }
    $('#table2').append(ACEtable);

    // (function myLoop(i) {
        
    //     setTimeout(function() {
    //         if(reloader == 1){
    //             return;
    //         }
    //         if(!pauser){
    //             baseAlgorithm(p);
    //             ACEAlgorithm(p);
    //             baseDisplay();
    //             ACEDisplay();    
    //             if (p < workload.length - 1) {  // ✅ Only increment if there's more work
    //                 p++;
    //                 updateProgress(p, workload.length);
    //             }

    //             aceWriteBatches.push(ACEwriteIO); // For ACE write IO
    //             traditionalWriteBatches.push(writeIO); // For Traditional write IO

    //             tradLatency = calculateLatency(writeIO, readIO, false)/1000;  
    //             aceLatencyval = calculateLatency(ACEwriteIO, ACEreadIO, true)/1000;

    //             // Store the latency data for both algorithms
    //             aceLatency.push(aceLatencyval);
    //             traditionalLatency.push(tradLatency);
    //             // Update the plot with new data
    //             updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
    //             updateLatencyPlot(aceLatency, traditionalLatency); // Update the latency plot
                
    //             console.log(`✅ Step after increment: ${p}`);  // ✅ Log after
    //             console.log(`✅ Progress updated to: ${Math.round((p / totalSteps) * 100)}%`);
    //         }
    //         if(firstWrite && ACEpagesWritten > 0){
    //             $("#ACEAlert").css('visibility', 'visible');
    //             $("#ACERow").css({"border-color": "blue", 
    //             "border-width":"4px", 
    //             "border-style":"solid"});
    //             firstWrite = false;
    //         }
    //       if (--i) myLoop(i); 
    //     }, delay)
    // })(workload.length);             
    
}

function finisher() {
    if (!workload || workload.length === 0) {
        console.warn("⚠️ No workload loaded. Cannot finish simulation.");
        return;
    }

    console.log("🏁 Finishing simulation...");
    
    playing = false;
    pauser = false;
    reloader = 0;  // ✅ Ensure reloader is reset

    // ✅ Complete all remaining steps (with boundary check)
    for (let pagesLeft = p; pagesLeft < workload.length; pagesLeft++) {
        if (pagesLeft >= workload.length) {
            console.warn(`⚠️ Attempting to process out-of-bounds workload index: ${pagesLeft}`);
            break;
        }
        baseAlgorithm(pagesLeft);
        ACEAlgorithm(pagesLeft);
    }

    // ✅ Set `p` to last valid index
    p = workload.length - 1;

    // ✅ Update display to reflect full execution
    baseDisplay();
    ACEDisplay();
    updateProgress(p, workload.length);

    // ✅ Ensure Play Button is Re-enabled
    $("#play-button").prop('disabled', false);
}




function resetStats(){
    $("#base-alg-buffer-misses").text(0);
    $("#base-alg-buffer-hits").text(0);
    $("#base-alg-pages-read").text(0);
    $("#base-alg-pages-written").text(0);
    $("#base-alg-read-IO").text(0);
    $("#base-alg-write-IO").text(0);
    $("#base-alg-pages-evicted").text(0);
    $("#base-alg-latency").text(0);

    $("#ace-alg-buffer-misses").text(0);
    $("#ace-alg-buffer-hits").text(0);
    $("#ace-alg-pages-read").text(0);
    $("#ace-alg-pages-written").text(0);
    $("#ace-alg-read-IO").text(0);
    $("#ace-alg-write-IO").text(0);
    $("#ace-alg-pages-evicted").text(0);
    $("#ace-alg-latency").text(0);
}

function calculatePercentageDifference(baseValue, aceValue) {
    if (baseValue === 0.000) return "0.00%"; // Avoid division by zero
    const diff = ((aceValue - baseValue) / baseValue) * 100;
    // Only prepend '+' if the difference is strictly greater than 0
    if (diff > 0) {
        return `+${diff.toFixed(2)}%`;
    } else if (diff < 0) {
        return `${diff.toFixed(2)}%`;
    } else {
        return "0.00%"; // Explicitly return "0%" without a "+"
    }
}

function baseDisplay() {
    // Update end of buffer pool
    console.log("Updating baseDisplay...");  // Debugging log
    let i = 0;
    $("#base-alg-table tr").each(function () {
        $('td', this).each(function () {
            if (dirty.includes(buffer[i])) {
                $(this).css("background-color", "#892417");  // Dark Red (Navbar)
            } else if (buffer[i] == null) {
                $(this).css("background-color", "#F2F3F4");  // Super Light Grey
            } else {
                $(this).css("background-color", "#5D6D7E");  // Blue-Grey for Clean Pages
            }
            i++;
        });
    });

    // Update metrics
    $("#base-alg-buffer-misses").text(bufferMiss);
    $("#base-alg-buffer-hits").text(bufferHit);
    $("#base-alg-pages-read").text(pagesRead);
    $("#base-alg-pages-written").text(pagesWritten);
    $("#base-alg-read-IO").text(readIO);
    $("#base-alg-write-IO").text(writeIO);
    $("#base-alg-pages-evicted").text(pagesEvicted);
    $("#base-alg-latency").text(tradLatency.toFixed(2));  
                    
}

function ACEDisplay() {
    console.log("🔄 Updating ACE Display...");

    let i = 0;
    $("#ACE-alg-table tr").each(function () {
        $('td', this).each(function () {
            if (ACEbuffer[i] === undefined || ACEbuffer[i] === null) {
                $(this).css("background-color", "#F2F3F4");  // Super Light Grey
            } else if (ACEdirty.includes(ACEbuffer[i])) {
                $(this).css("background-color", "#892417");  // Dark Red (Dirty)
            } else {
                $(this).css("background-color", "#5D6D7E");  // Blue-Grey (Clean Pages)
            }
            i++;
        });
    });

    // ✅ Update metrics to reflect the correct state
    $("#ace-alg-buffer-misses").text(ACEbufferMiss);
    $("#ace-alg-buffer-hits").text(ACEbufferHit);
    $("#ace-alg-pages-read").text(ACEpagesRead);
    $("#ace-alg-pages-written").text(ACEpagesWritten);
    $("#ace-alg-read-IO").text(ACEreadIO);
    $("#ace-alg-write-IO").text(ACEwriteIO);
    $("#ace-alg-pages-evicted").text(ACEpagesEvicted);
    $("#ace-alg-latency").text(aceLatencyval.toFixed(2));  // Display ACE Latency with 2 decimal places

    // Calculate and display percentage differences
    const bufferMissDiff = calculatePercentageDifference(bufferMiss, ACEbufferMiss);
    const bufferHitDiff = calculatePercentageDifference(bufferHit, ACEbufferHit);
    const pagesReadDiff = calculatePercentageDifference(pagesRead, ACEpagesRead);
    const pagesWrittenDiff = calculatePercentageDifference(pagesWritten, ACEpagesWritten);
    const readIODiff = calculatePercentageDifference(readIO, ACEreadIO);
    const writeIODiff = calculatePercentageDifference(writeIO, ACEwriteIO);
    const pagesEvictedDiff = calculatePercentageDifference(pagesEvicted, ACEpagesEvicted);
    const latencydiff = calculatePercentageDifference(tradLatency, aceLatencyval);

    // ✅ Display the values with color-coded percentage differences
    $("#ace-alg-buffer-misses").html(`${ACEbufferMiss} &nbsp; ${formatDifference(bufferMissDiff, true)}`);
    $("#ace-alg-buffer-hits").html(`${ACEbufferHit} &nbsp; ${formatDifference(bufferHitDiff, false)}`);
    $("#ace-alg-pages-read").html(`${ACEpagesRead} &nbsp; ${formatDifference(pagesReadDiff, true)}`);
    $("#ace-alg-pages-written").html(`${ACEpagesWritten} &nbsp; ${formatDifference(pagesWrittenDiff, true)}`);
    $("#ace-alg-read-IO").html(`${ACEreadIO} &nbsp; ${formatDifference(readIODiff, true)}`);
    $("#ace-alg-write-IO").html(`${ACEwriteIO} &nbsp; ${formatDifference(writeIODiff, true)}`);
    $("#ace-alg-pages-evicted").html(`${ACEpagesEvicted} &nbsp; ${formatDifference(pagesEvictedDiff, true)}`);
    $("#ace-alg-latency").html(`${aceLatencyval.toFixed(2)} &nbsp; ${formatDifference(latencydiff, true)}`);
}

function formatDifference(diffStr, isLowerBetter) {
    if (diffStr === "0.00%") {
        return `<span style="color: black;">(--)</span>`;  // Show "--" for no difference
    }

    let diffValue = parseFloat(diffStr);
    let color;

    if (isLowerBetter) {
        // Lower value is better → Green if negative, Red if positive
        color = diffValue < 0 ? "green" : "red";
    } else {
        // Higher value is better → Green if positive, Red if negative
        color = diffValue > 0 ? "green" : "red";
    }

    return `<span style="color: ${color};">(${diffStr})</span>`;
}

function baseLRU(p){
    var type = workload[p][0];
    var page = workload[p][1];

    // add to dirty if "W"
    if (type == "W" && !dirty.includes(page)){
        dirty.push(page);
    }
    // if buffer has page
    if (buffer.includes(page)){
        bufferHit++;
        //move page to the end of buffer array
        buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
        if(dirty.includes(page)){
            dirty.push(dirty.splice(dirty.indexOf(page),1)[0]);
        }
        
    }
    else
    {
        bufferMiss++;
        readIO++;
        //if buffer not full
        if (buffer.length < bufferLength){
            buffer.push(page);
            pagesRead++;
        }else{
            base(page);
        }
    }
}

function ACELRU(p){

    var type = workload[p][0];
    var page = workload[p][1];

    // add to dirty if "W"
    if (type == "W" && !ACEdirty.includes(page))
        ACEdirty.push(page);

    // if buffer has page
    if (ACEbuffer.includes(page)){
        ACEbufferHit++;
        //move page to the end of buffer array
        ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(page), 1)[0]);
        ACEdirty.push(ACEdirty.splice(ACEdirty.indexOf(page),1)[0]);
    }
    else
    {
        ACEbufferMiss++;
        ACEreadIO++;
        //if buffer not full
        if (ACEbuffer.length < bufferLength){
            ACEbuffer.push(page);
            ACEpagesRead++;
        }else
            ACE(page);
            
    }
    
}

function baseCFLRU(p){
    const cleanPer = 1/3;
    const cleanSize = Math.floor(buffer.length * cleanPer);
    
    var type = workload[p][0];
    var page = workload[p][1];

    // add to dirty if "W"
    if (type == "W" && !dirty.includes(page)){
        dirty.push(page);
    }
    // if buffer has page
    if (buffer.includes(page)){
        bufferHit++;
        //move page to the end of buffer array
        buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
        dirty.push(dirty.splice(dirty.indexOf(page),1)[0]);
    }
    else
    {
        bufferMiss++;
        readIO++;
        //if buffer not full
        if (buffer.length < bufferLength){
            buffer.push(page);
            pagesRead++;
        } else{
        //if buffer full
            var cleanFirst = buffer.slice(0, cleanSize - 1);
            var allDirty = true;
            for (var k = 0; k < cleanSize - 1; k++){
                if (!dirty.includes(cleanFirst[k])){ 
                    
                    allDirty = false;
                }
            }
            //if all pages in clean first region are dirty, then run algorithms
            if (allDirty){ 
                base(page);
            }
            //if there are clean pages, evict clean page first
            else {
                //iterate through clean first region of buffer until you find a clean page
                var j = 0;
                while (dirty.includes(cleanFirst[j])){
                    j++;
                } 
                buffer.splice(buffer.indexOf(cleanFirst[j]),1);
                buffer.push(page);
            }
        }
    }
}

function ACECFLRU(p){
    const ACEcleanPer = 1/3;
    const ACEcleanSize = Math.floor(ACEbuffer.length * ACEcleanPer);
    
    var type = workload[p][0];
    var page = workload[p][1];

    // add to dirty if "W"
    if (type == "W" && !ACEdirty.includes(page)){
        ACEdirty.push(page);
    }
    // if buffer has page
    if (ACEbuffer.includes(page)){
        ACEbufferHit++;
        //move page to the end of buffer array
        ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(page), 1)[0]);
        ACEdirty.push(ACEdirty.splice(ACEdirty.indexOf(page),1)[0]);
    }
    else
    {
        ACEbufferMiss++;
        ACEreadIO++;
        //if buffer not full
        if (ACEbuffer.length < bufferLength){
            ACEbuffer.push(page);
            ACEpagesRead++;
        } else{
        //if buffer full
            var ACEcleanFirst = ACEbuffer.slice(0, ACEcleanSize - 1);
            var ACEallDirty = true;
            for (var k = 0; k < ACEcleanSize - 1; k++){
                if (!ACEdirty.includes(ACEcleanFirst[k])){ 
                    
                    ACEallDirty = false;
                }
            }
            //if all pages in clean first region are dirty, then run algorithms
            if (ACEallDirty){ 
                ACE(page);
            }
            //if there are clean pages, evict clean page first
            else {
                //iterate through clean first region of buffer until you find a clean page
                var j = 0;
                while (ACEdirty.includes(ACEcleanFirst[j])){
                    j++;
                } 
                ACEbuffer.splice(ACEbuffer.indexOf(ACEcleanFirst[j]),1);
                ACEbuffer.push(page);
            }
        }
    }
}



function baseLRUWSR(p) {
    const type = workload[p][0];
    const page = workload[p][1];

    console.log(`\n[STEP ${p}] Access: ${type} Page: ${page}`);

    // Mark page dirty if it's a write
    if (type === "W" && !dirty.includes(page)) {
        dirty.push(page);
        console.log(`Marked page ${page} as dirty.`);
    }

    // Page is in buffer (HIT)
    if (buffer.includes(page)) {
        bufferHit++;
        console.log(`Page ${page} is in buffer (HIT). Moving to MRU.`);

        const idx = buffer.indexOf(page);

        // Move page and its cold-flag to MRU (end)
        const pg = buffer.splice(idx, 1)[0];
        const flag = coldflag.splice(idx, 1)[0];
        buffer.push(pg);
        coldflag.push(flag);

        // Reset cold-flag if dirty
        if (dirty.includes(page)) {
            coldflag[coldflag.length - 1] = 0;
            console.log(`Reset cold-flag for dirty page ${page} to 0.`);
        }

    } else {
        // Page Miss (not in buffer)
        bufferMiss++;
        readIO++;
        pagesRead++;
        console.log(`Page ${page} is NOT in buffer (MISS).`);

        // Buffer has room
        console.log(`buffer length ${bufferLength}`);
        if (buffer.length < bufferLength) {
            buffer.push(page);
            const flag = 0;
            coldflag.push(flag);
            if (type === "W" && !dirty.includes(page)) {
                dirty.push(page);
            }
            console.log(`Inserted page ${page} (flag=${flag}) into buffer.`);

        } else {
            // Buffer Full: Start LRU-WSR eviction
            console.log(`Buffer is full. Starting eviction process.`);

            let evicted = false;

            while (!evicted) {

                const candidate = buffer[0];
                const isDirty = dirty.includes(candidate);
                const isCold = coldflag[0] === 1;

                console.log(`Considering LRU page ${candidate} (dirty=${isDirty}, cold=${isCold})`);

                if (isDirty && !isCold) {
                    // Give second chance: mark cold and move to MRU
                    buffer.push(buffer.shift());
                    coldflag.push(1); coldflag.shift();
                    console.log(`Second-chance for dirty page ${candidate}. Set cold-flag to 1 and moved to MRU.`);
                } else {
                    // Evict this page (clean or cold-dirty)
                    if (isDirty) {
                        dirty.splice(dirty.indexOf(candidate), 1);
                        pagesWritten++;
                        writeIO++;
                        console.log(`Evicting dirty page ${candidate}. Flushed to storage.`);
                    } else {
                        console.log(`Evicting clean page ${candidate}.`);
                    }

                    buffer.shift();
                    coldflag.shift();
                    pagesEvicted++;
                    evicted = true;
                }
            }

            // Insert the new page after eviction
            buffer.push(page);
            const flag = 0;
            coldflag.push(flag);
            if (type === "W" && !dirty.includes(page)) {
                dirty.push(page);
            }

            console.log(`Inserted new page ${page} into buffer (flag=${flag}).`);
        }
    }

    // Final state of all data structures
    console.log(`Buffer:        [${buffer.join(", ")}]`);
    console.log(`ColdFlags:     [${coldflag.join(", ")}]`);
    console.log(`Dirty Pages:   [${dirty.join(", ")}]`);
    console.log(`BufferHits: ${bufferHit}, BufferMisses: ${bufferMiss}, PagesEvicted: ${pagesEvicted}, PagesWritten: ${pagesWritten}, ReadIO: ${readIO}, WriteIO: ${writeIO}`);
}


// function baseLRUWSR(p){

//     var type = workload[p][0];
//     var page = workload[p][1];

//     // add to dirty if "W"
//     if (type == "W" && !dirty.includes(page)){
//         dirty.push(page);
//     }
    
//     // if buffer has page
//     if (buffer.includes(page)){
//         bufferHit++;
//         //move page to the end of buffer array
//         buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
//         if(dirty.includes(page)){
//             dirty.push(dirty.splice(dirty.indexOf(page),1)[0]);
//             coldflag[coldflag.indexOf(page)] = 1;
//         }
//         coldflag.push(coldflag.splice(coldflag.indexOf(page), 1)[0]);

//     }else{

//         bufferMiss++;
//         readIO++;
//         //if buffer not full
//         if (buffer.length < bufferLength){
//             buffer.push(page);
//             if(dirty.includes(page)){
//                 coldflag.push(1);
//             }else{
//                 coldflag.push(0);
//             }
//             pagesRead++;
//         }else{
//             let eviction = 0;
//             while(eviction < 1){
//                 //cycle untile cold flag of 0 is found
//                 const first = buffer[0];
//                 if (dirty.includes(first)){
//                     if(coldflag[0] == 0){
//                         dirty.splice(dirty.indexOf(first), 1);
//                         eviction++;
//                         pagesWritten++;
//                         writeIO++;
//                     }else{
//                         coldflag[0] = 0;
//                         coldflag.push(coldflag.splice(0, 1)[0]);
//                         buffer.push(buffer.splice(0, 1)[0]);
//                         dirty.push(dirty.splice(dirty.indexOf(first),1)[0]);
//                     }
                    
//                 }else{
//                     eviction++;
//                 }
                
//             }
            
//             coldflag.shift();
//             buffer.shift(); // remove one item from buffer (evict page)
            
//             pagesEvicted++;
//             //add page to bufferpool and log flag
//             buffer.push(page);
//             if(dirty.includes(page)){
//                 coldflag.push(1);
//             }else{
//                 coldflag.push(0);
//             }
//             pagesRead++;

//         }
//     }
//     //console.log(buffer);
//     //console.log(coldflag);
//     //console.log(dirty);

//     //start with small buffer and bug check
// }



function ACELRUWSR(p) {
    const type = workload[p][0];
    const page = workload[p][1];

    console.log(`\n[ACE STEP ${p}] Access: ${type} Page: ${page}`);

    // Mark page dirty if it's a write
    if (type === "W" && !ACEdirty.includes(page)) {
        ACEdirty.push(page);
        console.log(`Marked page ${page} as dirty.`);
    }

    // Page is in buffer (HIT)
    if (ACEbuffer.includes(page)) {
        ACEbufferHit++;
        console.log(`Page ${page} is in buffer (HIT). Moving to MRU.`);

        const idx = ACEbuffer.indexOf(page);
        const pg = ACEbuffer.splice(idx, 1)[0];
        const flag = ACEcoldflag.splice(idx, 1)[0];
        ACEbuffer.push(pg);
        ACEcoldflag.push(flag);

        if (ACEdirty.includes(page)) {
            ACEcoldflag[ACEcoldflag.length - 1] = 0;
            console.log(`Reset cold-flag for dirty page ${page} to 0.`);
        }

    } else {
        // Page Miss (not in buffer)
        ACEbufferMiss++;
        ACEreadIO++;
        ACEpagesRead++;
        console.log(`Page ${page} is NOT in buffer (MISS).`);

        console.log(`buffer length ${bufferLength}`);
        if (ACEbuffer.length < bufferLength) {
            ACEbuffer.push(page);
            const flag = 0;
            ACEcoldflag.push(flag);
            if (type === "W" && !ACEdirty.includes(page)) {
                ACEdirty.push(page);
            }
            console.log(`Inserted page ${page} (flag=${flag}) into buffer.`);
        } else {
            // Buffer Full: Start eviction process
            console.log(`Buffer is full. Starting eviction process.`);

            let evicted = false;

            while (!evicted) {
                const candidate = ACEbuffer[0];
                const isDirty = ACEdirty.includes(candidate);
                const isCold = ACEcoldflag[0] === 1;

                console.log(`Considering LRU page ${candidate} (dirty=${isDirty}, cold=${isCold})`);

                if (isDirty && !isCold) {
                    // Second chance: mark cold and move to MRU
                    ACEbuffer.push(ACEbuffer.shift());
                    ACEcoldflag.push(1);
                    ACEcoldflag.shift();
                    console.log(`Second-chance for dirty page ${candidate}. Set cold-flag to 1 and moved to MRU.`);
                } else {
                    // Evict this page (clean or cold-dirty)
                    if (isDirty) {
                        console.log(`Dirty and cold. Flushing ${alphaVal} dirty pages concurrently before eviction.`);

                        let flushed = 0;
                        // write back K pages to exploit the concurrency
                        for (let y = 0; y < alphaVal; y++) {
                            for (let i = 0; i < ACEbuffer.length; i++) {
                                const flushCandidate = ACEbuffer[i];
                                if (ACEdirty.includes(flushCandidate)) {
                                    ACEdirty.splice(ACEdirty.indexOf(flushCandidate), 1);
                                    ACEpagesWritten++;
                                    flushed++;
                                    console.log(`Flushed dirty page ${flushCandidate}.`);
                                    break;
                                }
                            }
                        }

                        if (flushed > 0) {
                            ACEwriteIO++;
                            console.log(`Total dirty pages flushed: ${flushed}`);
                        }

                        console.log(`Evicting dirty page ${candidate}. Flushed to storage.`);
                    } else {
                        console.log(`Evicting clean page ${candidate}.`);
                    }

                    ACEbuffer.shift();
                    ACEcoldflag.shift();
                    ACEpagesEvicted++;
                    evicted = true;
                }
            }

            // Insert new page after eviction
            ACEbuffer.push(page);
            const flag = 0;
            ACEcoldflag.push(flag);
            if (type === "W" && !ACEdirty.includes(page)) {
                ACEdirty.push(page);
            }
            ACEpagesRead++;
            console.log(`Inserted new page ${page} into buffer (flag=${flag}).`);
        }
    }

    // Final state of all data structures
    console.log(`Buffer:        [${ACEbuffer.join(", ")}]`);
    console.log(`ColdFlags:     [${ACEcoldflag.join(", ")}]`);
    console.log(`Dirty Pages:   [${ACEdirty.join(", ")}]`);
    console.log(`BufferHits: ${ACEbufferHit}, BufferMisses: ${ACEbufferMiss}, PagesEvicted: ${ACEpagesEvicted}, PagesWritten: ${ACEpagesWritten}, ReadIO: ${ACEreadIO}, WriteIO: ${ACEwriteIO}`);
}


// function ACELRUWSR(p){

//     var type = workload[p][0];
//     var page = workload[p][1];

//     // add to dirty if "W"
//     if (type == "W" && !ACEdirty.includes(page)){
//         ACEdirty.push(page);
//     }
    
//     // if buffer has page
//     if (ACEbuffer.includes(page)){
//         ACEbufferHit++;
//         //move page to the end of buffer array
//         if(ACEdirty.includes(page)){
//             ACEdirty.push(ACEdirty.splice(ACEdirty.indexOf(page),1)[0]);
//             ACEcoldflag[ACEbuffer.indexOf(page)] = 1;
//         } 
//         ACEcoldflag.push(ACEcoldflag.splice(ACEbuffer.indexOf(page), 1)[0]);
//         ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(page), 1)[0]);
//     }else{

//         ACEbufferMiss++;
//         ACEreadIO++;
//         //if buffer not full
//         if (ACEbuffer.length < bufferLength){
//             ACEbuffer.push(page);
//             if(ACEdirty.includes(page)){
//                 ACEcoldflag.push(1);
//             }else{
//                 ACEcoldflag.push(0);
//             }
//             ACEpagesRead++;
//         }else{

//             const first = ACEbuffer[0];
//             if (ACEdirty.includes(first)){
//                 let awru = 0;
//                     for(var i = 0; i < ACEdirty.length; i++){

//                         if(ACEcoldflag[ACEbuffer.indexOf(ACEdirty[i])] == 0){
                            
//                             ACEdirty.splice(i, 1);
//                             ACEpagesWritten++;
//                             i--;
//                         }else{

//                             ACEcoldflag[ACEbuffer.indexOf(ACEdirty[i])] = 0;
//                             ACEcoldflag.push(ACEcoldflag.splice(ACEbuffer.indexOf(ACEdirty[i]), 1)[0]);
//                             ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(ACEdirty[i]), 1)[0]);
//                             ACEdirty.push(ACEdirty.splice(i,1)[0]);
//                             i--;
//                         }
//                         awru++;  
//                         if(awru == 8){
//                             break;
//                         }
//                     }
//                 ACEwriteIO++;
//             }
            
            
//             ACEcoldflag.shift();
//             ACEbuffer.shift(); // remove one item from buffer (evict page)
            
//             ACEpagesEvicted++;
//             //add page to bufferpool and log flag
//             ACEbuffer.push(page);
//             if(ACEdirty.includes(page)){
//                 ACEcoldflag.push(1);
//             }else{
//                 ACEcoldflag.push(0);
//             }
//             ACEpagesRead++;

//         }
//     }
//     //console.log(ACEbuffer);
//     //console.log(ACEcoldflag);
//     //console.log(ACEdirty);

//     //start with small buffer and bug check
// }


/*Algorithms*/
function base(page){
    // remove item from dirty (write page)
    const first = buffer[0];
    if (dirty.includes(first)){
        dirty.splice(dirty.indexOf(first), 1);
        pagesWritten++;
        writeIO++;

    }
    buffer.shift(); // remove one item from buffer (evict page)
    pagesEvicted++;
    buffer.push(page);
    pagesRead++;
}

function ACE(page){
    
    //loop through buffer until N amount of dirty pages are written
    let first = ACEbuffer[0];
    if(ACEdirty.includes(first)){
        for(var y = 0; y < alphaVal; y++){
            for(var i = 0; i < bufferLength; i++){
                first = ACEbuffer[i];
                if (ACEdirty.includes(first)){
                    ACEdirty.splice(ACEdirty.indexOf(ACEbuffer[i]), 1);
                    ACEpagesWritten++;
                    break;
                }
            }
        }
        ACEwriteIO++;
    }
    //window.alert(x);
    ACEbuffer.shift();
    ACEpagesEvicted++; // remove one item from buffer
    ACEbuffer.push(page);
    ACEpagesRead++;
}

// function baseCC(algorithm){
//     for (var j = 0; j < workload.length; j++){
//         var type = workload[j][0];
//         var page = workload[j][1];

//         // add to dirty if "W"
//         if (type == "W" && !dirty.includes(page)){
//             dirty.push(page);
//         }

//         // if buffer has page
//         if (buffer.includes(page)){
//             bufferHit++;
//             //move page to the end of buffer array
//             buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
//         }
//         // if buffer doesn't have page
//         else
//         {
//             bufferMiss++;
//             readIO++;
//             //if buffer not full
//             if (buffer.length < bufferLength)
//                 buffer.push(page);
//             else
//             {
//                 if (algorithm == base){
//                     // remove item from dirty
//                     var checkIndex = 0;
//                     var target = buffer[checkIndex];
//                     while (dirty.includes(target) && checkIndex < buffer.length -1){
//                         checkIndex++;
//                         target = buffer[checkIndex];
//                     }
//                     buffer.splice(checkIndex,1); // remove one item from buffer
//                     buffer.push(page);
//                 } else {
//                     algorithm(page);
//                 }
//             }
//         }
//     }
//     return[bufferMiss, readIO, writeIO, writeCost];
// }

//returns IO of base and ACE

function IOcalc(wload, bLen, alpha, baseAlg){
    //global variables
    workload = wload; 
    bufferLength = bLen;
    alphaVal = alpha;
    //assign selected algorithm
    const ACEalgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
    ACEAlgorithm = ACEalgorithms[baseAlg];
    const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
    baseAlgorithm = baseAlgorithms[baseAlg];
    //base bufferpool
    buffer = [];
    dirty = [];
    coldflag = [];
    uses = {};
    //base metric
    bufferHit = 0;
    bufferMiss = 0;
    readIO = 0;
    writeIO = 0;
    pagesWritten = 0;
    pagesRead = 0;
    pagesEvicted = 0;
    pagesPrefetched = 0;
    //ACE bufferpool
    ACEbuffer = [];
    ACEdirty = [];
    ACEcoldflag = [];
    ACEuses = {};
    //ACE metrics
    ACEbufferHit = 0;
    ACEbufferMiss = 0;
    ACEreadIO = 0;
    ACEwriteIO = 0;
    ACEpagesWritten = 0;
    ACEpagesRead = 0;
    ACEpagesEvicted = 0;
    ACEpagesPrefetched = 0;
    for(var quick = 0; quick < workload.length; quick++){
        baseAlgorithm(quick);
        ACEAlgorithm(quick);
    }
    return [writeIO,readIO, ACEwriteIO,ACEreadIO];
}