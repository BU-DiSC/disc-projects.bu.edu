const state = {
    tiers: {
        // pages in different tiers acc. to different algorithms
        // we may need to change this based on # of algorithms to be shown
        tier1CurPages: [[],[],[],[],[],[],[]],
        tier2CurPages: [[],[],[],[],[],[],[]],
        tier3CurPages: [[],[],[],[],[],[],[]],

        // stats as per algorithms 0, 1, 2 ...
        tier1read: [0,0,0,0,0,0,0],
        tier2read: [0,0,0,0,0,0,0],
        tier3read: [0,0,0,0,0,0,0],
        tier1write: [0,0,0,0,0,0,0],
        tier2write: [0,0,0,0,0,0,0],
        tier3write: [0,0,0,0,0,0,0],

        tier2_1Migration: [0,0,0,0,0,0,0],
        tier2_3Migration: [0,0,0,0,0,0,0],

        tier1Queue: [[],[],[],[],[],[],[]],
        tier2Queue: [[],[],[],[],[],[],[]],
        tier3Queue: [[],[],[],[],[],[],[]],

        // tier1ActiveThreads: [0,0,0,0,0,0,0],
        // tier2ActiveThreads: [0,0,0,0,0,0,0],
        // tier3ActiveThreads: [0,0,0,0,0,0,0],

        // algorithms
        algorithms: [tLRU, tLFU, tTemp, tRL, null, null, null],

        // actions
        simActions: [[], [], [], [], [], [], []],

        // metadata for each function
        page: {
            id: 0,
            lastRequestRound: 0,
            frequency: 0,
            temperature: 0.5,
            reqRounds: []
        },

        // Playback Control
        pauser: false,
        reloader: 0,
        playing: false,
        firstWrite: true,
        delay: 2000,
        started: false,

        // Independent Variables for Tiered Algorithms
        t1AlphaVal: 1,
        t2AlphaVal: 1,
        t3AlphaVal: 1,
        t1ReadLatency: 0,
        t2ReadLatency: 0,
        t3ReadLatency: 0,
        t1Concurrency: 1,
        t2Concurrency: 1,
        t3Concurrency: 1,

        workload: [],
        p: 0,
        wFinishedIdx: [],
        firstPendingIndex: 0,


        // rl specific things
        rlAgent1: null,
        rlAgent2: null,
        rlAgent3: null,
        
        sumPhiT1: [0.5, 0.5, 0.5, 0.5],
        sumPhiT2: [0.5, 0.5, 0.5, 0.5],
        sumPhiT3: [0.5, 0.5, 0.5, 0.5],

        lastStateT1: null,
        lastStateT2: null,
        lastStateT3: null,

        lastCostT1: 0,
        lastCostT2: 0,
        lastCostT3: 0,

        approxT1QueueSizeEstimate: 0,
        approxT2QueueSizeEstimate: 0,
        approxT3QueueSizeEstimate: 0,
    },

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

        // Base Variables for Tiered Algorithms
        t1Buffer: [],
        t1Dirty: [],
        t1Coldflag: [],
        t1Uses: {},
        t1BaseTotalBuffer: [],

        t1bufferHit: 0,
        t1bufferMiss: 0,
        t1readIO: 0,
        t1writeIO: 0,
        t1baseWriteIO: 0,
        t1pagesWritten: 0,
        t1pagesRead: 0,
        t1pagesEvicted: 0,
        t1pagesPrefetched: 0,

        t2Buffer: [],
        t2Dirty: [],
        t2Coldflag: [],
        t2Uses: {},
        t2BaseTotalBuffer: [],

        t2bufferHit: 0,
        t2bufferMiss: 0,
        t2readIO: 0,
        t2writeIO: 0,
        t2baseWriteIO: 0,
        t2pagesWritten: 0,
        t2pagesRead: 0,
        t2pagesEvicted: 0,
        t2pagesPrefetched: 0,

        t3Buffer: [],
        t3Dirty: [],
        t3Coldflag: [],
        t3Uses: {},
        t3BaseTotalBuffer: [],

        t3bufferHit: 0,
        t3bufferMiss: 0,
        t3readIO: 0,
        t3writeIO: 0,
        t3baseWriteIO: 0,
        t3pagesWritten: 0,
        t3pagesRead: 0,
        t3pagesEvicted: 0,
        t3pagesPrefetched: 0,

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

        // Independent Variables for Tiered Algorithms
        t1BufferLength: 0,
        t1AlphaVal: 0,
        t2BufferLength: 0,
        t2AlphaVal: 0,
        t3BufferLength: 0,
        t3AlphaVal: 0,

        workload: [],
        p: 0,
        baseAlgorithm: null,



        // Playback Control
        pauser: false,
        reloader: 0,
        playing: false,
        firstWrite: true,
        delay: 200,
    
        // Latency & Write Batch Tracking
        aceLatency: [],
        // traditionalLatency: [],
        aceWriteBatches: [],
        // traditionalWriteBatches: [],
    
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

function resetCmpState() {
    const s = state.cmp;

    // Base buffers
    s.buffer = [];
    s.dirty = [];
    s.coldflag = [];
    s.uses = {};
    s.baseTotalBuffer = [];

    // Metrics
    s.bufferHit = 0;
    s.bufferMiss = 0;
    s.readIO = 0;
    s.writeIO = 0;
    s.baseWriteIO = 0;
    s.pagesWritten = 0;
    s.pagesRead = 0;
    s.pagesEvicted = 0;
    s.pagesPrefetched = 0;

    // ACE buffers
    s.ACEbuffer = [];
    s.ACEdirty = [];
    s.ACEcoldflag = [];
    s.ACEuses = {};
    s.ACETotalBuffer = [];

    // ACE metrics
    s.ACEbufferHit = 0;
    s.ACEbufferMiss = 0;
    s.ACEreadIO = 0;
    s.ACEwriteIO = 0;
    s.ACEpagesWritten = 0;
    s.ACEpagesRead = 0;
    s.ACEpagesEvicted = 0;
    s.ACEpagesPrefetched = 0;

    // Independent variables
    s.bufferLength = 0;
    s.alphaVal = 0;
    s.workload = [];
    s.p = 0;

    s.ACEAlgorithm = null;
    s.baseAlgorithm = null;
}

// revisit this after finalizing the page structure and any other changes to the tier structure
function resetTiersState() {
    const s = state.tiers;

    // Tier page lists
    s.tier1CurPages = [[],[],[],[],[],[],[]];
    s.tier2CurPages = [[],[],[],[],[],[],[]];
    s.tier3CurPages = [[],[],[],[],[],[],[]];

    // Reads
    s.tier1read = [0,0,0,0,0,0,0];
    s.tier2read = [0,0,0,0,0,0,0];
    s.tier3read = [0,0,0,0,0,0,0];

    // Writes
    s.tier1write = [0,0,0,0,0,0,0];
    s.tier2write = [0,0,0,0,0,0,0];
    s.tier3write = [0,0,0,0,0,0,0];

    // Migration stats
    s.tier2_1Migration = [0,0,0,0,0,0,0];
    s.tier2_3Migration = [0,0,0,0,0,0,0];

    // Queues
    s.tier1Queue = [[],[],[],[],[],[],[]];
    s.tier2Queue = [[],[],[],[],[],[],[]];
    s.tier3Queue = [[],[],[],[],[],[],[]];

    // Page metadata
    s.page = {
        id: 0,
        lastRequestRound: 0,
        frequency: 0,
        temperature: 0.5,
        reqRounds: []
    };

    // Playback control
    s.pauser = false;
    s.reloader = 0;
    s.playing = false;
    s.firstWrite = true;
    s.delay = 1000;
    s.started = false;

    // Independent tier variables
    s.t1AlphaVal = 1;
    s.t2AlphaVal = 1;
    s.t3AlphaVal = 1;

    s.t1ReadLatency = 0;
    s.t2ReadLatency = 0;
    s.t3ReadLatency = 0;

    s.t1Concurrency = 1;
    s.t2Concurrency = 1;
    s.t3Concurrency = 1;

    s.workload = [];
    s.p = 0;

    s.algorithms = [tLRU, tLFU, tTemp, tRL, null, null, null];
    
    // Reset rl specific things
    s.lastCostT1 = 0;
    s.lastCostT2 = 0;
    s.lastCostT3 = 0;
    s.approxT1QueueSizeEstimate = 0;
    s.approxT2QueueSizeEstimate = 0;
    s.approxT3QueueSizeEstimate = 0;
    s.lastStateT1 = null;
    s.lastStateT2 = null;
    s.lastStateT3 = null;

    s.rlAgent1 = null;
    s.rlAgent2 = null;
    s.rlAgent3 = null;

    s.sumPhiT1 = [0.5, 0.5, 0.5, 0.5];
    s.sumPhiT2 = [0.5, 0.5, 0.5, 0.5];
    s.sumPhiT3 = [0.5, 0.5, 0.5, 0.5];

    s.simActions = [[], [], [], [], [], [], []];

    // still not useful, will be in TP implementation
    s.tier1ActiveThreads = [0,0,0,0,0,0,0];
    s.tier2ActiveThreads = [0,0,0,0,0,0,0];
    s.tier3ActiveThreads = [0,0,0,0,0,0,0];
}


// function resetStats(){
//     $("#base-alg-buffer-misses").text(0);
//     $("#base-alg-buffer-hits").text(0);
//     $("#base-alg-pages-read").text(0);
//     $("#base-alg-pages-written").text(0);
//     $("#base-alg-read-IO").text(0);
//     $("#base-alg-write-IO").text(0);
//     $("#base-alg-pages-evicted").text(0);
//     $("#base-alg-latency").text(0);

//     $("#ace-alg-buffer-misses").text(0);
//     $("#ace-alg-buffer-hits").text(0);
//     $("#ace-alg-pages-read").text(0);
//     $("#ace-alg-pages-written").text(0);
//     $("#ace-alg-read-IO").text(0);
//     $("#ace-alg-write-IO").text(0);
//     $("#ace-alg-pages-evicted").text(0);
//     $("#ace-alg-latency").text(0);
// }

function resetStats() {
    const numAlgos = 3;

    for (let algoIndex = 0; algoIndex < numAlgos; algoIndex++) {

        // WRITES
        $(`#alg${algoIndex}-pages-written-t1`).text(0);
        $(`#alg${algoIndex}-pages-written-t2`).text(0);
        $(`#alg${algoIndex}-pages-written-t3`).text(0);

        // READS
        $(`#alg${algoIndex}-pages-read-t1`).text(0);
        $(`#alg${algoIndex}-pages-read-t2`).text(0);
        $(`#alg${algoIndex}-pages-read-t3`).text(0);

        // MIGRATIONS
        $(`#alg${algoIndex}-pages-migrated-t1t2`).text(0);
        $(`#alg${algoIndex}-pages-migrated-t2t3`).text(0);
    }
}

function resetState() {
    resetTiersState();
    resetIndivState();
    resetCmpState();
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
            s.workload = [];
        
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
        $("#workload, #n, #b, #e, #baseAlg, #s, #lat, #alpha, #x, #d").on("change input", handleInputChange);
        $("#asym1, #asym2, #asym3, #lat1, #lat2, #lat3, #alpha1, #alpha2, #alpha3, #device1, #device2, #device3").on("change input", handleInputChange);
    });
    
    $(document).on("change", "#baseAlg", function () {
        const selectedAlg = parseInt($(this).val());
        const s = state.indiv;
    
        // const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
        // const aceAlgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
        const baseAlgorithms = [tLRU, tLFU, baseLRU, baseCFLRU, baseLRUWSR];
        const aceAlgorithms = [tTemp, tTemp, ACELRU, ACECFLRU, ACELRUWSR];
    
        s.baseAlgorithm = baseAlgorithms[selectedAlg];
        s.ACEAlgorithm = aceAlgorithms[selectedAlg];
    
        console.log(`🔄 Algorithm changed: base → ${baseAlgorithms[selectedAlg].name}, ACE → ${aceAlgorithms[selectedAlg].name}`);
    });
    
    $("#backward-button").click(function () {
        const s = state.tiers;
        // need to fix the following later (if needed)
    
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
        const s = state.tiers;
        // need to fix the following later (if needed)
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
        const s = state.tiers;
        s.delay = 15;
    });
    
    $("#medium-button").click(function(){
        const s = state.tiers;
        s.delay = 200;
    });

    $("#slow-button").click(function(){
        const s = state.tiers;
        s.delay = 1000;
    });

    $("#finish-button").click(function(){
        const s = state.tiers;
        finisher();
    });

    function myLoop(s) {
        const remainingSteps = s.workload.length - s.p;
    
        if (s.reloader === 1) {
            console.warn("myLoop stopped.");
            return;
        }
    
        if (remainingSteps <= 0) {
            console.log("myLoop completed all steps.");
            s.playing = false;
            return;
        }
    
        setTimeout(function () {
            if (s.reloader === 1) return;
    
            if (!s.pauser) {
                for (let i = 0; i < s.algorithms.length; i++) {
                    s.algorithms[i](s);
                }
                for (let i = 0; i < s.algorithms.length; i++) {
                    algoDisplay(i, s);
                }
    
                if (s.p < s.workload.length) {
                    s.p++;
                    updateProgress(s.p, s.workload.length);
                }
    
                // console.log(`Step after increment: ${s.p}`);
            }
    
            if (s.playing) {
                myLoop(s);
            } else {
                console.log("Simulation paused or stopped.");
            }
        }, s.delay);
    }

    // function myLoop(s) {
    //     // const s = state.indiv;
        
    //     remainingSteps = s.workload.length - s.p; // Calculate remaining steps based on current position

    //     if (s.reloader === 1) { 
    //         console.warn("myLoop has been stopped.");
    //         return;
    //     }
    
    //     if (remainingSteps <= 0) {
    //         console.log("myLoop completed all steps.");
    //         s.playing = false;
    //         return;
    //     }
        
    //     // console.log("Workload length:", s.workload.length);
    //     // console.log("Current step (s.p):", s.p);
    //     setTimeout(function () {
    //         if (s.reloader === 1) return; // Stop execution if `finisher()` was called
            
    //         if (!s.pauser) {
    //             // Step simulation
    //             // s.baseAlgorithm(s.p, s);
    //             // s.ACEAlgorithm(s.p, s);
    //             // baseDisplay();
    //             // ACEDisplay();
    //             for (let i=0; i<s.algorithms.length; i++) {
    //                 s.algorithms[i](s);
    //             }
    //             for (let i=0; i<s.algorithms.length; i++) {
    //                 algoDisplay(i, s);
    //             }
    //             // Update latency values
    //             // Later
    //             // s.tradLatency = calculateLatency(s.writeIO, s.readIO, false) / 1000;
    //             // s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true) / 1000;
    
    //             // Sample for plotting every 10 steps or final step
    //             // Later
    //             // if (s.p % 10 === 0 || s.p === s.workload.length - 1) {
    //             //     s.aceWriteBatches.push(s.ACEwriteIO);
    //             //     s.traditionalWriteBatches.push(s.writeIO);
    
    //             //     s.aceLatency.push(s.aceLatencyval);
    //             //     s.traditionalLatency.push(s.tradLatency);
    
    //             //     updateWriteBatchesPlot(s.aceWriteBatches, s.traditionalWriteBatches);
    //             //     updateLatencyPlot(s.aceLatency, s.traditionalLatency);
    //             // }
    
    //             // Update progress bar
    //             if (s.p < s.workload.length) {
    //                 s.p++;
    //                 updateProgress(s.p, s.workload.length);
    //             }
    
    //             console.log(`Step after increment: ${s.p}`);
    //             console.log(`Progress updated to: ${Math.round((s.p / s.workload.length) * 100)}%`);
    //         }
    
    //         // Show ACE write alert once
    //         // if (s.firstWrite && s.ACEpagesWritten > 0) {
    //         //     $("#ACEAlert").css('visibility', 'visible');
    //         //     $("#ACERow").css({
    //         //         "border-color": "blue",
    //         //         "border-width": "4px",
    //         //         "border-style": "solid"
    //         //     });
    //         //     s.firstWrite = false;
    //         // }
    
    //         // Continue loop only if still playing
    //         if (s.playing) {
    //             myLoop(s);
    //         } else {
    //             console.log("⏸️ Simulation paused or manually stepped forward.");
    //         }
    //     }, s.delay);
    // }

    function myLoopTP(s) {
        if (s.reloader === 1 || !s.playing) return;
    
        // Reset tracking state for a fresh run
        s.wFinishedIdx = [];
        s.firstPendingIndex = 0;
    
        for (let i = 0; i < s.algorithms.length; i++) {
            s.tier1ActiveThreads[i] = 0;
            s.tier2ActiveThreads[i] = 0;
            s.tier3ActiveThreads[i] = 0;
        }
    
        spawnWorkers(s);
    }
    
    function spawnWorkers(s) {
        const numAlgos = s.algorithms.length;
    
        for (let algIndex = 0; algIndex < numAlgos; algIndex++) {
            const t1Count = s.t1Concurrency || 1;
            const t2Count = s.t2Concurrency || 1;
            const t3Count = s.t3Concurrency || 1;
    
            for (let w = 0; w < t1Count; w++) worker(s, 1, algIndex, `${algIndex}-T1-${w}`);
            for (let w = 0; w < t2Count; w++) worker(s, 2, algIndex, `${algIndex}-T2-${w}`);
            for (let w = 0; w < t3Count; w++) worker(s, 3, algIndex, `${algIndex}-T3-${w}`);
        }
    }

    async function worker(s, tierNo, algIndex, id) {
        const name        = `Worker-${id} Tier${tierNo} Alg${algIndex}`;
        const capKey      = `tier${tierNo}ActiveThreads`;
        const cap         = () => [s.t1Concurrency, s.t2Concurrency, s.t3Concurrency][tierNo - 1];
        const tierPages   = () => s[`tier${tierNo}CurPages`][algIndex];
        const algoFns     = [tLRU_TP, tLFU_TP, tTemp_TP];
    
        while (s.wFinishedIdx.length < s.workload.length) {
    
            // Hard stop
            if (s.reloader === 1) {
                console.log(`${name}: stopped by reloader.`);
                return;
            }
    
            // Pause — spin cheaply; unblocks as soon as s.pauser is cleared
            if (s.pauser) {
                await sleep(100);
                continue;
            }
    
            // Concurrency cap for this tier
            if (s[capKey][algIndex] >= cap()) {
                await sleep(s.delay);
                continue;
            }
    
            // Find next unclaimed entry whose page lives in this worker's tier
            let claimedIndex = -1;
            for (let i = s.firstPendingIndex; i < s.workload.length; i++) {
                if (s.wFinishedIdx.includes(i)) continue;
    
                const entry = s.workload[i];
                if (!entry) continue;
    
                const pageId = entry[1];
                const inThisTier = tierPages().some(p => p.id === pageId);
                if (inThisTier) { claimedIndex = i; break; }
            }
    
            // Nothing claimable right now — wait and retry
            if (claimedIndex === -1) {
                await sleep(s.delay);
                continue;
            }
    
            // Claim
            s[capKey][algIndex]++;
            s.wFinishedIdx.push(claimedIndex);
    
            // Advance firstPendingIndex past any contiguous finished entries
            while (s.wFinishedIdx.includes(s.firstPendingIndex)) {
                s.firstPendingIndex++;
            }
    
            // Execute — temporarily set s.p so the _TP function reads the right entry
            const savedP = s.p;
            s.p = claimedIndex;
            algoFns[algIndex](s, tierNo, id);
            await sleep(s.delay);
            s.p = savedP;
    
            s[capKey][algIndex]--;
    
            algoDisplay(algIndex, s);
            updateProgress(s.wFinishedIdx.length, s.workload.length);
        }
    
        console.log(`${name}: workload complete.`);
    }
    
    
    
    $("#play-button").click(function () {
        console.log("Play button clicked.");
        // need to fix ui naming
        // curently alphaX means concurreny, asymX means alpha, latX means read latency
        console.log("Raw UI values:", 
            $("#lat1").val(),
            $("#lat2").val(), 
            $("#lat3").val(),
            $("#asym1").val(),
            $("#asym2").val(),
            $("#asym3").val(),
            $("#alpha1").val(),
            $("#alpha2").val(),
            $("#alpha3").val()
        );
    
        const t1AlphaVal       = parseFloat($("#asym1").val());
        const t2AlphaVal       = parseFloat($("#asym2").val());
        const t3AlphaVal       = parseFloat($("#asym3").val());
        const t1ReadLatencyVal = parseFloat($("#lat1").val());
        const t2ReadLatencyVal = parseFloat($("#lat2").val());
        const t3ReadLatencyVal = parseFloat($("#lat3").val());
        const t1ConcurrencyVal = parseInt($("#alpha1").val());
        const t2ConcurrencyVal = parseInt($("#alpha2").val());
        const t3ConcurrencyVal = parseInt($("#alpha3").val());

        console.log("Parsed parameter values:",
            t1ReadLatencyVal, t2ReadLatencyVal, t3ReadLatencyVal,
            t1ConcurrencyVal, t2ConcurrencyVal, t3ConcurrencyVal,
            t1AlphaVal, t2AlphaVal, t3AlphaVal
        );
    
        const s = state.tiers;
    
        // Latch parameters once on first start
        if (!s.started) {
            s.started      = true;
            s.t1Alpha      = t1AlphaVal;
            s.t2Alpha      = t2AlphaVal;
            s.t3Alpha      = t3AlphaVal;
            s.t1ReadLatency = t1ReadLatencyVal;
            s.t2ReadLatency = t2ReadLatencyVal;
            s.t3ReadLatency = t3ReadLatencyVal;
            s.t1Concurrency = t1ConcurrencyVal;
            s.t2Concurrency = t2ConcurrencyVal;
            s.t3Concurrency = t3ConcurrencyVal;
        }

        console.log("State input parameter values:",
            s.t1ReadLatency, s.t2ReadLatency, s.t3ReadLatency,
            s.t1Concurrency, s.t2Concurrency, s.t3Concurrency,
            s.t1Alpha, s.t2Alpha, s.t3Alpha
        );
    
        // ── State 1: Fresh start ─────────────────────────────────────────────────
        if (!s.playing) {
            if (!capacity()) return;
    
            const algorithms = [tLRU, tLFU, tTemp, tRL];
    
            if (s.workload.length === 0) {
                s.workload   = generateWorkload();
                s.p          = 0;
                s.algorithms = algorithms;
                console.log("Workload generated, length:", s.workload.length);
    
                initTiers();
                for (let i = 0; i < algorithms.length; i++) {
                    s.tier1CurPages[i] = tier1.map(p => ({ ...p }));
                    s.tier2CurPages[i] = tier2.map(p => ({ ...p }));
                    s.tier3CurPages[i] = tier3.map(p => ({ ...p }));
                }
                renderTiers(tier1, tier2, tier3, algorithms.length);
                calculate(s, algorithms);
            }
    
            s.playing  = true;
            s.pauser   = false;
            s.reloader = 0;
    
            console.log("▶️ Starting simulation...");
            if (threadPoolEnabled) {
                myLoopTP(s);   // spawns workers once; they run until workload exhausted
            } else {
                myLoop(s);
            }
            return;
        }
    
        // ── State 2: Pause ───────────────────────────────────────────────────────
        if (!s.pauser) {
            s.pauser = true;
            console.log("⏸ Simulation paused.");
            return;
        }
    
        // ── State 3: Resume ──────────────────────────────────────────────────────
        s.pauser   = false;
        s.reloader = 0;
        console.log("▶️ Simulation resumed.");
    
        if (!threadPoolEnabled) {
            // Non-TP: myLoop stopped rescheduling itself while paused, so kick it again
            myLoop(s);
        }
        // TP: existing workers are alive and looping on sleep(100);
        // clearing s.pauser is all they need — no re-spawn required.
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
    // console.log(`   Step ${currentStep}/${totalSteps} → Progress: ${progressPercent}%`);

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

function initializeWithRandomPages(s) {
    // Reset tiers
    s.tier1CurPages = [[],[],[],[],[],[],[]];
    s.tier2CurPages = [[],[],[],[],[],[],[]];
    s.tier3CurPages = [[],[],[],[],[],[],[]];

    initTiers();
    // JS deep copy
    s.tier1CurPages = tier1.map(p => ({ ...p }));
    s.tier2CurPages = tier2.map(p => ({ ...p }));
    s.tier3CurPages = tier3.map(p => ({ ...p }));

    // Reset stats
    s.tier1read = [0,0,0,0,0,0,0];
    s.tier1write = [0,0,0,0,0,0,0];
    s.tier2read = [0,0,0,0,0,0,0];
    s.tier2write = [0,0,0,0,0,0,0];
    s.tier3read = [0,0,0,0,0,0,0];
    s.tier3write = [0,0,0,0,0,0,0];
}

function calculate(s, algorithms) {
    // const s = state.indiv;

    const totalSteps = s.workload.length;
    console.log("Starting simulation...");
    updateProgress(0, totalSteps);

    // Assign algorithms
    // const ACEalgorithms = [ACELRU, ACECFLRU, ACELRUWSR];
    // const baseAlgorithms = [baseLRU, baseCFLRU, baseLRUWSR];
    // s.ACEAlgorithm = ACEalgorithms[baseAlgID];
    // s.baseAlgorithm = baseAlgorithms[baseAlgID];
    // s.baseAlgorithmID = baseAlgID;

    if (!s.started) {
        initializeWithRandomPages(s);
    }

    for (let tableNo = 0; tableNo < algorithms.length; tableNo++) {
        // Clear existing tables
        $(`#table${tableNo}`).remove();
        
        let totalCells = 0;
        const table = $('<table>').attr("id", `table${tableNo}`).addClass("table cmp-indiv-mp");
        for (let i = 0; i <= s.workload.length / 20; i++) {
            const row = $('<tr>').addClass("tablecell");
            if (i === 0) row.css("margin-top", "6px");

            for (let k = 0; k < 20 && totalCells < Math.ceil(s.workload.length); k++) {
                row.append($("<td>"));
                totalCells++;
            }
            table.append(row);
        }
        $(`#table${tableNo}`).append(table);
    }
}

function finisher() {
    const s = state.tiers;
    // need to fix the following later (if needed)
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

function algoDisplay(algoIndex, s) {
    // console.log("Updating algoDisplay for algorithm:", algoIndex);

    let perAlgoDelay = s.delay*0.9; // Allocate 90% of the delay to cell highlighting and tier updates
    let perActionDelay = perAlgoDelay;
    let cell1InHTML = null;
    let cell2InHTML = null;
    let cell1ClassCSS = null;
    let cell2ClassCSS = null;
    let cellDelay = perActionDelay/s.simActions[algoIndex].length; // Default to equal split if there are actions
    if (s.simActions[algoIndex].length > 0) {
        perActionDelay = perAlgoDelay / s.simActions[algoIndex].length;
        let action = s.simActions[algoIndex][0];
        if (action.op === "R") {
            cell1ClassCSS = "highlight-read";
            cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId}`;
        }
        else if (action.op === "W") {
            cell1ClassCSS = "highlight-write";
            cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId}`;
        }
        highlightCells([cell1InHTML], cell1ClassCSS, cellDelay);
        if (s.simActions[algoIndex].length > 1) {
            action = s.simActions[algoIndex][1];
            if (action.op === "M") {
                cell1ClassCSS = "highlight-from";
                cell2ClassCSS = "highlight-to";
                cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId[0]}`;
                cell2InHTML = `tier${action.tierId-1}alg${algoIndex}-${action.cellId[1]}`;
            }
            setTimeout(function () {
                highlightCells([cell1InHTML], cell1ClassCSS, cellDelay/2);
                highlightCells([cell2InHTML], cell2ClassCSS, cellDelay/2);
                setTimeout(function () {
                    renderUpdatedTiers(action.tierId, action.tierId - 1, action.cellId[0], action.cellId[1], algoIndex);
                    highlightCells([cell1InHTML], cell2ClassCSS, cellDelay/2);
                    highlightCells([cell2InHTML], cell1ClassCSS, cellDelay/2);
                }, cellDelay/2)
            }, cellDelay/2)
        }
    }
    // for (let i = 0; i < s.simActions[algoIndex].length; i++) {
    //     const action = s.simActions[algoIndex][i];
    //     console.log(action);
    //     if (action.op === "R") {
    //         cell1ClassCSS = "highlight-read";
    //         cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId}`;
    //     }
    //     else if (action.op === "W") {
    //         cell1ClassCSS = "highlight-write";
    //         cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId}`;
    //     }
    //     else if (action.op === "M") {
    //         cell1ClassCSS = "highlight-from";
    //         cell2ClassCSS = "highlight-to";
    //         cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId[0]}`;
    //         cell2InHTML = `tier${action.tierId-1}alg${algoIndex}-${action.cellId[1]}`;
    //     }
    //     console.log(cell1InHTML);
    //     console.log(cell1ClassCSS);
    //     console.log(cell2InHTML);
    //     console.log(cell2ClassCSS);
    //     console.log(cellDelay);
    //     if (cell2InHTML !== null) {
    //         setTimeout(function () {
    //             highlightCells([cell1InHTML], cell1ClassCSS, cellDelay/2);
    //             highlightCells([cell2InHTML], cell2ClassCSS, cellDelay/2);
    //             setTimeout(function () {
    //                 renderUpdatedTiers(action.tierId, action.tierId - 1, action.cellId[0], action.cellId[1], algoIndex);
    //                 highlightCells([cell1InHTML], cell2ClassCSS, cellDelay/2);
    //                 highlightCells([cell2InHTML], cell1ClassCSS, cellDelay/2);
    //             }, cellDelay/2)
    //         }, cellDelay/2)
    //     }
    //     else {
    //         highlightCells([cell1InHTML], cell1ClassCSS, cellDelay);
    //     }
    // }

    s.simActions[algoIndex] = []; // Clear existing actions for this algorithm
    // WRITES
    $(`#alg${algoIndex}-pages-written-t1`).text(s.tier1write[algoIndex]);
    $(`#alg${algoIndex}-pages-written-t2`).text(s.tier2write[algoIndex]);
    $(`#alg${algoIndex}-pages-written-t3`).text(s.tier3write[algoIndex]);

    // READS
    $(`#alg${algoIndex}-pages-read-t1`).text(s.tier1read[algoIndex]);
    $(`#alg${algoIndex}-pages-read-t2`).text(s.tier2read[algoIndex]);
    $(`#alg${algoIndex}-pages-read-t3`).text(s.tier3read[algoIndex]);

    // MIGRATIONS
    $(`#alg${algoIndex}-pages-migrated-t1t2`).text(s.tier2_1Migration[algoIndex]);
    // $(`#alg${algoIndex}-pages-migrated-t2t1`).text(s.tier2_1Migration[algoIndex]);
    $(`#alg${algoIndex}-pages-migrated-t2t3`).text(s.tier2_3Migration[algoIndex]);
    // $(`#alg${algoIndex}-pages-migrated-t3t2`).text(s.tier2_3Migration[algoIndex]);
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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
    if (!s.workload || !s.workload[p]) {
        console.warn(`⚠️ Skipping step ${p}: workload not ready.`);
        return;
    }
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

async function worker(s, tierNo, algIndex, id) {
    const name = `Worker-${id} Tier${tierNo} Alg${algIndex}`;
    const concurrencyKey = `tier${tierNo}ActiveThreads`;
    const concurrencyLimit = [s.t1Concurrency, s.t2Concurrency, s.t3Concurrency][tierNo - 1];

    while (s.wFinishedIdx.length < s.workload.length) {
        if (s.reloader === 1) return;
        if (s.pauser) { await sleep(100); continue; }

        // Find the next unclaimed workload index for this tier
        let claimedIndex = -1;
        for (let i = s.firstPendingIndex; i < s.workload.length; i++) {
            if (s.wFinishedIdx.includes(i)) continue;     // already done
            const entry = s.workload[i];
            if (!entry) continue;
            const page = entry[1];
            const inThisTier = (tierNo === 1 && s.tier1CurPages[algIndex].some(p => p.id === page))
                            || (tierNo === 2 && s.tier2CurPages[algIndex].some(p => p.id === page))
                            || (tierNo === 3 && s.tier3CurPages[algIndex].some(p => p.id === page));
            if (inThisTier) { claimedIndex = i; break; }
        }

        if (claimedIndex === -1) { await sleep(s.delay); continue; }

        // Check concurrency cap
        if (s[concurrencyKey][algIndex] >= concurrencyLimit) {
            await sleep(s.delay); continue;
        }

        // Claim the slot
        s[concurrencyKey][algIndex]++;
        s.wFinishedIdx.push(claimedIndex);     // mark as in-progress/done

        // Advance firstPendingIndex
        while (s.wFinishedIdx.includes(s.firstPendingIndex)) s.firstPendingIndex++;

        // Execute the algorithm step for this entry at claimedIndex
        const savedP = s.p;
        s.p = claimedIndex;
        const algoFns = [tLRU_TP, tLFU_TP, tTemp_TP];
        algoFns[algIndex](s, tierNo, id);

        await sleep(s.delay);
        s[concurrencyKey][algIndex]--;
        s.p = savedP;

        algoDisplay(algIndex, s);
        updateProgress(s.wFinishedIdx.length, s.workload.length);
    }

    console.log(`${name}: workload complete.`);
}

function getLRUPage(tier) {
    if (tier.length === 0) return null;

    let minIndex = 0;
    let minRound = tier[0].lastRequestRound ?? 0;

    for (let i = 1; i < tier.length; i++) {
        const r = tier[i].lastRequestRound ?? 0;
        if (r < minRound) {
            minRound = r;
            minIndex = i;
        }
    }

    return {
        page: tier[minIndex],
        index: minIndex
    };
}

function getLFUPage(tier) {
    if (tier.length === 0) return null;

    let minIndex = 0;
    let minFreq = tier[0].frequency ?? -1;
    
    for (let i = 1; i < tier.length; i++) {
        const f = tier[i].frequency ?? -1;
        if (f < minFreq) {
            minFreq = f;
            minIndex = i;
        }
    }

    return {
        page: tier[minIndex],
        index: minIndex
    };
}

function getTemperaturePage(tier) {
    if (tier.length === 0) return null;
    let minIndex = 0;
    let minTemp = tier[0].temperature ?? -1;
    for (let i = 1; i < tier.length; i++) {
        const t = tier[i].temperature ?? -1;
        if (t < minTemp) {
            minTemp = t;
            minIndex = i;
        }
    }
    return {
        page: tier[minIndex],
        index: minIndex
    };
}

function tLRU_TP(s, tierNo, threadNo) {
    const algIndex = 0;
    const currentRound = s.p;
    const entry = s.workload[currentRound];
    if (!entry) return;

    const type = entry[0];
    const page = entry[1];

    // Check concurrency cap for the target tier
    if (tierNo === 1 && s.tier1ActiveThreads[algIndex] > s.t1Concurrency) return;
    if (tierNo === 2 && s.tier2ActiveThreads[algIndex] > s.t2Concurrency) return;
    if (tierNo === 3 && s.tier3ActiveThreads[algIndex] > s.t3Concurrency) return;

    if (tierNo === 1) {
        const idx = s.tier1CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
        const pg = s.tier1CurPages[algIndex][idx];
        pg.lastRequestRound = currentRound;
        if (type === "W") { s.tier1write[algIndex]++; highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-write", s.delay); }
        else              { s.tier1read[algIndex]++;  highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-read",  s.delay); }
        sleep(s.delay);

    } else if (tierNo === 2) {
        const idx = s.tier2CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
        const pg = s.tier2CurPages[algIndex][idx];
        pg.lastRequestRound = currentRound;
        if (type === "W") { s.tier2write[algIndex]++; highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-write", s.delay); }
        else              { s.tier2read[algIndex]++;  highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-read",  s.delay); }
        sleep(s.delay);
        const lru = getLRUPage(s.tier1CurPages[algIndex]);
        if (lru && currentRound > (lru.page.lastRequestRound ?? -1)) {
            const temp = s.tier1CurPages[algIndex][lru.index];
            s.tier1CurPages[algIndex][lru.index] = pg;
            s.tier2CurPages[algIndex][idx] = temp;
            s.tier2_1Migration[algIndex]++;
            highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-from", s.delay);
            highlightCells([`tier1alg${algIndex}-${lru.index}`], "highlight-to", s.delay);
            renderUpdatedTiers(2, 1, idx, lru.index, algIndex);
        }

    } else if (tierNo === 3) {
        const idx = s.tier3CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
        const pg = s.tier3CurPages[algIndex][idx];
        pg.lastRequestRound = currentRound;
        if (type === "W") { s.tier3write[algIndex]++; highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-write", s.delay); }
        else              { s.tier3read[algIndex]++;  highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-read",  s.delay); }
        sleep(s.delay);
        const lru = getLRUPage(s.tier2CurPages[algIndex]);
        if (lru && currentRound > (lru.page.lastRequestRound ?? -1)) {
            const temp = s.tier2CurPages[algIndex][lru.index];
            s.tier2CurPages[algIndex][lru.index] = pg;
            s.tier3CurPages[algIndex][idx] = temp;
            s.tier2_3Migration[algIndex]++;
            highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-from", s.delay);
            highlightCells([`tier2alg${algIndex}-${lru.index}`], "highlight-to", s.delay);
            renderUpdatedTiers(3, 2, idx, lru.index, algIndex);
        }
    }
}

function tLRU(s) {
    // console.log("Running tLRU");
    const currentRound = s.p;
    const entry = s.workload[currentRound];
    if (!entry) return;

    // console.log(entry);
    // console.log(s.tier1CurPages[0]);
    // console.log(s.tier2CurPages[0]);
    // console.log(s.tier3CurPages[0]);

    const type = entry[0];   // "R" or "W"
    const page = entry[1];

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    // Find the page index in tier1CurPages[0] whose id matches page from workload
    const foundPageT1Index = s.tier1CurPages[0].findIndex(p => p.id === page);
    // console.log(`Page ${page} found in Tier 1 at index: ${foundPageT1Index}`);
    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[0][foundPageT1Index];
        if (type === "W") {
            s.tier1write[0]++;
            //highlightCells([`tier1alg0-${foundPageT1Index}`], "highlight-write", s.delay);
            s.simActions[0].push({op: 'W', tierId: 1, cellId: foundPageT1Index});
        } else if (type === "R") {
            s.tier1read[0]++;
            //highlightCells([`tier1alg0-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[0].push({op: 'R', tierId: 1, cellId: foundPageT1Index});
        } else {
            console.log("tLRU: Workload: Not W, Not R: What treachery is this!!");
        }
        foundPageT1.lastRequestRound = currentRound;  // update lastRequestRound
        //await sleep(500);
        // sleep(3*s.delay);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[0].findIndex(p => p.id === page);
    // console.log(`Page ${page} found in Tier 2 at index: ${foundPageT2Index}`);
    if (foundPageT2Index !== -1) {
        const foundPageT2 = s.tier2CurPages[0][foundPageT2Index];
        if (type === "W") {
            s.tier2write[0]++;
            //highlightCells([`tier2alg0-${foundPageT2Index}`], "highlight-write", s.delay);
            s.simActions[0].push({op: 'W', tierId: 2, cellId: foundPageT2Index});
        } else if (type === "R") {
            s.tier2read[0]++;
            //highlightCells([`tier2alg0-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[0].push({op: 'R', tierId: 2, cellId: foundPageT2Index});
        } else {
            console.log("tLRU: Workload: Not W, Not R: What treachery is this!!");
        }

        //await sleep(500);
        // sleep(s.delay);
        // Find LRU page in Tier 1
        const lruT1 = getLRUPage(s.tier1CurPages[0]);

        if (lruT1 !== null) {
            const lruT1Index = lruT1.index;
            const lruT1page = lruT1.page;

            const lruRound = lruT1page.lastRequestRound ?? -1;
            // change logic
            // condition in cpp:
            // if (current_page.last_request_round > int(k_lru * lru_page_t1.last_request_round + max_capacity_tier1))
            if (foundPageT2.lastRequestRound > lruRound + tier1Size) {
            // if (s.p > lruRound) {

                // -----------------------------
                // MIGRATION: Tier2 <-> Tier1
                // -----------------------------
                // Swap pages at their indices
                const temp = s.tier1CurPages[0][lruT1Index];
                s.tier1CurPages[0][lruT1Index] = foundPageT2;
                s.tier2CurPages[0][foundPageT2Index] = temp;

                // -----------------------------
                // Update IO counters
                // -----------------------------

                // // Tier1: read (demotion) + write (promotion)
                // s.tier1read[0]++;
                // s.tier1write[0]++;

                // // Tier2: read (promotion) + write (demotion)
                // s.tier2read[0]++;
                // s.tier2write[0]++;

                s.tier2_1Migration[0]++;

                s.simActions[0].push({ op: 'M', tierId: 2, cellId: [foundPageT2Index, lruT1Index] });
                // highlightCells([`tier2alg0-${foundPageT2Index}`], "highlight-from", s.delay);
                // destination cell
                // highlightCells([`tier1alg0-${lruT1Index}`], "highlight-to", s.delay);
                //await sleep(500);
                // sleep(s.delay);
                // renderUpdatedTiers(2, 1, foundPageT2Index, lruT1Index, 0);
                // sleep(s.delay);
            }
        }
        foundPageT2.lastRequestRound = currentRound; // update lastRequestRound after potential migration to Tier 1
        //await sleep(500);0
        
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[0].findIndex(p => p.id === page);
    // console.log(`Page ${page} found in Tier 3 at index: ${foundPageT3Index}`);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[0][foundPageT3Index];

        if (type === "W") {
            s.tier3write[0]++;
            // highlightCells([`tier3alg0-${foundPageT3Index}`], "highlight-write", s.delay);
            s.simActions[0].push({ op: 'W', tierId: 3, cellId: foundPageT3Index });
        } else if (type === "R") {
            s.tier3read[0]++;
            // highlightCells([`tier3alg0-${foundPageT3Index}`], "highlight-read", s.delay);
            s.simActions[0].push({ op: 'R', tierId: 3, cellId: foundPageT3Index });
        } else {
            console.log("tLRU: Workload: Not W, Not R: What treachery is this!!");
        }
        // sleep(s.delay);
        //await sleep(500);
        // sleep(500);
        // -----------------------------
        // Find LRU page in Tier 2
        // -----------------------------
        const lruT2 = getLRUPage(s.tier2CurPages[0]);

        if (lruT2 !== null) {

            const lruT2Index = lruT2.index;
            const lruT2page = lruT2.page;

            const lruRound = lruT2page.lastRequestRound ?? -1;

            if (foundPageT3.lastRequestRound > lruRound + tier2Size) {
            // if (s.p > lruRound) {

                // -----------------------------
                // MIGRATION: Tier3 <-> Tier2
                // -----------------------------
                const temp = s.tier2CurPages[0][lruT2Index];
                s.tier2CurPages[0][lruT2Index] = foundPageT3;
                s.tier3CurPages[0][foundPageT3Index] = temp;

                // -----------------------------
                // Update IO counters
                // -----------------------------

                // // Tier2: read (demotion) + write (promotion)
                // s.tier2read[0]++;
                // s.tier2write[0]++;

                // // Tier3: read (promotion) + write (demotion)
                // s.tier3read[0]++;
                // s.tier3write[0]++;

                s.tier2_3Migration[0]++;
                s.simActions[0].push({ op: 'M', tierId: 3, cellId: [foundPageT3Index, lruT2Index] });
                // highlight source
                // s.simActions[0].push({ cell: `tier3alg0-${foundPageT3Index}`, class: "highlight-from" });

                // highlight destination
                // highlightCells([`tier2alg0-${lruT2Index}`], "highlight-to", s.delay);
                // s.simActions[0].push({ cell: `tier2alg0-${lruT2Index}`, class: "highlight-to" });
                //await sleep(500);
                // sleep(s.delay);
                // renderUpdatedTiers(3, 2, foundPageT3Index, lruT2Index, 0);

                // highlightCells([`tier3alg0-${foundPageT3Index}`], "highlight-to", s.delay);
                // s.simActions[0].push({ cell: `tier3alg0-${foundPageT3Index}`, class: "highlight
                // highlightCells([`tier2alg0-${lruT2Index}`], "highlight-from", s.delay);
                // s.simActions[0].push({ cell: `tier2alg0-${lruT2Index}`, class: "highlight-from" });
                // sleep(s.delay);
            }
        }
        foundPageT3.lastRequestRound = currentRound; // update lastRequestRound after potential migration to Tier 2
        //await sleep(500);
        return;
    }

    // // ----------------------------------
    // // CASE 4: Page not found anywhere
    // // ----------------------------------
    // // Insert into Tier 3 (coldest tier)
    // tier3.push(page);
    // s.tier3write[0]++;
}

function tLFU_TP(s, tierNo, threadNo) {
    const algIndex    = 1;
    const currentRound = s.p;
    const entry       = s.workload[currentRound];
    if (!entry) return;
 
    const type = entry[0];
    const page = entry[1];
 
    if (tierNo === 1) {
        const idx = s.tier1CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier1CurPages[algIndex][idx];
        pg.frequency++;
 
        if (type === "W") {
            s.tier1write[algIndex]++;
            highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier1read[algIndex]++;
            highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
    } else if (tierNo === 2) {
        const idx = s.tier2CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier2CurPages[algIndex][idx];
        pg.frequency++;
 
        if (type === "W") {
            s.tier2write[algIndex]++;
            highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier2read[algIndex]++;
            highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
        // Promote to Tier 1 if this page is more frequent than the LFU victim there
        const lfu = getLFUPage(s.tier1CurPages[algIndex]);
        if (lfu !== null && pg.frequency > (lfu.page.frequency ?? 0)) {
            // Swap in the page maps immediately
            const tmp = s.tier1CurPages[algIndex][lfu.index];
            s.tier1CurPages[algIndex][lfu.index] = pg;
            s.tier2CurPages[algIndex][idx]        = tmp;
 
            s.tier2_1Migration[algIndex]++;
 
            highlightCells([`tier2alg${algIndex}-${idx}`],       "highlight-from", s.delay);
            highlightCells([`tier1alg${algIndex}-${lfu.index}`], "highlight-to",   s.delay);
            sleep(s.delay);
            renderUpdatedTiers(2, 1, idx, lfu.index, algIndex);
        }
        sleep(s.delay);
 
    } else if (tierNo === 3) {
        const idx = s.tier3CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier3CurPages[algIndex][idx];
        pg.frequency++;
 
        if (type === "W") {
            s.tier3write[algIndex]++;
            highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier3read[algIndex]++;
            highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
        // Promote to Tier 2 if this page is more frequent than the LFU victim there
        const lfu = getLFUPage(s.tier2CurPages[algIndex]);
        if (lfu !== null && pg.frequency > (lfu.page.frequency ?? 0)) {
            const tmp = s.tier2CurPages[algIndex][lfu.index];
            s.tier2CurPages[algIndex][lfu.index] = pg;
            s.tier3CurPages[algIndex][idx]        = tmp;
 
            s.tier2_3Migration[algIndex]++;
 
            highlightCells([`tier3alg${algIndex}-${idx}`],       "highlight-from", s.delay);
            highlightCells([`tier2alg${algIndex}-${lfu.index}`], "highlight-to",   s.delay);
            sleep(s.delay);
            renderUpdatedTiers(3, 2, idx, lfu.index, algIndex);
        }
        sleep(s.delay);
    }
}

function tLFU(s) {
    // console.log("Running tLFU");

    const currentRound = s.p;
    const entry = s.workload[currentRound];
    if (!entry) return;

    const type = entry[0];
    const page = entry[1];

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    const foundPageT1Index = s.tier1CurPages[1].findIndex(p => p.id === page);
    // console.log(s.tier1CurPages[1], foundPageT1Index);

    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[1][foundPageT1Index];
        foundPageT1.frequency++;

        if (type === "W") {
            s.tier1write[1]++;
            // highlightCells([`tier1alg1-${foundPageT1Index}`], "highlight-write", s.delay);
            s.simActions[1].push({ op: 'W', tierId: 1, cellId: foundPageT1Index });
        } else {
            s.tier1read[1]++;
            // highlightCells([`tier1alg1-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[1].push({ op: 'R', tierId: 1, cellId: foundPageT1Index });
        }

        // sleep(3*s.delay);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[1].findIndex(p => p.id === page);
    // console.log(s.tier2CurPages[1], foundPageT2Index);

    if (foundPageT2Index !== -1) {

        const foundPageT2 = s.tier2CurPages[1][foundPageT2Index];
        foundPageT2.frequency++;

        if (type === "W") {
            s.tier2write[1]++;
            // highlightCells([`tier2alg1-${foundPageT2Index}`], "highlight-write", s.delay);
            s.simActions[1].push({ op: 'W', tierId: 2, cellId: foundPageT2Index });
        } else {
            s.tier2read[1]++;
            // highlightCells([`tier2alg1-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[1].push({ op: 'R', tierId: 2, cellId: foundPageT2Index });
        }

        // sleep(s.delay);

        const lfuInfo = getLFUPage(s.tier1CurPages[1]);

        if (lfuInfo !== null) {

            const lfuT1Index = lfuInfo.index;
            const lfuT1page = lfuInfo.page;

            const victimFreq = lfuT1page.frequency ?? 0;

            // console.log(victimFreq, foundPageT2.frequency);
            
            if (foundPageT2.frequency > victimFreq) {

                const temp = s.tier1CurPages[1][lfuT1Index];
                s.tier1CurPages[1][lfuT1Index] = foundPageT2;
                s.tier2CurPages[1][foundPageT2Index] = temp;

                s.tier2_1Migration[1]++;
                s.simActions[1].push({ op: 'M', tierId: 2, cellId: [foundPageT2Index, lfuT1Index] });
                // highlightCells([`tier2alg1-${foundPageT2Index}`], "highlight-from", s.delay);
                // highlightCells([`tier1alg1-${lfuT1Index}`], "highlight-to", s.delay);
                // sleep(s.delay);
                // renderUpdatedTiers(2, 1, foundPageT2Index, lfuT1Index, 1);

                // highlightCells([`tier2alg1-${foundPageT2Index}`], "highlight-to", s.delay);
                // highlightCells([`tier1alg1-${lfuT1Index}`], "highlight-from", s.delay);
                // sleep(s.delay);
            }
        }
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[1].findIndex(p => p.id === page);
    // console.log(s.tier3CurPages[1], foundPageT3Index);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[1][foundPageT3Index];
        foundPageT3.frequency++;

        if (type === "W") {
            s.tier3write[1]++;
            // highlightCells([`tier3alg1-${foundPageT3Index}`], "highlight-write", s.delay);
            s.simActions[1].push({ op: 'W', tierId: 3, cellId: foundPageT3Index });
        } else {
            s.tier3read[1]++;
            // highlightCells([`tier3alg1-${foundPageT3Index}`], "highlight-read", s.delay);
            s.simActions[1].push({ op: 'R', tierId: 3, cellId: foundPageT3Index });
        }

        sleep(s.delay);

        const lfuInfo = getLFUPage(s.tier2CurPages[1]);

        if (lfuInfo !== null) {

            const lfuT2Index = lfuInfo.index;
            const lfuT2page = lfuInfo.page;

            const victimFreq = lfuT2page.frequency ?? 0;

            // console.log(victimFreq, foundPageT3.frequency);
            
            if (foundPageT3.frequency > victimFreq) {

                const temp = s.tier2CurPages[1][lfuT2Index];
                s.tier2CurPages[1][lfuT2Index] = foundPageT3;
                s.tier3CurPages[1][foundPageT3Index] = temp;

                s.tier2_3Migration[1]++;
                s.simActions[1].push({ op: 'M', tierId: 3, cellId: [foundPageT3Index, lfuT2Index] });
                // highlightCells([`tier3alg1-${foundPageT3Index}`], "highlight-from", s.delay);
                // highlightCells([`tier2alg1-${lfuT2Index}`], "highlight-to", s.delay);
                // sleep(s.delay);

                // renderUpdatedTiers(3, 2, foundPageT3Index, lfuT2Index, 1);
                // highlightCells([`tier3alg1-${foundPageT3Index}`], "highlight-to", s.delay);
                // s.simActions[1].push({ cell: `tier3alg1-${foundPageT3Index}`, class: "highlight-to" });
                // highlightCells([`tier2alg1-${lfuT2Index}`], "highlight-from", s.delay);
                // s.simActions[1].push({ cell: `tier2alg1-${lfuT2Index}`, class: "highlight-from" });
                // sleep(s.delay);
            }
        }
        return;
    }
}

function decayTemperatures(tier, currentRound, dropThreshold = Math.round(totalPages/10), dropScale = 0.02) {
    // dropThreshold as per paper implementation codes: 10% of total # of pages?
    // dropScale is hardcoded set as 0.02 in the paper implementation?
    for (const page of tier) {
        if (page.lastRequestRound === undefined || page.lastRequestRound === -1) continue;
        const idleTime = currentRound - page.lastRequestRound;
        if (idleTime > 0 && idleTime % dropThreshold === 0) {
            page.temperature = Math.max(page.temperature - dropScale, 0);
        }
    }
}

function updateTemperature(page, currentRound, windowSize = 10, tempAlpha = 0.05) {
    // as per paper implementation, tempAlpha (temp_incr_alpha) is 0.05
    // in the paper implementation, buffersize = 1e4, #ops = 1M probably, so 1/100

    // calculate the new temperature of the page
    page.reqRounds.push(currentRound);
    while (page.reqRounds.length > 0 && page.reqRounds[0] < currentRound - windowSize) {
        page.reqRounds.shift();
    }
    const reqCount = page.reqRounds.length;
    page.temperature = 1 - 0.5 / Math.exp(tempAlpha * reqCount);
    page.lastRequestRound = currentRound;
}

function getAvgTemp(tier) {
    if (tier.length === 0) return 0;
    let totalTemp = 0;
    for (const page of tier) {
        totalTemp += page.temperature;
    }
    return totalTemp / tier.length;
}

function tTemp_TP(s, tierNo, threadNo) {
    const algIndex     = 2;
    const currentRound = s.p;
 
    // Decay all tiers before processing this entry — mirrors tTemp behaviour
    decayTemperatures(s.tier1CurPages[algIndex], currentRound);
    decayTemperatures(s.tier2CurPages[algIndex], currentRound);
    decayTemperatures(s.tier3CurPages[algIndex], currentRound);
 
    const entry = s.workload[currentRound];
    if (!entry) return;
 
    const type = entry[0];
    const page = entry[1];
 
    if (tierNo === 1) {
        const idx = s.tier1CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier1CurPages[algIndex][idx];
        updateTemperature(pg, currentRound, s.workload.length/100);
 
        if (type === "W") {
            s.tier1write[algIndex]++;
            highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier1read[algIndex]++;
            highlightCells([`tier1alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
    } else if (tierNo === 2) {
        const idx = s.tier2CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier2CurPages[algIndex][idx];
        updateTemperature(pg, currentRound, s.workload.length/100);
 
        if (type === "W") {
            s.tier2write[algIndex]++;
            highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier2read[algIndex]++;
            highlightCells([`tier2alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
        // Promote to Tier 1 if this page is hotter than the avg temp there
        const coldest = getTemperaturePage(s.tier1CurPages[algIndex]);
        if (coldest !== null) {
            const avgTemp = getAvgTemp(s.tier1CurPages[algIndex]);
            if (pg.temperature > avgTemp) {
                const tmp = s.tier1CurPages[algIndex][coldest.index];
                s.tier1CurPages[algIndex][coldest.index] = pg;
                s.tier2CurPages[algIndex][idx]            = tmp;
 
                s.tier2_1Migration[algIndex]++;
 
                highlightCells([`tier2alg${algIndex}-${idx}`],           "highlight-from", s.delay);
                highlightCells([`tier1alg${algIndex}-${coldest.index}`], "highlight-to",   s.delay);
                sleep(s.delay);
                renderUpdatedTiers(2, 1, idx, coldest.index, algIndex);
            }
        }
        sleep(s.delay);
 
    } else if (tierNo === 3) {
        const idx = s.tier3CurPages[algIndex].findIndex(p => p.id === page);
        if (idx === -1) return;
 
        const pg = s.tier3CurPages[algIndex][idx];
        updateTemperature(pg, currentRound, s.workload.length/100);
 
        if (type === "W") {
            s.tier3write[algIndex]++;
            highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-write", s.delay);
        } else {
            s.tier3read[algIndex]++;
            highlightCells([`tier3alg${algIndex}-${idx}`], "highlight-read", s.delay);
        }
        sleep(s.delay);
 
        // Promote to Tier 2 if this page is hotter than the avg temp there
        const coldest = getTemperaturePage(s.tier2CurPages[algIndex]);
        if (coldest !== null) {
            const avgTemp = getAvgTemp(s.tier2CurPages[algIndex]);
            if (pg.temperature > avgTemp) {
                const tmp = s.tier2CurPages[algIndex][coldest.index];
                s.tier2CurPages[algIndex][coldest.index] = pg;
                s.tier3CurPages[algIndex][idx]            = tmp;
 
                s.tier2_3Migration[algIndex]++;
 
                highlightCells([`tier3alg${algIndex}-${idx}`],           "highlight-from", s.delay);
                highlightCells([`tier2alg${algIndex}-${coldest.index}`], "highlight-to",   s.delay);
                sleep(s.delay);
                renderUpdatedTiers(3, 2, idx, coldest.index, algIndex);
            }
        }
        sleep(s.delay);
    }
}

// function reStore(s) {
function tTemp(s) {
    // console.log("Running tTemp");
    const currentRound = s.p;
    const minAccessToT1 = 3;
    const minAccessToT2 = 2;
    const tempAlpha = 0.05; // as per paper implementation
    const minT1MigrationTemp = 1-0.5/Math.exp(tempAlpha*minAccessToT1);
    const minT2MigrationTemp = 1-0.5/Math.exp(tempAlpha*minAccessToT2);

    const entry = s.workload[currentRound];
    if (!entry) return;

    const type = entry[0];
    const page = entry[1];

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    const foundPageT1Index = s.tier1CurPages[2].findIndex(p => p.id === page);
    // console.log(s.tier1CurPages[2], foundPageT1Index);

    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[2][foundPageT1Index];

        updateTemperature(foundPageT1, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier1write[2]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-write", s.delay);
            s.simActions[2].push({ op: 'W', tierId: 1, cellId: foundPageT1Index });
        } else {
            s.tier1read[2]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[2].push({ op: 'R', tierId: 1, cellId: foundPageT1Index });
        }

        // sleep(3*s.delay);
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[2], currentRound);
        decayTemperatures(s.tier2CurPages[2], currentRound);
        decayTemperatures(s.tier3CurPages[2], currentRound);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[2].findIndex(p => p.id === page);
    // console.log(s.tier2CurPages[2], foundPageT2Index);

    if (foundPageT2Index !== -1) {

        const foundPageT2 = s.tier2CurPages[2][foundPageT2Index];

        updateTemperature(foundPageT2, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier2write[2]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-write", s.delay);
            s.simActions[2].push({ op: 'W', tierId: 2, cellId: foundPageT2Index });
        } else {
            s.tier2read[2]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[2].push({ op: 'R', tierId: 2, cellId: foundPageT2Index });
        }

        // sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier1CurPages[2]);

        if (tempInfo !== null) {

            const tempT1Index = tempInfo.index;
            const tempT1page = tempInfo.page;
            const victimTemp = getAvgTemp(s.tier1CurPages[2]);

            if (foundPageT2.temperature > Math.max(victimTemp, minT1MigrationTemp)) {

                // (foundPageT2.temperature, victimTemp);

                const temp = s.tier1CurPages[2][tempT1Index];
                s.tier1CurPages[2][tempT1Index] = foundPageT2;
                s.tier2CurPages[2][foundPageT2Index] = temp;

                s.tier2_1Migration[2]++;
                s.simActions[2].push({ op: 'M', tierId: 2, cellId: [foundPageT2Index, tempT1Index] });

                // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-from", s.delay);
                // highlightCells([`tier1alg2-${tempT1Index}`], "highlight-to", s.delay);

                // sleep(s.delay);

                // renderUpdatedTiers(2, 1, foundPageT2Index, tempT1Index, 2);

                // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-from", s.delay);
                // highlightCells([`tier1alg2-${tempT1Index}`], "highlight-to", s.delay);
                // sleep(s.delay);
            }
        }
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[2], currentRound);
        decayTemperatures(s.tier2CurPages[2], currentRound);
        decayTemperatures(s.tier3CurPages[2], currentRound);
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[2].findIndex(p => p.id === page);
    // console.log(s.tier3CurPages[2], foundPageT3Index);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[2][foundPageT3Index];

        updateTemperature(foundPageT3, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier3write[2]++;
            // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-write", s.delay);
            s.simActions[2].push({ op: 'W', tierId: 3, cellId: foundPageT3Index });
        } else {
            s.tier3read[2]++;
            // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-read", s.delay);
            s.simActions[2].push({ op: 'R', tierId: 3, cellId: foundPageT3Index });
        }

        // sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier2CurPages[2]);

        if (tempInfo !== null) {

            const tempT2Index = tempInfo.index;
            const tempT2page = tempInfo.page;

            const victimTemp = getAvgTemp(s.tier2CurPages[2]);

            // console.log(foundPageT3.temperature, victimTemp);

            if (foundPageT3.temperature > Math.max(victimTemp, minT2MigrationTemp)) {

                // console.log(foundPageT3.temperature, victimTemp);

                const temp = s.tier2CurPages[2][tempT2Index];
                s.tier2CurPages[2][tempT2Index] = foundPageT3;
                s.tier3CurPages[2][foundPageT3Index] = temp;

                s.tier2_3Migration[2]++;
                s.simActions[2].push({ op: 'M', tierId: 3, cellId: [foundPageT3Index, tempT2Index] });
                // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-from", s.delay);
                // highlightCells([`tier2alg2-${tempT2Index}`], "highlight-to", s.delay);
                // s.simActions[2].push({ cell: `tier2alg2-${tempT2Index}`, class: "highlight-to" });

                // sleep(s.delay);

                // renderUpdatedTiers(3, 2, foundPageT3Index, tempT2Index, 2);

                // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-to", s.delay);
                // highlightCells([`tier2alg2-${tempT2Index}`], "highlight-from", s.delay);
                // sleep(s.delay);
            }
        }
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[2], currentRound);
        decayTemperatures(s.tier2CurPages[2], currentRound);
        decayTemperatures(s.tier3CurPages[2], currentRound);
        return;
    }
    // coming here means did not find page in any tier, which is impossible if implementation is correct
}

function tTemp_TP(s, tier) {
    // console.log("Running tTemp");

    const currentRound = s.p;

    // temperature decay of all pages
    decayTemperatures(s.tier1CurPages[2], currentRound);
    decayTemperatures(s.tier2CurPages[2], currentRound);
    decayTemperatures(s.tier3CurPages[2], currentRound);

    const entry = s.workload[currentRound];
    if (!entry) return;

    const type = entry[0];
    const page = entry[1];

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    const foundPageT1Index = s.tier1CurPages[2].findIndex(p => p.id === page);
    console.log(s.tier1CurPages[2], foundPageT1Index);

    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[2][foundPageT1Index];

        updateTemperature(foundPageT1, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier1write[2]++;
            highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-write", s.delay);
        } else {
            s.tier1read[2]++;
            highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-read", s.delay);
        }

        sleep(s.delay);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[2].findIndex(p => p.id === page);
    console.log(s.tier2CurPages[2], foundPageT2Index);

    if (foundPageT2Index !== -1) {

        const foundPageT2 = s.tier2CurPages[2][foundPageT2Index];

        updateTemperature(foundPageT2, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier2write[2]++;
            highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-write", s.delay);
        } else {
            s.tier2read[2]++;
            highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-read", s.delay);
        }

        sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier1CurPages[2]);

        if (tempInfo !== null) {

            const tempT1Index = tempInfo.index;
            const tempT1page = tempInfo.page;

            const victimTemp = getAvgTemp(s.tier1CurPages[2]);

            if (foundPageT2.temperature > victimTemp) {

                console.log(foundPageT2.temperature, victimTemp);

                const temp = s.tier1CurPages[2][tempT1Index];
                s.tier1CurPages[2][tempT1Index] = foundPageT2;
                s.tier2CurPages[2][foundPageT2Index] = temp;

                s.tier2_1Migration[2]++;

                highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-from", s.delay);
                highlightCells([`tier1alg2-${tempT1Index}`], "highlight-to", s.delay);

                sleep(s.delay);

                renderUpdatedTiers(2, 1, foundPageT2Index, tempT1Index, 2);
            }
        }

        sleep(s.delay);
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[2].findIndex(p => p.id === page);
    console.log(s.tier3CurPages[2], foundPageT3Index);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[2][foundPageT3Index];

        updateTemperature(foundPageT3, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier3write[2]++;
            highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-write", s.delay);
        } else {
            s.tier3read[2]++;
            highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-read", s.delay);
        }

        sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier2CurPages[2]);

        if (tempInfo !== null) {

            const tempT2Index = tempInfo.index;
            const tempT2page = tempInfo.page;

            const victimTemp = getAvgTemp(s.tier2CurPages[2]);

            console.log(foundPageT3.temperature, victimTemp);

            if (foundPageT3.temperature > victimTemp) {

                console.log(foundPageT3.temperature, victimTemp);

                const temp = s.tier2CurPages[2][tempT2Index];
                s.tier2CurPages[2][tempT2Index] = foundPageT3;
                s.tier3CurPages[2][foundPageT3Index] = temp;

                s.tier2_3Migration[2]++;

                highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-from", s.delay);
                highlightCells([`tier2alg2-${tempT2Index}`], "highlight-to", s.delay);

                sleep(s.delay);

                renderUpdatedTiers(3, 2, foundPageT3Index, tempT2Index, 2);
            }
        }

        sleep(s.delay);
        return;
    }
}

// used in RL
// function cal_s2(queue, threads, read, asym) {
//     // ===== MATCH C++ SEMANTICS =====
//     // queue = number of queued tasks
//     // threads = concurrency
//     // read = latency
//     // asym = write asymmetry

//     if (threads <= 0) return 0;

//     // service rate approximation
//     const service = threads / read;

//     // arrival approximation from queue
//     const arrival = queue / (read + 1e-6);

//     // utilization
//     const rho = Math.min(arrival / service, 0.999); // avoid انف

//     // expected delay (M/M/1 approximation)
//     const delay = (1 / service) / (1 - rho);

//     // include asymmetry
//     return delay * (1 + asym);
// }

class TDAgent {
    constructor(n_states, p_init, beta, lam, scale, a_i, b_i) {
        this.n_states = n_states;
        this.p = [...p_init];
        this.beta = beta;
        this.lam = lam;
        this.scale = scale;

        this.a_i = a_i;
        this.b_i = b_i;

        this.e = new Array(p_init.length).fill(0); // eligibility trace
    }

    // ===== cost + features =====
    // cost_phi(state) {
    //     const phi = [];

    //     for (let i = 0; i < state.length; i++) {
    //         phi.push(this.a_i[i] * Math.exp(this.scale * this.b_i[i] * state[i]));
    //     }

    //     let cost = 0;
    //     for (let i = 0; i < phi.length; i++) {
    //         cost += this.p[i] * phi[i];
    //     }

    //     return [cost, phi];
    // }
    cost_phi(state) {
        const s1 = state[0];
        const s2 = state[1];

        const mu_L1 = 1 / (1 + Math.exp(-this.b_i[0] * s1 + this.scale * Math.log(this.a_i[0])));
        const mu_S1 = 1 - mu_L1;

        const mu_L2 = 1 / (1 + Math.exp(-this.b_i[1] * s2 + this.scale * Math.log(this.a_i[1])));
        const mu_S2 = 1 - mu_L2;

        const w = [mu_L1, mu_S1, mu_L2, mu_S2];

        const sum_w = w.reduce((a, b) => a + b, 0);

        const phi = w.map(v => v / sum_w);

        let cost = 0;
        for (let i = 0; i < this.p.length; i++) {
            cost += this.p[i] * phi[i];
        }

        return [cost, phi];
    }

    // ===== learning =====
//     learn(s_prev, s_curr, action, cost_prev, cost_curr, reward, phi_prev, gamma, tau_n=1) {
//         // const [cost_next, phi_next] = this.cost_phi(s_curr);

//         // const delta = reward + gamma * cost_next - cost_prev;
//         const discount = Math.exp(-this.beta * tau_n);
//         const delta = reward + discount * cost_curr - cost_prev;

//         // update eligibility
//         for (let i = 0; i < this.e.length; i++) {
//             // this.e[i] = gamma * this.lam * this.e[i] + phi_prev[i];
//             const discount = Math.exp(-this.beta * tau_n);
//             this.e[i] = this.lam * discount * this.e[i] + phi_prev[i];
//         }

//         // update weights
//         for (let i = 0; i < this.p.length; i++) {
//             this.p[i] += this.beta * delta * this.e[i];
//         }
//     }

    learn(s_prev, s_curr, action, cost_prev, cost_curr, reward, phi_prev, gamma, tau_n=1) {
        const alpha = 1e-4;  // ← add this, match C++
        const discount = Math.exp(-this.beta * tau_n);
        const delta = reward + discount * cost_curr - cost_prev;

        for (let i = 0; i < this.e.length; i++) {
            this.e[i] = this.lam * discount * this.e[i] + phi_prev[i];
        }

        for (let i = 0; i < this.p.length; i++) {
            this.p[i] += alpha * delta * this.e[i];  // ← use alpha, not this.beta
        }
    }
}

// ===== FIX: MATCH C++ =====
function cal_s2(queue, threads, read, asym) {
    if (threads <= 0) return 0;

    // C++ logic approximation:
    // s2 = read_time * ceil(queue / threads)
    const batches = Math.ceil(queue / threads);

    return batches * read * (1 + asym);
}

// ===== INIT RL =====
function initRL(s, total_num_pages) {

    s.lastStateT1 = null;
    s.lastStateT2 = null;
    s.lastStateT3 = null;

    s.lastCostT1 = 0;
    s.lastCostT2 = 0;
    s.lastCostT3 = 0;

    s.sumPhiT1 = [0,0,0,0];
    s.sumPhiT2 = [0,0,0,0];
    s.sumPhiT3 = [0,0,0,0];

    const p_init = [0, 0, 0, 0];
    const beta = 0.10;
    const lam = 0.8;

    // ===== NEW: scaling from C++ =====
    const exponent = Math.floor(Math.log10(1.0 / total_num_pages));
    const a_scale = Math.pow(10, exponent);

    // ===== NEW: Tier 1 =====
    const init_rng_s2_t1 =
        cal_s2(2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal) -
        cal_s2(0, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);

    const init_avg_s2_t1 =
        cal_s2(1, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);

    const b_i_1 = [
        5 / (0.1 / total_num_pages),
        5 / init_rng_s2_t1
    ];

    const a_i_1 = [
        Math.exp(a_scale * 0.5 * 5 / (0.1 / total_num_pages)),
        Math.exp(a_scale * init_avg_s2_t1 * 5 / init_rng_s2_t1)
    ];

    // ===== NEW: Tier 2 =====
    const init_rng_s2_t2 =
        cal_s2(2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal) -
        cal_s2(0, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);

    const init_avg_s2_t2 =
        cal_s2(1, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);

    const b_i_2 = [
        5 / (0.1 / total_num_pages),
        5 / init_rng_s2_t2
    ];

    const a_i_2 = [
        Math.exp(a_scale * 0.5 * 5 / (0.1 / total_num_pages)),
        Math.exp(a_scale * init_avg_s2_t2 * 5 / init_rng_s2_t2)
    ];

    // ===== NEW: Tier 3 =====
    const init_rng_s2_t3 =
        cal_s2(2, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal) -
        cal_s2(0, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);

    const init_avg_s2_t3 =
        cal_s2(1, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);

    const b_i_3 = [
        5 / (0.1 / total_num_pages),
        5 / init_rng_s2_t3
    ];

    const a_i_3 = [
        Math.exp(a_scale * 0.5 * 5 / (0.1 / total_num_pages)),
        Math.exp(a_scale * init_avg_s2_t3 * 5 / init_rng_s2_t3)
    ];

    // ===== NEW: correct scaling factor =====
    const inv_scale = 1 / a_scale;

    s.rlAgent1 = new TDAgent(2, p_init, beta, lam, inv_scale, a_i_1, b_i_1);
    s.rlAgent2 = new TDAgent(2, p_init, beta, lam, inv_scale, a_i_2, b_i_2);
    s.rlAgent3 = new TDAgent(2, p_init, beta, lam, inv_scale, a_i_3, b_i_3);
}

// Reward function
function reward_from_avgtemp(
    Tier1, Tier2, Tier3,
    avg_temp_T1, avg_temp_T2, avg_temp_T3,
    read_time_tier1, asym_tier1,
    read_time_tier2, asym_tier2,
    read_time_tier3, asym_tier3,
    wr_ww,
    total_num_pages
) {
    const sumExpT1 = Math.exp((1 + avg_temp_T1) / 2) * Tier1.size;
    const sumExpT2 = Math.exp((1 + avg_temp_T2) / 2) * Tier2.size;
    const sumExpT3 = Math.exp((1 + avg_temp_T3) / 2) * Tier3.size;

    let reward =
        0.5 * (read_time_tier1 + wr_ww * read_time_tier1 * asym_tier1) * sumExpT1 +
        0.5 * (read_time_tier2 + wr_ww * read_time_tier2 * asym_tier2) * sumExpT2 +
        0.5 * (read_time_tier3 + wr_ww * read_time_tier3 * asym_tier3) * sumExpT3;

    reward = -1 * reward / total_num_pages;

    return reward;
}

// ================================
// 3. STATE FUNCTION (MATCH C++)
// ================================
function getState(s, tierId, algoIndex=3) {
    const avgTemp =
        tierId === 1 ? getAvgTemp(s.tier1CurPages[algoIndex]) :
        tierId === 2 ? getAvgTemp(s.tier2CurPages[algoIndex]) :
                       getAvgTemp(s.tier3CurPages[algoIndex]);

    const queue =
        tierId === 1 ? s.tier1Queue[algoIndex].length :
        tierId === 2 ? s.tier2Queue[algoIndex].length :
                       s.tier3Queue[algoIndex].length;

    const threads =
        tierId === 1 ? s.t1Concurrency :
        tierId === 2 ? s.t2Concurrency :
                       s.t3Concurrency;

    const read =
        tierId === 1 ? s.t1ReadLatency :
        tierId === 2 ? s.t2ReadLatency :
                       s.t3ReadLatency;

    const asym = 
        tierId === 1? s.t1AlphaVal : // keep simple (or match your config)
        tierId === 2? s.t2AlphaVal :
                       s.t3AlphaVal;

    const s1 = avgTemp;
    const s2 = cal_s2(queue, threads, read, asym);

    return [s1, s2];
}

function rlLearn(s, algoIndex) {
    const reward = reward_from_avgtemp(
        new Map(s.tier1CurPages[algoIndex].map(p => [p.id, p])),
        new Map(s.tier2CurPages[algoIndex].map(p => [p.id, p])),
        new Map(s.tier3CurPages[algoIndex].map(p => [p.id, p])),
        getAvgTemp(s.tier1CurPages[algoIndex]),
        getAvgTemp(s.tier2CurPages[algoIndex]),
        getAvgTemp(s.tier3CurPages[algoIndex]),
        s.t1ReadLatency, s.t1AlphaVal,
        s.t2ReadLatency, s.t2AlphaVal,
        s.t3ReadLatency, s.t3AlphaVal,
        1.0,
        s.workload.length
    );

    // if (s.lastStateT1) {
    //     s.rlAgent1.learn(s.lastStateT1, getState(s,1,algoIndex), [], s.lastCostT1, 0, reward, s.sumPhiT1, 1);
    //     s.rlAgent2.learn(s.lastStateT2, getState(s,2,algoIndex), [], s.lastCostT2, 0, reward, s.sumPhiT2, 1);
    //     s.rlAgent3.learn(s.lastStateT3, getState(s,3,algoIndex), [], s.lastCostT3, 0, reward, s.sumPhiT3, 1);
    // }

    if (s.lastStateT1) {
        const state1_next = getState(s, 1, algoIndex);
        const state2_next = getState(s, 2, algoIndex);
        const state3_next = getState(s, 3, algoIndex);

        const [cost1_next] = s.rlAgent1.cost_phi(state1_next);
        const [cost2_next] = s.rlAgent2.cost_phi(state2_next);
        const [cost3_next] = s.rlAgent3.cost_phi(state3_next);

        s.rlAgent1.learn(s.lastStateT1, state1_next, [], s.lastCostT1, cost1_next, reward, s.sumPhiT1, 1);
        s.rlAgent2.learn(s.lastStateT2, state2_next, [], s.lastCostT2, cost2_next, reward, s.sumPhiT2, 1);
        s.rlAgent3.learn(s.lastStateT3, state3_next, [], s.lastCostT3, cost3_next, reward, s.sumPhiT3, 1);
    }
    // store last
    s.rlAgent1.lastState = getState(s,1,algoIndex);
    s.rlAgent2.lastState = getState(s,2,algoIndex);
    s.rlAgent3.lastState = getState(s,3,algoIndex);
}

function tRL(s) {
    // console.log("Running ReStore");
    const algoIndex = 3;
    const currentRound = s.p;
    const minAccessToT1 = 3;
    const minAccessToT2 = 2;
    const tempAlpha = 0.05; // as per paper implementation
    const minT1MigrationTemp = 1-0.5/Math.exp(tempAlpha*minAccessToT1);
    const minT2MigrationTemp = 1-0.5/Math.exp(tempAlpha*minAccessToT2);

    if (s.rlAgent1 == null) {
        console.log("initRL inputs:", s.t1ReadLatency, s.t2ReadLatency, s.t3ReadLatency, 
            s.t1Concurrency, s.t2Concurrency, s.t3Concurrency,
            s.t1AlphaVal,   s.t2AlphaVal,   s.t3AlphaVal);
        initRL(s, totalPages);
        console.log("a_i_1:", s.rlAgent1.a_i, "b_i_1:", s.rlAgent1.b_i);
        console.log("a_i_2:", s.rlAgent2.a_i, "b_i_2:", s.rlAgent2.b_i);
    }

    const entry = s.workload[currentRound];
    if (!entry) return;

    s.approxT1QueueSizeEstimate = 0;
    s.approxT2QueueSizeEstimate = 0;
    s.approxT3QueueSizeEstimate = 0;
    for (let i=currentRound+1; i<s.workload.length; i++) {
        if (s.tier2CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            s.approxT2QueueSizeEstimate++;
        } else if (s.tier1CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            s.approxT1QueueSizeEstimate++;
        } else if (s.tier3CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            s.approxT3QueueSizeEstimate++;
        }
    }
    // s.approxT1QueueSizeEstimate = 5;
    // s.approxT2QueueSizeEstimate = 5;
    // s.approxT3QueueSizeEstimate = 5;

    const type = entry[0];
    const page = entry[1];

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    const foundPageT1Index = s.tier1CurPages[algoIndex].findIndex(p => p.id === page);
    // console.log(s.tier1CurPages[algoIndex], foundPageT1Index);

    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[algoIndex][foundPageT1Index];

        updateTemperature(foundPageT1, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier1write[algoIndex]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-write", s.delay);
            s.simActions[algoIndex].push({ op: 'W', tierId: 1, cellId: foundPageT1Index });
        } else {
            s.tier1read[algoIndex]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[algoIndex].push({ op: 'R', tierId: 1, cellId: foundPageT1Index });
        }

        // sleep(3*s.delay);
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound);

        // ===== FIX: RL STATE STORE FOR T1 HIT =====
        const state_t1 = getState(s, 1, algoIndex);
        const [cost_t1, phi_t1] = s.rlAgent1.cost_phi(state_t1);

        s.lastStateT1 = state_t1;
        s.lastCostT1 = cost_t1;
        s.sumPhiT1 = phi_t1;

        // learn
        rlLearn(s, algoIndex);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[algoIndex].findIndex(p => p.id === page);
    // console.log(s.tier2CurPages[algoIndex], foundPageT2Index);

    if (foundPageT2Index !== -1) {

        const foundPageT2 = s.tier2CurPages[algoIndex][foundPageT2Index];

        updateTemperature(foundPageT2, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier2write[algoIndex]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-write", s.delay);
            s.simActions[algoIndex].push({ op: 'W', tierId: 2, cellId: foundPageT2Index });
        } else {
            s.tier2read[algoIndex]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[algoIndex].push({ op: 'R', tierId: 2, cellId: foundPageT2Index });
        }

        // sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier1CurPages[algoIndex]);

        if (tempInfo !== null) {

            const tempT1Index = tempInfo.index;
            const tempT1page = tempInfo.page;
            const victimTemp = getAvgTemp(s.tier1CurPages[algoIndex]);

            // if (foundPageT2.temperature > Math.max(victimTemp, minT1MigrationTemp)) {
            //===== RL DECISION (Tier2 to Tier1) =====
            const state_t2_be = getState(s, 2, algoIndex);
            const state_t1_be = getState(s, 1, algoIndex);

            const [cost_t2_be, phi_t2] = s.rlAgent2.cost_phi(state_t2_be);
            const [cost_t1_be, phi_t1] = s.rlAgent1.cost_phi(state_t1_be);

            // simulate AFTER state (same as C++)
            const s1_t2_af = (state_t2_be[0] * s.tier2CurPages[algoIndex].length - foundPageT2.temperature) /
                            (s.tier2CurPages[algoIndex].length - 1);

            const s1_t1_af = (state_t1_be[0] * s.tier1CurPages[algoIndex].length + foundPageT2.temperature) /
                            (s.tier1CurPages[algoIndex].length + 1);

            // for (let i=currentRound+1; i<s.workload.length; i++) {
            //     // console.log("Future access in RL sim:", s.workload[i]);
            //     // console.log(workload[i][1]);
            //     // console.log("Current tier1 and tier2:", s.tier1CurPages[algoIndex], s.tier2CurPages[algoIndex]);
            //     if (s.tier2CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            //         approxT2QueueSizeEstimate++;
            //     } else if (s.tier1CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            //         approxT1QueueSizeEstimate++;
            //     }
            // }
            // const s2_t2_af = cal_s2(s.tier2Queue[algoIndex].length + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);
            // const s2_t1_af = cal_s2(s.tier1Queue[algoIndex].length + 2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);

            const s2_t2_af = cal_s2(s.approxT2QueueSizeEstimate + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);
            const s2_t1_af = cal_s2(s.approxT1QueueSizeEstimate + 2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);

            const [cost_t2_af] = s.rlAgent2.cost_phi([s1_t2_af, s2_t2_af]);
            const [cost_t1_af] = s.rlAgent1.cost_phi([s1_t1_af, s2_t1_af]);

            const left  = cost_t1_be + cost_t2_af;
            const right = cost_t1_af + cost_t2_be;

            // ===== STORE FOR LEARNING =====
            s.lastStateT1 = state_t1_be;
            s.lastStateT2 = state_t2_be;

            s.lastCostT1 = cost_t1_be;
            s.lastCostT2 = cost_t2_be;

            s.sumPhiT1 = phi_t1;
            s.sumPhiT2 = phi_t2

            const state_t3_snap = getState(s, 3, algoIndex);
            const [cost_t3_snap, phi_t3_snap] = s.rlAgent3.cost_phi(state_t3_snap);
            s.lastStateT3 = state_t3_snap;
            s.lastCostT3 = cost_t3_snap;
            s.sumPhiT3 = phi_t3_snap;
            // RL Based Decision
            
            console.log("left:", left, "right:", right, "cost_t1_be:", cost_t1_be, "cost_t2_be:", cost_t2_be, "cost_t1_af:", cost_t1_af, "cost_t2_af:", cost_t2_af);
            if (left <= right) {
                const temp = s.tier1CurPages[algoIndex][tempT1Index];
                s.tier1CurPages[algoIndex][tempT1Index] = foundPageT2;
                s.tier2CurPages[algoIndex][foundPageT2Index] = temp;

                s.tier2_1Migration[algoIndex]++;
                s.simActions[algoIndex].push({ op: 'M', tierId: 2, cellId: [foundPageT2Index, tempT1Index] });

                // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-from", s.delay);
                // highlightCells([`tier1alg2-${tempT1Index}`], "highlight-to", s.delay);

                // sleep(s.delay);

                // renderUpdatedTiers(2, 1, foundPageT2Index, tempT1Index, 2);

                // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-from", s.delay);
                // highlightCells([`tier1alg2-${tempT1Index}`], "highlight-to", s.delay);
                // sleep(s.delay);
            }
        }
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound);
        // ===== RL LEARNING =====
        rlLearn(s, algoIndex);
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[algoIndex].findIndex(p => p.id === page);
    // console.log(s.tier3CurPages[algoIndex], foundPageT3Index);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[algoIndex][foundPageT3Index];

        updateTemperature(foundPageT3, currentRound, s.workload.length/100);

        if (type === "W") {
            s.tier3write[algoIndex]++;
            // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-write", s.delay);
            s.simActions[algoIndex].push({ op: 'W', tierId: 3, cellId: foundPageT3Index });
        } else {
            s.tier3read[algoIndex]++;
            // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-read", s.delay);
            s.simActions[algoIndex].push({ op: 'R', tierId: 3, cellId: foundPageT3Index });
        }

        // sleep(s.delay);

        const tempInfo = getTemperaturePage(s.tier2CurPages[algoIndex]);

        if (tempInfo !== null) {

            const tempT2Index = tempInfo.index;
            const tempT2page = tempInfo.page;

            const victimTemp = getAvgTemp(s.tier2CurPages[algoIndex]);

            // if (foundPageT3.temperature > Math.max(victimTemp, minT2MigrationTemp)) {
            // ===== RL DECISION (Tier3 to Tier2) =====
            const state_t3_be = getState(s, 3, algoIndex);
            const state_t2_be = getState(s, 2, algoIndex);

            const [cost_t3_be, phi_t3] = s.rlAgent3.cost_phi(state_t3_be);
            const [cost_t2_be, phi_t2] = s.rlAgent2.cost_phi(state_t2_be);

            const s1_t3_af = (state_t3_be[0] * s.tier3CurPages[algoIndex].length - foundPageT3.temperature) /
                            (s.tier3CurPages[algoIndex].length - 1);

            const s1_t2_af = (state_t2_be[0] * s.tier2CurPages[algoIndex].length + foundPageT3.temperature) /
                            (s.tier2CurPages[algoIndex].length + 1);
            
            
            // for (let i=currentRound+1; i<s.workload.length; i++) {
            //     if (s.tier3CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            //         approxT3QueueSizeEstimate++;
            //     } else if (s.tier2CurPages[algoIndex].findIndex(p => p.id === s.workload[i][1]) !== -1) {
            //         approxT2QueueSizeEstimate++;
            //     }
            // }
            // const s2_t3_af = cal_s2(s.tier3Queue[algoIndex].length + 2, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);
            // const s2_t2_af = cal_s2(s.tier2Queue[algoIndex].length + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);

            const s2_t3_af = cal_s2(s.approxT3QueueSizeEstimate + 2, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);
            const s2_t2_af = cal_s2(s.approxT2QueueSizeEstimate + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);

            const [cost_t3_af] = s.rlAgent3.cost_phi([s1_t3_af, s2_t3_af]);
            const [cost_t2_af] = s.rlAgent2.cost_phi([s1_t2_af, s2_t2_af]);

            const left  = cost_t2_be + cost_t3_af;
            const right = cost_t2_af + cost_t3_be;

            // ===== STORE FOR LEARNING =====
            s.lastStateT3 = state_t3_be;
            s.lastStateT2 = state_t2_be;

            s.lastCostT3 = cost_t3_be;
            s.lastCostT2 = cost_t2_be;

            s.sumPhiT3 = phi_t3;
            s.sumPhiT2 = phi_t2;

            const state_t1_snap = getState(s, 1, algoIndex);
            const [cost_t1_snap, phi_t1_snap] = s.rlAgent1.cost_phi(state_t1_snap);
            s.lastStateT1 = state_t1_snap;
            s.lastCostT1 = cost_t1_snap;
            s.sumPhiT1 = phi_t1_snap;
            // RL Based Decision
            console.log("left:", left, "right:", right, "cost_t1_be:", cost_t1_snap, "cost_t2_be:", cost_t2_be, "cost_t2_af:", cost_t2_af, "cost_t3_af:", cost_t3_af);
            if (left <= right) {
                const temp = s.tier2CurPages[algoIndex][tempT2Index];
                s.tier2CurPages[algoIndex][tempT2Index] = foundPageT3;
                s.tier3CurPages[algoIndex][foundPageT3Index] = temp;

                s.tier2_3Migration[algoIndex]++;
                s.simActions[algoIndex].push({ op: 'M', tierId: 3, cellId: [foundPageT3Index, tempT2Index] });
                // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-from", s.delay);
                // highlightCells([`tier2alg2-${tempT2Index}`], "highlight-to", s.delay);
                // s.simActions[2].push({ cell: `tier2alg2-${tempT2Index}`, class: "highlight-to" });

                // sleep(s.delay);

                // renderUpdatedTiers(3, 2, foundPageT3Index, tempT2Index, 2);

                // highlightCells([`tier3alg2-${foundPageT3Index}`], "highlight-to", s.delay);
                // highlightCells([`tier2alg2-${tempT2Index}`], "highlight-from", s.delay);
                // sleep(s.delay);
            }
        }
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound);

        // ===== RL LEARNING =====
        rlLearn(s, algoIndex);
        return;
    }
    // coming here means did not find page in any tier, which is impossible if implementation is correct
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
