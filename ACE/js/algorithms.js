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
        title: 'Write Batches Over Time',
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
        title: 'Latency Over Time',
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
            console.log(`⏮️ Backward: Step ${p - 1}`);
    
            // Restore state by removing the last step
            resetStepState();
    
            // Update UI (table, stats, progress bar)
            baseDisplay();
            ACEDisplay();
            updateProgress(p, workload.length);
    
            // Update the plots (WITHOUT resetting them)
            updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
            updateLatencyPlot(aceLatency, traditionalLatency);
        } else {
            console.warn("⚠️ Already at the first step.");
        }
    });
    
    function resetStepState() {
        console.log(`🔄 Rolling back one step to ${p}...`);
    
        if (p <= 0) return; // Prevent going below step 0
    
        if (!bufferHistory[p] || !dirtyHistory[p]) {
            console.warn(`⚠️ Missing history for step ${p}, skipping rollback.`);
            return;
        }
    
        try {
            // ✅ Restore buffer states correctly
            buffer = JSON.parse(JSON.stringify(bufferHistory[p]));
            dirty = JSON.parse(JSON.stringify(dirtyHistory[p]));
            coldflag = JSON.parse(JSON.stringify(coldflagHistory[p]));
            uses = JSON.parse(JSON.stringify(usesHistory[p]));
    
            ACEbuffer = JSON.parse(JSON.stringify(ACEbufferHistory[p]));
            ACEdirty = JSON.parse(JSON.stringify(ACEdirtyHistory[p]));
            ACEcoldflag = JSON.parse(JSON.stringify(ACEcoldflagHistory[p]));
            ACEuses = JSON.parse(JSON.stringify(ACEusesHistory[p]));
    
            // ✅ Restore step metrics
            bufferHit = bufferHitHistory[p] || 0;
            bufferMiss = bufferMissHistory[p] || 0;
            readIO = readIOHistory[p] || 0;
            writeIO = writeIOHistory[p] || 0;
            pagesWritten = pagesWrittenHistory[p] || 0;
            pagesRead = pagesReadHistory[p] || 0;
            pagesEvicted = pagesEvictedHistory[p] || 0;
            pagesPrefetched = pagesPrefetchedHistory[p] || 0;
    
            ACEbufferHit = ACEbufferHitHistory[p] || 0;
            ACEbufferMiss = ACEbufferMissHistory[p] || 0;
            ACEreadIO = ACEreadIOHistory[p] || 0;
            ACEwriteIO = ACEwriteIOHistory[p] || 0;
            ACEpagesWritten = ACEpagesWrittenHistory[p] || 0;
            ACEpagesRead = ACEpagesReadHistory[p] || 0;
            ACEpagesEvicted = ACEpagesEvictedHistory[p] || 0;
            ACEpagesPrefetched = ACEpagesPrefetchedHistory[p] || 0;
    
            // ✅ Ensure UI reflects restored state
            baseDisplay();
            ACEDisplay();
            updateProgress(p, workload.length);
            updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
            updateLatencyPlot(aceLatency, traditionalLatency);
    
            console.log("✅ Step state rolled back successfully.");
        } catch (error) {
            console.error("❌ Error restoring step state:", error);
        }
    }
    
    

    $("#forward-button").click(function() {
        if (!workload || workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot step forward.");
            return;
        }
    
        playing = false;  // Pause simulation
        pauser = true;    // Ensure it's paused
        reloader = 1;     // Stop auto-execution
    
        if (p < workload.length - 1) {  
            p++;  // Move one step forward
            console.log(`▶️ Forward: Step ${p}`);
    
            // ✅ Store history before updating state
            bufferHistory[p] = JSON.parse(JSON.stringify(buffer));
            dirtyHistory[p] = JSON.parse(JSON.stringify(dirty));
            coldflagHistory[p] = JSON.parse(JSON.stringify(coldflag));
            usesHistory[p] = JSON.parse(JSON.stringify(uses));
    
            ACEbufferHistory[p] = JSON.parse(JSON.stringify(ACEbuffer));
            ACEdirtyHistory[p] = JSON.parse(JSON.stringify(ACEdirty));
            ACEcoldflagHistory[p] = JSON.parse(JSON.stringify(ACEcoldflag));
            ACEusesHistory[p] = JSON.parse(JSON.stringify(ACEuses));
    
            // Execute one step of both algorithms
            baseAlgorithm(p);
            ACEAlgorithm(p);
    
            // Update the display and progress bar
            baseDisplay();
            ACEDisplay();
            updateProgress(p, workload.length);
    
            // Update the plots
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

    $("#play-button").click(function() {
        if (playing) {
            pauser = !pauser; // Toggle pause/play
        }
        if (!playing) {
            playing = true;
            // Reset any previous data if needed
            aceWriteBatches = [];
            traditionalWriteBatches = [];
    
            // Ensure the plot is created (in case it's the first time the simulation is running)
            const plotDiv = document.getElementById('write-batches-graph');
            if (plotDiv) {
                // Initialize plot with empty data (if this is the first time or after a reset)
                Plotly.newPlot(plotDiv, [], {title: 'Write Batches'}, {});
            }
            
            // Start the simulation
            myLoop(workload.length - p);
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
    var aceWriteBatches = [];
    var traditionalWriteBatches = [];
    const baseReadLatency = parseFloat($('#lat').val());  // Fetch base latency from #lat field
    const asymmetry = parseFloat($('#asym').val());  // Fetch asymmetry from #asym field
    function calculateLatency(writeBatches, diskPagesRead, isACE) {
        let writeLatency = baseReadLatency * (isACE ? asymmetry : 1);  // LRU and ACE share the same formula
        let totalLatency = (writeBatches * writeLatency) + (diskPagesRead * baseReadLatency);
        
        return totalLatency;
    }   
    (function myLoop(i) {
        setTimeout(function() {
            if(reloader == 1){
                return;
            }
            if(!pauser){
                baseAlgorithm(p);
                ACEAlgorithm(p);
                baseDisplay();
                ACEDisplay();    
                p++;
                updateProgress(p, totalSteps);

                aceWriteBatches.push(ACEwriteIO); // For ACE write IO
                traditionalWriteBatches.push(writeIO); // For Traditional write IO

                var tradLatency = calculateLatency(writeIO, readIO, false)/1000;  
                var aceLruLatency = calculateLatency(ACEwriteIO, ACEreadIO, true)/1000;

                // Store the latency data for both algorithms
                aceLatency.push(aceLruLatency);
                traditionalLatency.push(tradLatency);
                // Update the plot with new data
                updateWriteBatchesPlot(aceWriteBatches, traditionalWriteBatches);
                updateLatencyPlot(aceLatency, traditionalLatency); // Update the latency plot

                // Update the latency display on the page
                $("#base-alg-latency").text(tradLatency.toFixed(2));  // Display Traditional Latency with 2 decimal places
                $("#ace-alg-latency").text(aceLruLatency.toFixed(2));  // Display ACE Latency with 2 decimal places
                
                console.log(`✅ Step after increment: ${p}`);  // ✅ Log after
                console.log(`✅ Progress updated to: ${Math.round((p / totalSteps) * 100)}%`);
            }
            if(firstWrite && ACEpagesWritten > 0){
                $("#ACEAlert").css('visibility', 'visible');
                $("#ACERow").css({"border-color": "blue", 
                "border-width":"4px", 
                "border-style":"solid"});
                firstWrite = false;
            }
          if (--i) myLoop(i); 
        }, delay)
    })(workload.length);             
    
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

    // ✅ Complete all remaining steps
    for (let pagesLeft = p; pagesLeft < workload.length; pagesLeft++) {
        baseAlgorithm(pagesLeft);
        ACEAlgorithm(pagesLeft);
    }

    // ✅ Move progress to 100%
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
    if (baseValue === 0) return "0.00%"; // Avoid division by zero
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

    // Calculate and display percentage differences
    const bufferMissDiff = calculatePercentageDifference(bufferMiss, ACEbufferMiss);
    const bufferHitDiff = calculatePercentageDifference(bufferHit, ACEbufferHit);
    const pagesReadDiff = calculatePercentageDifference(pagesRead, ACEpagesRead);
    const pagesWrittenDiff = calculatePercentageDifference(pagesWritten, ACEpagesWritten);
    const readIODiff = calculatePercentageDifference(readIO, ACEreadIO);
    const writeIODiff = calculatePercentageDifference(writeIO, ACEwriteIO);
    const pagesEvictedDiff = calculatePercentageDifference(pagesEvicted, ACEpagesEvicted);

    $("#ace-alg-buffer-misses").html(`${ACEbufferMiss}  (${bufferMissDiff})`);
    $("#ace-alg-buffer-hits").html(`${ACEbufferHit}  (${bufferHitDiff})`);
    $("#ace-alg-pages-read").html(`${ACEpagesRead}  (${pagesReadDiff})`);
    $("#ace-alg-pages-written").html(`${ACEpagesWritten}  (${pagesWrittenDiff})`);
    $("#ace-alg-read-IO").html(`${ACEreadIO}  (${readIODiff})`);
    $("#ace-alg-write-IO").html(`${ACEwriteIO}  (${writeIODiff})`);
    $("#ace-alg-pages-evicted").html(`${ACEpagesEvicted}  (${pagesEvictedDiff})`);
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

function baseLRUWSR(p){

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
            coldflag[coldflag.indexOf(page)] = 1;
        }
        coldflag.push(coldflag.splice(coldflag.indexOf(page), 1)[0]);

    }else{

        bufferMiss++;
        readIO++;
        //if buffer not full
        if (buffer.length < bufferLength){
            buffer.push(page);
            if(dirty.includes(page)){
                coldflag.push(1);
            }else{
                coldflag.push(0);
            }
            pagesRead++;
        }else{
            let eviction = 0;
            while(eviction < 1){
                //cycle untile cold flag of 0 is found
                const first = buffer[0];
                if (dirty.includes(first)){
                    if(coldflag[0] == 0){
                        dirty.splice(dirty.indexOf(first), 1);
                        eviction++;
                        pagesWritten++;
                        writeIO++;
                    }else{
                        coldflag[0] = 0;
                        coldflag.push(coldflag.splice(0, 1)[0]);
                        buffer.push(buffer.splice(0, 1)[0]);
                        dirty.push(dirty.splice(dirty.indexOf(first),1)[0]);
                    }
                    
                }else{
                    eviction++;
                }
                
            }
            
            coldflag.shift();
            buffer.shift(); // remove one item from buffer (evict page)
            
            pagesEvicted++;
            //add page to bufferpool and log flag
            buffer.push(page);
            if(dirty.includes(page)){
                coldflag.push(1);
            }else{
                coldflag.push(0);
            }
            pagesRead++;

        }
    }
    //console.log(buffer);
    //console.log(coldflag);
    //console.log(dirty);

    //start with small buffer and bug check
}

function ACELRUWSR(p){

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
        if(ACEdirty.includes(page)){
            ACEdirty.push(ACEdirty.splice(ACEdirty.indexOf(page),1)[0]);
            ACEcoldflag[ACEbuffer.indexOf(page)] = 1;
        } 
        ACEcoldflag.push(ACEcoldflag.splice(ACEbuffer.indexOf(page), 1)[0]);
        ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(page), 1)[0]);
    }else{

        ACEbufferMiss++;
        ACEreadIO++;
        //if buffer not full
        if (ACEbuffer.length < bufferLength){
            ACEbuffer.push(page);
            if(ACEdirty.includes(page)){
                ACEcoldflag.push(1);
            }else{
                ACEcoldflag.push(0);
            }
            ACEpagesRead++;
        }else{

            const first = ACEbuffer[0];
            if (ACEdirty.includes(first)){
                let awru = 0;
                    for(var i = 0; i < ACEdirty.length; i++){

                        if(ACEcoldflag[ACEbuffer.indexOf(ACEdirty[i])] == 0){
                            
                            ACEdirty.splice(i, 1);
                            ACEpagesWritten++;
                            i--;
                        }else{

                            ACEcoldflag[ACEbuffer.indexOf(ACEdirty[i])] = 0;
                            ACEcoldflag.push(ACEcoldflag.splice(ACEbuffer.indexOf(ACEdirty[i]), 1)[0]);
                            ACEbuffer.push(ACEbuffer.splice(ACEbuffer.indexOf(ACEdirty[i]), 1)[0]);
                            ACEdirty.push(ACEdirty.splice(i,1)[0]);
                            i--;
                        }
                        awru++;  
                        if(awru == 8){
                            break;
                        }
                    }
                ACEwriteIO++;
            }
            
            
            ACEcoldflag.shift();
            ACEbuffer.shift(); // remove one item from buffer (evict page)
            
            ACEpagesEvicted++;
            //add page to bufferpool and log flag
            ACEbuffer.push(page);
            if(ACEdirty.includes(page)){
                ACEcoldflag.push(1);
            }else{
                ACEcoldflag.push(0);
            }
            ACEpagesRead++;

        }
    }
    //console.log(ACEbuffer);
    //console.log(ACEcoldflag);
    //console.log(ACEdirty);

    //start with small buffer and bug check
}
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