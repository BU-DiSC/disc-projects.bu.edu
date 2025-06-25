const state = {
    indiv: {
        // Base Variables
        buffer: [],
        dirty: [],
        coldflag: [],
        uses: {},
        baseTotalBuffer: [],

        bufferHit: 0,
        bufferMiss: 0,
        readIO: 0,
        writeIO: 0,
        baseWriteIO: 0,
        pagesWritten: 0,
        pagesRead: 0,
        pagesEvicted: 0,
        pagesPrefetched: 0,

        // ACE Variables
        ACEbuffer: [],
        ACEdirty: [],
        ACEcoldflag: [],
        ACEuses: {},
        ACETotalBuffer: [],

        ACEbufferHit: 0,
        ACEbufferMiss: 0,
        ACEreadIO: 0,
        ACEwriteIO: 0,
        ACEpagesWritten: 0,
        ACEpagesRead: 0,
        ACEpagesEvicted: 0,
        ACEpagesPrefetched: 0,

        // Independent Variables
        bufferLength: 0,
        alphaVal: 0,
        workload: [],
        p: 0,
        ACEAlgorithm: null,
        baseAlgorithm: null,



        // Playback Control
        pauser: false,
        reloader: 0,
        playing: false,
        firstWrite: true,
        delay: 200,
    
        // Latency & Write Batch Tracking
        aceLatency: [],
        traditionalLatency: [],
        aceWriteBatches: [],
        traditionalWriteBatches: [],
    
        // History Tracking
        bufferHistory: [],
        dirtyHistory: [],
        coldflagHistory: [],
        usesHistory: [],
    
        ACEbufferHistory: [],
        ACEdirtyHistory: [],
        ACEcoldflagHistory: [],
        ACEusesHistory: [],
    
        bufferHitHistory: [],
        bufferMissHistory: [],
        readIOHistory: [],
        writeIOHistory: [],
        pagesWrittenHistory: [],
        pagesReadHistory: [],
        pagesEvictedHistory: [],
        pagesPrefetchedHistory: [],
    
        ACEbufferHitHistory: [],
        ACEbufferMissHistory: [],
        ACEreadIOHistory: [],
        ACEwriteIOHistory: [],
        ACEpagesWrittenHistory: [],
        ACEpagesReadHistory: [],
        ACEpagesEvictedHistory: [],
        ACEpagesPrefetchedHistory: [],
    
        // Temporary latency tracking
        tradLatency: 0,
        aceLatencyval: 0,
        sampled_steps: []       
    },

    cmp: {
        // Base Variables
        buffer: [],
        dirty: [],
        coldflag: [],
        uses: {},
        baseTotalBuffer: [],

        bufferHit: 0,
        bufferMiss: 0,
        readIO: 0,
        writeIO: 0,
        baseWriteIO: 0,
        pagesWritten: 0,
        pagesRead: 0,
        pagesEvicted: 0,
        pagesPrefetched: 0,

        // ACE Variables
        ACEbuffer: [],
        ACEdirty: [],
        ACEcoldflag: [],
        ACEuses: {},
        ACETotalBuffer: [],

        ACEbufferHit: 0,
        ACEbufferMiss: 0,
        ACEreadIO: 0,
        ACEwriteIO: 0,
        ACEpagesWritten: 0,
        ACEpagesRead: 0,
        ACEpagesEvicted: 0,
        ACEpagesPrefetched: 0,

        // Independent Variables
        bufferLength: 0,
        alphaVal: 0,
        workload: [],
        p: 0,
        ACEAlgorithm: null,
        baseAlgorithm: null
    }
};

function resetIndivState() {
    const s = state.indiv;

    // Control flags
    s.playing = false;
    s.pauser = false;
    s.reloader = 0;

    // Buffers
    s.buffer = [];
    s.dirty = [];
    s.coldflag = [];
    s.uses = {};

    s.ACEbuffer = [];
    s.ACEdirty = [];
    s.ACEcoldflag = [];
    s.ACEuses = {};

    // Metrics
    s.bufferHit = 0;
    s.bufferMiss = 0;
    s.readIO = 0;
    s.writeIO = 0;
    s.pagesWritten = 0;
    s.pagesRead = 0;
    s.pagesEvicted = 0;
    s.pagesPrefetched = 0;

    s.ACEbufferHit = 0;
    s.ACEbufferMiss = 0;
    s.ACEreadIO = 0;
    s.ACEwriteIO = 0;
    s.ACEpagesWritten = 0;
    s.ACEpagesRead = 0;
    s.ACEpagesEvicted = 0;
    s.ACEpagesPrefetched = 0;

    // Latency tracking
    s.aceLatency = [];
    s.traditionalLatency = [];
    s.tradLatency = 0;
    s.aceLatencyval = 0;
    s.sampled_steps = [];
    // Write batches
    s.aceWriteBatches = [];
    s.traditionalWriteBatches = [];
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


function initializeEmptyPlots() {
    console.log("📊 Initializing empty plots...");

    const libertineFontStyle = {
        family: 'Linux Libertine, serif',
        size: 19,
        color: '#111',
        weight: 400
    };

    // Empty traces for Write Batches Plot
    var writeBatchesData = [
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'ACE-Algorithm',
            line: { color: '#1B2631' }
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Traditional Algorithm',
            line: { color: 'red' }
        }
    ];

    var writeBatchesLayout = {
        font: libertineFontStyle,
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
            line: { color: '#1B2631' }
        },
        {
            x: [],
            y: [],
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Traditional Algorithm Latency',
            line: { color: 'red' }
        }
    ];

    var latencyLayout = {
        font: libertineFontStyle,
        title: '',
        xaxis: { title: 'Operation Steps' },
        yaxis: { title: 'Latency (ms)' },
        showlegend: true
    };

    // Create the empty plots
    Plotly.newPlot('write-batches-graph', writeBatchesData, writeBatchesLayout);
    Plotly.newPlot('latency-graph', latencyData, latencyLayout);
}


function calculateLatency(writeBatches, diskPagesRead, isACE) {
    const baseReadLatency = parseFloat($('#lat').val()) || 1;
    const asymmetry = parseFloat($('#asym').val()) || 1;
    const writeLatency = baseReadLatency * (isACE ? asymmetry : 1);
    return (writeBatches * writeLatency + diskPagesRead * baseReadLatency);
}


$(document).ready(function(){
    initializeEmptyPlots(); 
    $("#ACEAlert").css('visibility', 'hidden');
    function cleanACEBufferDisplay() {
        console.log("🔄 Cleaning ACE buffer display...");
    
        const s = state.indiv;
    
        $("#ACE-alg-table tr").each(function () {
            $('td', this).each(function (index) {
                if (!s.ACEbuffer[index]) {
                    $(this).css("background-color", "#F2F3F4");  // Super Light Grey (empty)
                }
            });
        });
    }
    
    $(document).ready(function() {
        function resetPlots() {
            const s = state.indiv;
        
            console.log("🔄 Resetting Write Batches and Latency plots...");
        
            // Clear latency and write batch arrays
            s.aceWriteBatches = [];
            s.traditionalWriteBatches = [];
            s.aceLatency = [];
            s.traditionalLatency = [];
        
            // Reset the Write Batches Plot
            const writeBatchesPlot = document.getElementById('write-batches-graph');
            if (writeBatchesPlot) {
                Plotly.react(writeBatchesPlot, [], {
                    title: '',
                    xaxis: { title: 'Operation steps' },
                    yaxis: { title: '#Write Batches' },
                    showlegend: true
                });
            }
        
            // Reset the Latency Plot
            const latencyPlot = document.getElementById('latency-graph');
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
            const s = state.indiv;
        
            console.log("Input changed, resetting stats, stopping simulation, and clearing plots...");
        
            // Stop the Simulation
            s.playing = false;
            s.pauser = false;
            s.reloader = 1;  // Ensure myLoop stops execution
        
            // Reset Control + Step Tracker
            s.firstWrite = true;
            s.p = 0;
        
            // Clear Write Batches and Latency Arrays
            s.aceWriteBatches = [];
            s.traditionalWriteBatches = [];
            s.aceLatency = [];
            s.traditionalLatency = [];
        
            // Hide ACE Alert and Reset Highlight Border
            $("#ACEAlert").css('visibility', 'hidden');
            $("#ACERow").css({ "border-color": "transparent", "border-width": "0px" });
        
            // Remove Visual Buffer Tables
            $("#base-alg-table").remove();
            $("#ACE-alg-table").remove();
        
            // Reset Buffer States and Metrics via utility
            resetIndivState();
        
            // Reset UI Panels
            resetStats();
            updateProgress(0, 100);
            resetPlots();
        
            // Re-enable play button
            $("#play-button").prop("disabled", false);
        
            console.log("   Simulation reset. Waiting for Play button.");
        }
        
        
    
        // Attach event listeners to all relevant inputs
        $("#workload, #n, #b, #e, #device, #asym, #baseAlg, #s, #lat, #alpha, #x, #d").on("change input", handleInputChange);
    });
    
    $("#backward-button").click(function () {
        const s = state.indiv;
    
        if (!s.workload || s.workload.length === 0) {
            console.warn("No workload loaded. Cannot step backward.");
            return;
        }
    
        // Pause simulation
        s.playing = false;
        s.pauser = true;
        s.reloader = 1;
    
        if (s.p > 0) {
            s.p--;  // Step back BEFORE restoring state
            console.log(`⏪ Backward: Step ${s.p}`);
    
            // Restore state
            resetStepState(s.p);
    
            // Recalculate latency values
            s.tradLatency = calculateLatency(s.writeIO, s.readIO, false) / 1000;
            s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true) / 1000;
    
            $("#base-alg-latency").text(s.tradLatency.toFixed(2));
            $("#ace-alg-latency").text(s.aceLatencyval.toFixed(2));
    
            // Update visuals
            baseDisplay();
            ACEDisplay();
            updateProgress(s.p, s.workload.length);
    
            // Remove sample *if* this step is just before a sample
            const lastSample = s.sampled_steps[s.sampled_steps.length - 1];
            if (lastSample !== undefined && s.p < lastSample) {
                s.aceLatency.pop();
                s.traditionalLatency.pop();
                s.aceWriteBatches.pop();
                s.traditionalWriteBatches.pop();
                s.sampled_steps.pop();
    
                // Update plot immediately after removal
                updateLatencyPlot();
                updateWriteBatchesPlot();
            }
    
        } else {
            console.warn("Already at the first step.");
        }
    });
    
    
    

    function resetStepState(stepIndex) {
        const s = state.indiv;
        console.log(`🔄 Rolling back to step ${stepIndex}...`);
    
        if (stepIndex < 0) {
            console.warn("⚠️ Cannot go below step 0.");
            return;
        }
    
        if (
            !s.bufferHistory[stepIndex] ||
            !s.dirtyHistory[stepIndex] ||
            !s.ACEbufferHistory[stepIndex]
        ) {
            console.warn(`⚠️ Missing history for step ${stepIndex}, skipping rollback.`);
            return;
        }
    
        try {
            // Restore buffer states
            s.buffer = JSON.parse(JSON.stringify(s.bufferHistory[stepIndex]));
            s.dirty = JSON.parse(JSON.stringify(s.dirtyHistory[stepIndex]));
            s.coldflag = JSON.parse(JSON.stringify(s.coldflagHistory[stepIndex]));
            s.uses = JSON.parse(JSON.stringify(s.usesHistory[stepIndex]));
    
            s.ACEbuffer = JSON.parse(JSON.stringify(s.ACEbufferHistory[stepIndex]));
            s.ACEdirty = JSON.parse(JSON.stringify(s.ACEdirtyHistory[stepIndex]));
            s.ACEcoldflag = JSON.parse(JSON.stringify(s.ACEcoldflagHistory[stepIndex]));
            s.ACEuses = JSON.parse(JSON.stringify(s.ACEusesHistory[stepIndex]));
    
            // Restore base metrics
            s.bufferHit = s.bufferHitHistory[stepIndex] || 0;
            s.bufferMiss = s.bufferMissHistory[stepIndex] || 0;
            s.readIO = s.readIOHistory[stepIndex] || 0;
            s.writeIO = s.writeIOHistory[stepIndex] || 0;
            s.pagesWritten = s.pagesWrittenHistory[stepIndex] || 0;
            s.pagesRead = s.pagesReadHistory[stepIndex] || 0;
            s.pagesEvicted = s.pagesEvictedHistory[stepIndex] || 0;
            s.pagesPrefetched = s.pagesPrefetchedHistory[stepIndex] || 0;
    
            // Restore ACE metrics
            s.ACEbufferHit = s.ACEbufferHitHistory[stepIndex] || 0;
            s.ACEbufferMiss = s.ACEbufferMissHistory[stepIndex] || 0;
            s.ACEreadIO = s.ACEreadIOHistory[stepIndex] || 0;
            s.ACEwriteIO = s.ACEwriteIOHistory[stepIndex] || 0;
            s.ACEpagesWritten = s.ACEpagesWrittenHistory[stepIndex] || 0;
            s.ACEpagesRead = s.ACEpagesReadHistory[stepIndex] || 0;
            s.ACEpagesEvicted = s.ACEpagesEvictedHistory[stepIndex] || 0;
            s.ACEpagesPrefetched = s.ACEpagesPrefetchedHistory[stepIndex] || 0;
    
            // Restore latency
            s.tradLatency = s.traditionalLatency[stepIndex] || 0;
            s.aceLatencyval = s.aceLatency[stepIndex] || 0;
    
            updateLatencyPlot(
                s.aceLatency.slice(0, stepIndex + 1),
                s.traditionalLatency.slice(0, stepIndex + 1)
            );
    
            console.log(`   Successfully restored state at step ${stepIndex}.`);
        } catch (error) {
            console.error("Error restoring step state:", error);
        }
    }
    
    

    
    $("#forward-button").click(function () {
        const s = state.indiv;
    
        if (!s.workload || s.workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot step forward.");
            return;
        }
    
        // Pause simulation
        s.playing = false;
        s.pauser = true;
        s.reloader = 0;
    
        if (s.p < s.workload.length - 1) {
            // Backup current state for rollback
            s.bufferHistory[s.p] = JSON.parse(JSON.stringify(s.buffer));
            s.dirtyHistory[s.p] = JSON.parse(JSON.stringify(s.dirty));
            s.coldflagHistory[s.p] = JSON.parse(JSON.stringify(s.coldflag));
            s.usesHistory[s.p] = JSON.parse(JSON.stringify(s.uses));
    
            s.ACEbufferHistory[s.p] = JSON.parse(JSON.stringify(s.ACEbuffer));
            s.ACEdirtyHistory[s.p] = JSON.parse(JSON.stringify(s.ACEdirty));
            s.ACEcoldflagHistory[s.p] = JSON.parse(JSON.stringify(s.ACEcoldflag));
            s.ACEusesHistory[s.p] = JSON.parse(JSON.stringify(s.ACEuses));
    
            s.bufferHitHistory[s.p] = s.bufferHit;
            s.bufferMissHistory[s.p] = s.bufferMiss;
            s.readIOHistory[s.p] = s.readIO;
            s.writeIOHistory[s.p] = s.writeIO;
            s.pagesWrittenHistory[s.p] = s.pagesWritten;
            s.pagesReadHistory[s.p] = s.pagesRead;
            s.pagesEvictedHistory[s.p] = s.pagesEvicted;
            s.pagesPrefetchedHistory[s.p] = s.pagesPrefetched;
    
            s.ACEbufferHitHistory[s.p] = s.ACEbufferHit;
            s.ACEbufferMissHistory[s.p] = s.ACEbufferMiss;
            s.ACEreadIOHistory[s.p] = s.ACEreadIO;
            s.ACEwriteIOHistory[s.p] = s.ACEwriteIO;
            s.ACEpagesWrittenHistory[s.p] = s.ACEpagesWritten;
            s.ACEpagesReadHistory[s.p] = s.ACEpagesRead;
            s.ACEpagesEvictedHistory[s.p] = s.ACEpagesEvicted;
            s.ACEpagesPrefetchedHistory[s.p] = s.ACEpagesPrefetched;
    
            // Step forward
            s.p++;
            console.log(`▶️ Forward: Step ${s.p}`);
    
            // Execute simulation step
            s.baseAlgorithm(s.p, s);
            s.ACEAlgorithm(s.p, s);
    
            // Calculate latency in milliseconds
            s.tradLatency = calculateLatency(s.writeIO, s.readIO, false) / 1000;
            s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true) / 1000;
    
            // Update on-screen latency values
            $("#base-alg-latency").text(s.tradLatency.toFixed(2));
            $("#ace-alg-latency").text(s.aceLatencyval.toFixed(2));
    
            // ✅ Sample every 10 steps or final step
            if (s.p % 10 === 0 || s.p === s.workload.length - 1) {
                // Record sample
                s.aceLatency.push(s.aceLatencyval);
                s.traditionalLatency.push(s.tradLatency);
                s.aceWriteBatches.push(s.ACEwriteIO);
                s.traditionalWriteBatches.push(s.writeIO);
            
                // Track sample point
                s.sampled_steps.push(s.p);
            
                updateWriteBatchesPlot();
                updateLatencyPlot();
            }
            
    
            // Update visual state
            baseDisplay();
            ACEDisplay();
            updateProgress(s.p, s.workload.length);
    
        } else {
            console.warn("⚠️ Already at the last step.");
        }
    });
    
    
    
    
    

    $("#fast-button").click(function(){
        const s = state.indiv;
        s.delay = 15;    
    });
    
    $("#medium-button").click(function(){
        const s = state.indiv;
        s.delay = 200;
    });

    $("#slow-button").click(function(){
        const s = state.indiv;
        s.delay = 1000;
    });

    $("#finish-button").click(function(){
        const s = state.indiv;
        finisher();
    });

    function myLoop(remainingSteps) {
        const s = state.indiv;
    
        if (s.reloader === 1) { 
            console.warn("myLoop has been stopped.");
            return;
        }
    
        if (remainingSteps <= 0) {
            console.log("myLoop completed all steps.");
            s.playing = false;
            return;
        }
    
        setTimeout(function () {
            if (s.reloader === 1) return; // Stop execution if `finisher()` was called
    
            if (!s.pauser) {
                // Step simulation
                s.baseAlgorithm(s.p, s);
                s.ACEAlgorithm(s.p, s);
                baseDisplay();
                ACEDisplay();
                // Update latency values
                s.tradLatency = calculateLatency(s.writeIO, s.readIO, false) / 1000;
                s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true) / 1000;
    
                // Sample for plotting every 10 steps or final step
                if (s.p % 10 === 0 || s.p === s.workload.length - 1) {
                    s.aceWriteBatches.push(s.ACEwriteIO);
                    s.traditionalWriteBatches.push(s.writeIO);
    
                    s.aceLatency.push(s.aceLatencyval);
                    s.traditionalLatency.push(s.tradLatency);
    
                    updateWriteBatchesPlot(s.aceWriteBatches, s.traditionalWriteBatches);
                    updateLatencyPlot(s.aceLatency, s.traditionalLatency);
                }
    
                // Update progress bar
                if (s.p < s.workload.length - 1) {
                    s.p++;
                    updateProgress(s.p, s.workload.length);
                }
    
                console.log(`   Step after increment: ${s.p}`);
                console.log(`   Progress updated to: ${Math.round((s.p / s.workload.length) * 100)}%`);
            }
    
            // Show ACE write alert once
            if (s.firstWrite && s.ACEpagesWritten > 0) {
                $("#ACEAlert").css('visibility', 'visible');
                $("#ACERow").css({
                    "border-color": "blue",
                    "border-width": "4px",
                    "border-style": "solid"
                });
                s.firstWrite = false;
            }
    
            // Continue loop only if still playing
            if (s.playing) {
                myLoop(remainingSteps - 1);
            } else {
                console.log("⏸️ Simulation paused or manually stepped forward.");
            }
        }, s.delay);
    }
    
    
    
    
    $("#play-button").click(function () {
        const b_val = parseInt($("#b").val());
        const alpha_val = parseFloat($("#alpha").val());
        const baseAlg = parseInt($("#baseAlg").val());
    
        const s = state.indiv;
    
        if (!s.playing) {
            if (capacity()) {
                // Always regenerate workload on fresh start
                if (s.workload.length === 0 || s.p === 0) {
                    const newworkload = generateWorkload();
                    calculate(newworkload, b_val, alpha_val, baseAlg);
    
                    const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
                    const aceAlgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
                    s.baseAlgorithm = baseAlgorithms[baseAlg];
                    s.ACEAlgorithm = aceAlgorithms[baseAlg];
                }
    
                s.playing = true;
                s.pauser = false;
                s.reloader = 0;
    
                console.log("▶️ Starting/resuming simulation...");
                myLoop(s.workload.length - s.p);
            }
        } else {
            // Toggle pause/resume
            s.pauser = !s.pauser;
            if (s.pauser) {
                console.log("Simulation paused.");
            } else {
                console.log("Simulation resumed.");
                s.reloader = 0;
                myLoop(s.workload.length - s.p);
            }
        }
    });
    
    
    
    
    
    // Plot cumulative write IOs for smoother curve
    function cumulative(arr) {
        let sum = 0;
        return arr.map(v => sum += v);
    }

    
    $("#progress-bar").on("input", function () {
        const s = state.indiv;
    
        if (!s.workload || s.workload.length === 0) {
            console.warn("⚠️ No workload loaded. Cannot update progress.");
            return;
        }
    
        let newProgress = parseInt($(this).val());
        let newStep = Math.round((newProgress / 100) * (s.workload.length - 1));
        newStep = Math.max(0, Math.min(newStep, s.workload.length - 1)); // clamp
    
        console.log(`⏩ Manual Progress Change: ${newProgress}% → Step ${newStep}`);
    
        // Reset UI and internal state
        resetStats();        // If this clears DOM visuals
        resetIndivState();   // Clear metrics, buffer, flags, etc.
    
        const samplingRate = 10;
    
        for (let i = 0; i <= newStep; i++) {
            if (s.workload[i] !== undefined) {
                s.baseAlgorithm(i,s);
                s.ACEAlgorithm(i,s);
    
                if (i % samplingRate === 0 || i === newStep) {
                    s.aceWriteBatches.push(s.ACEwriteIO);
                    s.traditionalWriteBatches.push(s.writeIO);
    
                    s.aceLatency.push(
                        calculateLatency(s.ACEwriteIO, s.ACEreadIO, true) / 1000
                    );
                    s.traditionalLatency.push(
                        calculateLatency(s.writeIO, s.readIO, false) / 1000
                    );
                }
            }
        }
    
        s.p = newStep;
    
        let baseReadLatency = parseFloat($('#lat').val()) || 1;
        let asymmetry = parseFloat($('#asym').val()) || 1;
    
        s.tradLatency = calculateLatency(s.writeIO, s.readIO, false, baseReadLatency, asymmetry) / 1000;
        s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true, baseReadLatency, asymmetry) / 1000;
    
        cleanACEBufferDisplay();
        baseDisplay();
        ACEDisplay();
        updateProgress(s.p, s.workload.length);
    
        const aceCumulative = cumulative(s.aceWriteBatches);
        const tradCumulative = cumulative(s.traditionalWriteBatches);
    
        console.log("   ACE cumulative write batches:", aceCumulative);
        console.log("   Trad cumulative write batches:", tradCumulative);
    
        updateWriteBatchesPlot(s.aceWriteBatches, s.traditionalWriteBatches);
        updateLatencyPlot(s.aceLatency, s.traditionalLatency);
    });
    
    
});

/* Progress Bar Update Function */
function updateProgress(currentStep, totalSteps) {
    let progressPercent = Math.round((currentStep / totalSteps) * 100);
    console.log(`   Step ${currentStep}/${totalSteps} → Progress: ${progressPercent}%`);

    $("#progress-bar").val(progressPercent);  // Update slider value
    $("#progress-label").text(progressPercent + "%");  // Update label
    $("#progress-bar").trigger('change');  // Force DOM refresh
}

function getAlgorithmDisplayName(algorithmFunction, algorithmList, prefix = "") {
    const algorithmNames = ["LRU", "CFLRU", "LRU-WSR"];
    let index = algorithmList.indexOf(algorithmFunction);
    return index !== -1 ? prefix + algorithmNames[index] : "Unknown Algorithm";
}

function updateWriteBatchesPlot() {
    const s = state.indiv;

    const aceWriteValues = s.aceWriteBatches;
    const tradWriteValues = s.traditionalWriteBatches;

    // X-values correspond to the steps where batches were recorded: 1, 11, 21, ...
    const xValues = aceWriteValues.map((_, i) => i * 10 + 1);

    const aceAlgorithmName = getAlgorithmDisplayName(s.ACEAlgorithm, [ACELRU, ACECFLRU, ACELRUWSR], "ACE-");
    const baseAlgorithmName = getAlgorithmDisplayName(s.baseAlgorithm, [baseLRU, baseCFLRU, baseLRUWSR]);

    const trace1 = {
        x: xValues,
        y: aceWriteValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: aceAlgorithmName,
        line: { color: '#1B2631', shape: 'spline' }
    };

    const trace2 = {
        x: xValues,
        y: tradWriteValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: baseAlgorithmName,
        line: { color: 'red', shape: 'spline' }
    };

    const layout = {
        font: {
            family: 'Linux Libertine, serif',
            size: 19,
            color: '#111',
            weight: 400
        },
        xaxis: { title: 'Operation steps' },
        yaxis: { title: '#Write Batches' },
        showlegend: true
    };

    const plotDiv = document.getElementById('write-batches-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, [trace1, trace2], layout);
    } else {
        Plotly.newPlot('write-batches-graph', [trace1, trace2], layout);
    }
}



function updateLatencyPlot() {
    const s = state.indiv;

    const aceLatencyValues = s.aceLatency;
    const traditionalLatencyValues = s.traditionalLatency;
    const xValues = aceLatencyValues.map((_, i) => i * 10 + 1);  // infer steps

    const aceAlgorithmName = getAlgorithmDisplayName(
        s.ACEAlgorithm, [ACELRU, ACECFLRU, ACELRUWSR], "ACE-"
    );
    const baseAlgorithmName = getAlgorithmDisplayName(
        s.baseAlgorithm, [baseLRU, baseCFLRU, baseLRUWSR]
    );

    const trace1 = {
        x: xValues,
        y: aceLatencyValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: aceAlgorithmName,
        line: { color: '#1B2631' }
    };

    const trace2 = {
        x: xValues,
        y: traditionalLatencyValues,
        type: 'scatter',
        mode: 'lines+markers',
        name: baseAlgorithmName,
        line: { color: 'red' }
    };

    const layout = {
        font: {
            family: 'Linux Libertine, serif',
            size: 19,
            color: '#111',
            weight: 400
        },
        xaxis: { title: 'Operation steps' },
        yaxis: { title: 'Latency (ms)' },
        showlegend: true
    };

    const plotDiv = document.getElementById('latency-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, [trace1, trace2], layout);
    } else {
        Plotly.newPlot('latency-graph', [trace1, trace2], layout);
    }
}


function calculate(wload, bLen, alpha, baseAlgID) {
    const s = state.indiv;

    s.reloader = 0;
    s.workload = wload;
    s.bufferLength = bLen;
    s.alphaVal= alpha;
    s.p = 0;

    const totalSteps = s.workload.length;
    console.log("Starting simulation...");
    updateProgress(0, totalSteps);

    // Assign algorithms
    const ACEalgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
    const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
    s.ACEAlgorithm = ACEalgorithms[baseAlgID];
    s.baseAlgorithm = baseAlgorithms[baseAlgID];
    s.baseAlgorithmID = baseAlgID;

    // Reset buffer pools
    s.buffer = [];
    s.dirty = [];
    s.coldflag = [];
    s.uses = {};

    s.ACEbuffer = [];
    s.ACEdirty = [];
    s.ACEcoldflag = [];
    s.ACEuses = {};

    // Reset base metrics
    s.bufferHit = 0;
    s.bufferMiss = 0;
    s.readIO = 0;
    s.writeIO = 0;
    s.pagesWritten = 0;
    s.pagesRead = 0;
    s.pagesEvicted = 0;
    s.pagesPrefetched = 0;

    // Reset ACE metrics
    s.ACEbufferHit = 0;
    s.ACEbufferMiss = 0;
    s.ACEreadIO = 0;
    s.ACEwriteIO = 0;
    s.ACEpagesWritten = 0;
    s.ACEpagesRead = 0;
    s.ACEpagesEvicted = 0;
    s.ACEpagesPrefetched = 0;

    // Clear existing tables
    $("#base-alg-table").remove();
    $("#ACE-alg-table").remove();

    // Create base algorithm table
    let baseTotalCells = 0;
    const baseTable = $('<table>').attr("id", "base-alg-table").addClass("table cmp-indiv-mp");

    for (let i = 0; i <= bLen / 20; i++) {
        const row = $('<tr>').addClass("tablecell");
        if (i === 0) row.css("margin-top", "6px");

        for (let k = 0; k < 20 && baseTotalCells < Math.ceil(bLen); k++) {
            row.append($("<td>"));
            baseTotalCells++;
        }
        baseTable.append(row);
    }
    $('#table1').append(baseTable);

    // Create ACE algorithm table
    let aceTotalCells = 0;
    const aceTable = $('<table>').attr("id", "ACE-alg-table").addClass("table cmp-indiv-mp");

    for (let i = 0; i <= bLen / 20; i++) {
        const row = $('<tr>').addClass("tablecell");
        if (i === 0) row.attr("id", "ACERow");

        for (let k = 0; k < 20 && aceTotalCells < Math.ceil(bLen); k++) {
            row.append($("<td>"));
            aceTotalCells++;
        }
        aceTable.append(row);
    }
    $('#table2').append(aceTable);
}



function finisher() {
    const s = state.indiv;

    if (!s.workload || s.workload.length === 0) {
        console.warn("⚠️ No workload loaded. Cannot finish simulation.");
        return;
    }

    console.log("🏁 Finishing simulation from scratch...");

    s.playing = false;
    s.pauser = false;
    s.reloader = 0;

    // Reset simulation state (just like progress-bar logic)
    resetStats();

    s.buffer = [];
    s.dirty = [];
    s.coldflag = [];
    s.uses = {};

    s.ACEbuffer = [];
    s.ACEdirty = [];
    s.ACEcoldflag = [];
    s.ACEuses = {};

    s.bufferHit = 0;
    s.bufferMiss = 0;
    s.readIO = 0;
    s.writeIO = 0;
    s.pagesWritten = 0;
    s.pagesRead = 0;
    s.pagesEvicted = 0;
    s.pagesPrefetched = 0;

    s.ACEbufferHit = 0;
    s.ACEbufferMiss = 0;
    s.ACEreadIO = 0;
    s.ACEwriteIO = 0;
    s.ACEpagesWritten = 0;
    s.ACEpagesRead = 0;
    s.ACEpagesEvicted = 0;
    s.ACEpagesPrefetched = 0;

    s.aceWriteBatches = [];
    s.traditionalWriteBatches = [];
    s.aceLatency = [];
    s.traditionalLatency = [];

    let samplingRate = 10;

    // Re-parse the values
    let baseReadLatency = parseFloat($('#lat').val()) || 1;
    let asymmetry = parseFloat($('#asym').val()) || 1;

    for (let i = 0; i < s.workload.length; i++) {
        s.baseAlgorithm(i, s);
        s.ACEAlgorithm(i, s);

        s.tradLatency = calculateLatency(s.writeIO, s.readIO, false, baseReadLatency, asymmetry) / 1000;
        s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true, baseReadLatency, asymmetry) / 1000;

        if (i % samplingRate === 0 || i === s.workload.length - 1) {
            s.aceWriteBatches.push(s.ACEwriteIO);
            s.traditionalWriteBatches.push(s.writeIO);
            s.aceLatency.push(s.aceLatencyval);
            s.traditionalLatency.push(s.tradLatency);
        }
    }

    // Final latency calculation (in case last loop iteration didn’t run sampling block)
    s.tradLatency = calculateLatency(s.writeIO, s.readIO, false, baseReadLatency, asymmetry) / 1000;
    s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true, baseReadLatency, asymmetry) / 1000;

    s.p = s.workload.length - 1;

    baseDisplay();
    ACEDisplay();
    updateProgress(s.p, s.workload.length);
    updateWriteBatchesPlot(s.aceWriteBatches, s.traditionalWriteBatches);
    updateLatencyPlot(s.aceLatency, s.traditionalLatency);
    $("#play-button").prop('disabled', false);
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
    const s = state.indiv;

    console.log("Updating baseDisplay...");

    let i = 0;
    $("#base-alg-table tr").each(function () {
        $('td', this).each(function () {
            if (s.dirty.includes(s.buffer[i])) {
                $(this).css("background-color", "#892417");  // Dirty
            } else if (s.buffer[i] == null) {
                $(this).css("background-color", "#F2F3F4");  // Empty
            } else {
                $(this).css("background-color", "#5D6D7E");  // Clean
            }
            i++;
        });
    });

    $("#base-alg-buffer-misses").text(s.bufferMiss);
    $("#base-alg-buffer-hits").text(s.bufferHit);
    $("#base-alg-pages-read").text(s.pagesRead);
    $("#base-alg-pages-written").text(s.pagesWritten);
    $("#base-alg-read-IO").text(s.readIO);
    $("#base-alg-write-IO").text(s.writeIO);
    $("#base-alg-pages-evicted").text(s.pagesEvicted);
    $("#base-alg-latency").text(s.tradLatency?.toFixed(2) ?? "0.00");
}


function ACEDisplay() {
    const s = state.indiv;

    console.log("🔄 Updating ACE Display...");

    let i = 0;
    $("#ACE-alg-table tr").each(function () {
        $('td', this).each(function () {
            if (s.ACEbuffer[i] === undefined || s.ACEbuffer[i] === null) {
                $(this).css("background-color", "#F2F3F4");
            } else if (s.ACEdirty.includes(s.ACEbuffer[i])) {
                $(this).css("background-color", "#892417");
            } else {
                $(this).css("background-color", "#5D6D7E");
            }
            i++;
        });
    });

    $("#ace-alg-buffer-misses").text(s.ACEbufferMiss);
    $("#ace-alg-buffer-hits").text(s.ACEbufferHit);
    $("#ace-alg-pages-read").text(s.ACEpagesRead);
    $("#ace-alg-pages-written").text(s.ACEpagesWritten);
    $("#ace-alg-read-IO").text(s.ACEreadIO);
    $("#ace-alg-write-IO").text(s.ACEwriteIO);
    $("#ace-alg-pages-evicted").text(s.ACEpagesEvicted);
    $("#ace-alg-latency").text(s.aceLatencyval?.toFixed(2) ?? "0.00");

    const bufferMissDiff = calculatePercentageDifference(s.bufferMiss, s.ACEbufferMiss);
    const bufferHitDiff = calculatePercentageDifference(s.bufferHit, s.ACEbufferHit);
    const pagesReadDiff = calculatePercentageDifference(s.pagesRead, s.ACEpagesRead);
    const pagesWrittenDiff = calculatePercentageDifference(s.pagesWritten, s.ACEpagesWritten);
    const readIODiff = calculatePercentageDifference(s.readIO, s.ACEreadIO);
    const writeIODiff = calculatePercentageDifference(s.writeIO, s.ACEwriteIO);
    const pagesEvictedDiff = calculatePercentageDifference(s.pagesEvicted, s.ACEpagesEvicted);
    const latencydiff = calculatePercentageDifference(s.tradLatency, s.aceLatencyval);

    $("#ace-alg-buffer-misses").html(`${s.ACEbufferMiss} &nbsp; ${formatDifference(bufferMissDiff, true)}`);
    $("#ace-alg-buffer-hits").html(`${s.ACEbufferHit} &nbsp; ${formatDifference(bufferHitDiff, false)}`);
    $("#ace-alg-pages-read").html(`${s.ACEpagesRead} &nbsp; ${formatDifference(pagesReadDiff, true)}`);
    $("#ace-alg-pages-written").html(`${s.ACEpagesWritten} &nbsp; ${formatDifference(pagesWrittenDiff, true)}`);
    $("#ace-alg-read-IO").html(`${s.ACEreadIO} &nbsp; ${formatDifference(readIODiff, true)}`);
    $("#ace-alg-write-IO").html(`${s.ACEwriteIO} &nbsp; ${formatDifference(writeIODiff, true)}`);
    $("#ace-alg-pages-evicted").html(`${s.ACEpagesEvicted} &nbsp; ${formatDifference(pagesEvictedDiff, true)}`);
    $("#ace-alg-latency").html(`${s.aceLatencyval?.toFixed(2) ?? "0.00"} &nbsp; ${formatDifference(latencydiff, true)}`);
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

function baseLRU(p, s) {
    const type = s.workload[p][0];
    const page = s.workload[p][1];

    if (type === "W" && !s.dirty.includes(page)) {
        s.dirty.push(page);
    }

    if (s.buffer.includes(page)) {
        s.bufferHit++;
        s.buffer.push(s.buffer.splice(s.buffer.indexOf(page), 1)[0]);
        if (s.dirty.includes(page)) {
            s.dirty.push(s.dirty.splice(s.dirty.indexOf(page), 1)[0]);
        }
    } else {
        s.bufferMiss++;
        s.readIO++;

        if (s.buffer.length < s.bufferLength) {
            s.buffer.push(page);
            s.pagesRead++;
        } else {
            base(page, s); // This must also accept state if it modifies buffer
        }
    }
}

function ACELRU(p, s) {
    const type = s.workload[p][0];
    const page = s.workload[p][1];

    if (type === "W" && !s.ACEdirty.includes(page)) {
        s.ACEdirty.push(page);
    }

    if (s.ACEbuffer.includes(page)) {
        s.ACEbufferHit++;
        s.ACEbuffer.push(s.ACEbuffer.splice(s.ACEbuffer.indexOf(page), 1)[0]);
        s.ACEdirty.push(s.ACEdirty.splice(s.ACEdirty.indexOf(page), 1)[0]);
    } else {
        s.ACEbufferMiss++;
        s.ACEreadIO++;

        if (s.ACEbuffer.length < s.bufferLength) {
            s.ACEbuffer.push(page);
            s.ACEpagesRead++;
        } else {
            ACE(page, s);
        }
    }
}


function baseCFLRU(p, s) {
    const cleanPer = 1 / 3;
    const cleanSize = Math.floor(s.buffer.length * cleanPer);

    const type = s.workload[p][0];
    const page = s.workload[p][1];

    // add to dirty if "W"
    if (type === "W" && !s.dirty.includes(page)) {
        s.dirty.push(page);
    }

    // if buffer has page
    if (s.buffer.includes(page)) {
        s.bufferHit++;
        // move page to the end of buffer array
        s.buffer.push(s.buffer.splice(s.buffer.indexOf(page), 1)[0]);
        s.dirty.push(s.dirty.splice(s.dirty.indexOf(page), 1)[0]);
    } else {
        s.bufferMiss++;
        s.readIO++;

        // if buffer not full
        if (s.buffer.length < s.bufferLength) {
            s.buffer.push(page);
            s.pagesRead++;
        } else {
            // if buffer full
            const cleanFirst = s.buffer.slice(0, cleanSize - 1);
            let allDirty = true;

            for (let k = 0; k < cleanSize - 1; k++) {
                if (!s.dirty.includes(cleanFirst[k])) {
                    allDirty = false;
                }
            }

            // if all pages in clean first region are dirty, then run replacement
            if (allDirty) {
                base(page, s);  // <-- Ensure `base()` is refactored to accept `s`
            } else {
                // find and evict the first clean page in the region
                let j = 0;
                while (s.dirty.includes(cleanFirst[j])) {
                    j++;
                }
                s.buffer.splice(s.buffer.indexOf(cleanFirst[j]), 1);
                s.buffer.push(page);
            }
        }
    }
}


function ACECFLRU(p, s) {
    const ACEcleanPer = 1 / 3;
    const ACEcleanSize = Math.floor(s.ACEbuffer.length * ACEcleanPer);

    const type = s.workload[p][0];
    const page = s.workload[p][1];

    // add to dirty if "W"
    if (type === "W" && !s.ACEdirty.includes(page)) {
        s.ACEdirty.push(page);
    }

    // if buffer has page
    if (s.ACEbuffer.includes(page)) {
        s.ACEbufferHit++;
        // move page to the end of buffer array
        s.ACEbuffer.push(s.ACEbuffer.splice(s.ACEbuffer.indexOf(page), 1)[0]);
        s.ACEdirty.push(s.ACEdirty.splice(s.ACEdirty.indexOf(page), 1)[0]);
    } else {
        s.ACEbufferMiss++;
        s.ACEreadIO++;

        // if buffer not full
        if (s.ACEbuffer.length < s.bufferLength) {
            s.ACEbuffer.push(page);
            s.ACEpagesRead++;
        } else {
            // if buffer full
            const ACEcleanFirst = s.ACEbuffer.slice(0, ACEcleanSize - 1);
            let ACEallDirty = true;

            for (let k = 0; k < ACEcleanSize - 1; k++) {
                if (!s.ACEdirty.includes(ACEcleanFirst[k])) {
                    ACEallDirty = false;
                }
            }

            // if all pages in clean first region are dirty, then run algorithm
            if (ACEallDirty) {
                ACE(page, s); // <-- Make sure ACE() also accepts `s`
            } else {
                // find and evict a clean page in the clean region
                let j = 0;
                while (s.ACEdirty.includes(ACEcleanFirst[j])) {
                    j++;
                }
                s.ACEbuffer.splice(s.ACEbuffer.indexOf(ACEcleanFirst[j]), 1);
                s.ACEbuffer.push(page);
            }
        }
    }
}



function baseLRUWSR(p, s) {
    const type = s.workload[p][0];
    const page = s.workload[p][1];

    console.log(`\n[STEP ${p}] Access: ${type} Page: ${page}`);

    // Mark page dirty if it's a write
    if (type === "W" && !s.dirty.includes(page)) {
        s.dirty.push(page);
        console.log(`Marked page ${page} as dirty.`);
    }

    // Page is in buffer (HIT)
    if (s.buffer.includes(page)) {
        s.bufferHit++;
        console.log(`Page ${page} is in buffer (HIT). Moving to MRU.`);

        const idx = s.buffer.indexOf(page);

        // Move page and its cold-flag to MRU (end)
        const pg = s.buffer.splice(idx, 1)[0];
        const flag = s.coldflag.splice(idx, 1)[0];
        s.buffer.push(pg);
        s.coldflag.push(flag);

        // Reset cold-flag if dirty
        if (s.dirty.includes(page)) {
            s.coldflag[s.coldflag.length - 1] = 0;
            console.log(`Reset cold-flag for dirty page ${page} to 0.`);
        }

    } else {
        // Page Miss (not in buffer)
        s.bufferMiss++;
        s.readIO++;
        s.pagesRead++;
        console.log(`Page ${page} is NOT in buffer (MISS).`);

        // Buffer has room
        console.log(`buffer length ${s.bufferLength}`);
        if (s.buffer.length < s.bufferLength) {
            s.buffer.push(page);
            const flag = 0;
            s.coldflag.push(flag);
            if (type === "W" && !s.dirty.includes(page)) {
                s.dirty.push(page);
            }
            console.log(`Inserted page ${page} (flag=${flag}) into buffer.`);

        } else {
            // Buffer Full: Start LRU-WSR eviction
            console.log(`Buffer is full. Starting eviction process.`);

            let evicted = false;

            while (!evicted) {
                const candidate = s.buffer[0];
                const isDirty = s.dirty.includes(candidate);
                const isCold = s.coldflag[0] === 1;

                console.log(`Considering LRU page ${candidate} (dirty=${isDirty}, cold=${isCold})`);

                if (isDirty && !isCold) {
                    // Give second chance: mark cold and move to MRU
                    s.buffer.push(s.buffer.shift());
                    s.coldflag.push(1);
                    s.coldflag.shift();
                    console.log(`Second-chance for dirty page ${candidate}. Set cold-flag to 1 and moved to MRU.`);
                } else {
                    // Evict this page (clean or cold-dirty)
                    if (isDirty) {
                        s.dirty.splice(s.dirty.indexOf(candidate), 1);
                        s.pagesWritten++;
                        s.writeIO++;
                        console.log(`Evicting dirty page ${candidate}. Flushed to storage.`);
                    } else {
                        console.log(`Evicting clean page ${candidate}.`);
                    }

                    s.buffer.shift();
                    s.coldflag.shift();
                    s.pagesEvicted++;
                    evicted = true;
                }
            }

            // Insert the new page after eviction
            s.buffer.push(page);
            const flag = 0;
            s.coldflag.push(flag);
            if (type === "W" && !s.dirty.includes(page)) {
                s.dirty.push(page);
            }

            console.log(`Inserted new page ${page} into buffer (flag=${flag}).`);
        }
    }

    // Final state of all data structures
    console.log(`Buffer:        [${s.buffer.join(", ")}]`);
    console.log(`ColdFlags:     [${s.coldflag.join(", ")}]`);
    console.log(`Dirty Pages:   [${s.dirty.join(", ")}]`);
    console.log(`BufferHits: ${s.bufferHit}, BufferMisses: ${s.bufferMiss}, PagesEvicted: ${s.pagesEvicted}, PagesWritten: ${s.pagesWritten}, ReadIO: ${s.readIO}, WriteIO: ${s.writeIO}`);
}

function ACELRUWSR(p, s) {
    const type = s.workload[p][0];
    const page = s.workload[p][1];

    console.log(`\n[ACE STEP ${p}] Access: ${type} Page: ${page}`);

    // Mark page dirty if it's a write
    if (type === "W" && !s.ACEdirty.includes(page)) {
        s.ACEdirty.push(page);
        console.log(`Marked page ${page} as dirty.`);
    }

    // Page is in buffer (HIT)
    if (s.ACEbuffer.includes(page)) {
        s.ACEbufferHit++;
        console.log(`Page ${page} is in buffer (HIT). Moving to MRU.`);

        const idx = s.ACEbuffer.indexOf(page);
        const pg = s.ACEbuffer.splice(idx, 1)[0];
        const flag = s.ACEcoldflag.splice(idx, 1)[0];
        s.ACEbuffer.push(pg);
        s.ACEcoldflag.push(flag);

        if (s.ACEdirty.includes(page)) {
            s.ACEcoldflag[s.ACEcoldflag.length - 1] = 0;
            console.log(`Reset cold-flag for dirty page ${page} to 0.`);
        }

    } else {
        // Page Miss (not in buffer)
        s.ACEbufferMiss++;
        s.ACEreadIO++;
        s.ACEpagesRead++;
        console.log(`Page ${page} is NOT in buffer (MISS).`);

        console.log(`buffer length ${s.bufferLength}`);
        if (s.ACEbuffer.length < s.bufferLength) {
            s.ACEbuffer.push(page);
            const flag = 0;
            s.ACEcoldflag.push(flag);
            if (type === "W" && !s.ACEdirty.includes(page)) {
                s.ACEdirty.push(page);
            }
            console.log(`Inserted page ${page} (flag=${flag}) into buffer.`);
        } else {
            // Buffer Full: Start eviction process
            console.log(`Buffer is full. Starting eviction process.`);

            let evicted = false;

            while (!evicted) {
                const candidate = s.ACEbuffer[0];
                const isDirty = s.ACEdirty.includes(candidate);
                const isCold = s.ACEcoldflag[0] === 1;

                console.log(`Considering LRU page ${candidate} (dirty=${isDirty}, cold=${isCold})`);

                if (isDirty && !isCold) {
                    // Second chance: mark cold and move to MRU
                    s.ACEbuffer.push(s.ACEbuffer.shift());
                    s.ACEcoldflag.push(1);
                    s.ACEcoldflag.shift();
                    console.log(`Second-chance for dirty page ${candidate}. Set cold-flag to 1 and moved to MRU.`);
                } else {
                    // Evict this page (clean or cold-dirty)
                    if (isDirty) {
                        console.log(`Dirty and cold. Flushing ${s.alphaVal} dirty pages concurrently before eviction.`);

                        let flushed = 0;
                        // write back K pages to exploit the concurrency
                        for (let y = 0; y < s.alphaVal; y++) {
                            for (let i = 0; i < s.ACEbuffer.length; i++) {
                                const flushCandidate = s.ACEbuffer[i];
                                if (s.ACEdirty.includes(flushCandidate)) {
                                    s.ACEdirty.splice(s.ACEdirty.indexOf(flushCandidate), 1);
                                    s.ACEpagesWritten++;
                                    flushed++;
                                    console.log(`Flushed dirty page ${flushCandidate}.`);
                                    break;
                                }
                            }
                        }

                        if (flushed > 0) {
                            s.ACEwriteIO++;
                            console.log(`Total dirty pages flushed: ${flushed}`);
                        }

                        console.log(`Evicting dirty page ${candidate}.`);
                    } else {
                        console.log(`Evicting clean page ${candidate}.`);
                    }

                    s.ACEbuffer.shift();
                    s.ACEcoldflag.shift();
                    s.ACEpagesEvicted++;
                    evicted = true;
                }
            }

            // Insert new page after eviction
            s.ACEbuffer.push(page);
            const flag = 0;
            s.ACEcoldflag.push(flag);
            if (type === "W" && !s.ACEdirty.includes(page)) {
                s.ACEdirty.push(page);
            }
            s.ACEpagesRead++;
            console.log(`Inserted new page ${page} into buffer (flag=${flag}).`);
        }
    }

    // Final state of all data structures
    console.log(`Buffer:        [${s.ACEbuffer.join(", ")}]`);
    console.log(`ColdFlags:     [${s.ACEcoldflag.join(", ")}]`);
    console.log(`Dirty Pages:   [${s.ACEdirty.join(", ")}]`);
    console.log(`BufferHits: ${s.ACEbufferHit}, BufferMisses: ${s.ACEbufferMiss}, PagesEvicted: ${s.ACEpagesEvicted}, PagesWritten: ${s.ACEpagesWritten}, ReadIO: ${s.ACEreadIO}, WriteIO: ${s.ACEwriteIO}`);
}

/*Algorithms*/
function base(page, s) {
    // remove item from dirty (write page)
    const first = s.buffer[0];
    if (s.dirty.includes(first)) {
        s.dirty.splice(s.dirty.indexOf(first), 1);
        s.pagesWritten++;
        s.writeIO++;
    }

    s.buffer.shift(); // remove one item from buffer (evict page)
    s.pagesEvicted++;
    s.buffer.push(page);
    s.pagesRead++;
}

function ACE(page, s) {
    // loop through buffer until N amount of dirty pages are written
    let first = s.ACEbuffer[0];
    if (s.ACEdirty.includes(first)) {
        for (let y = 0; y < s.alphaVal; y++) {
            for (let i = 0; i < s.bufferLength; i++) {
                first = s.ACEbuffer[i];
                if (s.ACEdirty.includes(first)) {
                    s.ACEdirty.splice(s.ACEdirty.indexOf(first), 1);
                    s.ACEpagesWritten++;
                    break;
                }
            }
        }
        s.ACEwriteIO++;
    }

    s.ACEbuffer.shift(); // remove one item from buffer
    s.ACEpagesEvicted++;
    s.ACEbuffer.push(page);
    s.ACEpagesRead++;
}


function IOcalc(wload, bLen, alpha, baseAlg) {
    const s = state.cmp; // Use comparative state

    // Assign independent variables
    s.workload = wload;
    s.bufferLength = bLen;
    s.alphaVal = alpha;
    s.p = 0;

    // Assign algorithm functions
    const ACEalgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
    const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
    s.ACEAlgorithm = ACEalgorithms[baseAlg];
    s.baseAlgorithm = baseAlgorithms[baseAlg];

    // Reset base bufferpool state
    s.buffer = [];
    s.dirty = [];
    s.coldflag = [];
    s.uses = {};

    s.bufferHit = 0;
    s.bufferMiss = 0;
    s.readIO = 0;
    s.writeIO = 0;
    s.pagesWritten = 0;
    s.pagesRead = 0;
    s.pagesEvicted = 0;
    s.pagesPrefetched = 0;

    // Reset ACE bufferpool state
    s.ACEbuffer = [];
    s.ACEdirty = [];
    s.ACEcoldflag = [];
    s.ACEuses = {};

    s.ACEbufferHit = 0;
    s.ACEbufferMiss = 0;
    s.ACEreadIO = 0;
    s.ACEwriteIO = 0;
    s.ACEpagesWritten = 0;
    s.ACEpagesRead = 0;
    s.ACEpagesEvicted = 0;
    s.ACEpagesPrefetched = 0;

    // Run simulation using the selected algorithms
    for (let i = 0; i < s.workload.length; i++) {
        s.p = i;
        s.baseAlgorithm(i, s);
        s.ACEAlgorithm(i, s);
    }

    // Return write/read IO stats for both base and ACE
    return [s.writeIO, s.readIO, s.ACEwriteIO, s.ACEreadIO];
}
