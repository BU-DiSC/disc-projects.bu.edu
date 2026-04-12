const state = {
    config: {
        fast_step_delay: 20,
        medium_step_delay: 200,
        slow_step_delay: 2000,
        finisher_step_delay: 1,
        plotUpdateInterval: 10, // Update plots every 10 steps
        perReqEnqueueTime: 1, // microseconds, will be updated after workload generation
    },

    tiers: {
        tier1CurPages: [[], [], [], [], [], [], []],
        tier2CurPages: [[], [], [], [], [], [], []],
        tier3CurPages: [[], [], [], [], [], [], []],

        // stats as per algorithms 0, 1, 2 ...
        tier1read: [0, 0, 0, 0, 0, 0, 0],
        tier2read: [0, 0, 0, 0, 0, 0, 0],
        tier3read: [0, 0, 0, 0, 0, 0, 0],
        tier1write: [0, 0, 0, 0, 0, 0, 0],
        tier2write: [0, 0, 0, 0, 0, 0, 0],
        tier3write: [0, 0, 0, 0, 0, 0, 0],

        tier2_1Migration: [0, 0, 0, 0, 0, 0, 0],
        tier2_3Migration: [0, 0, 0, 0, 0, 0, 0],

        tier1Queue: [[], [], [], [], [], [], []],
        tier2Queue: [[], [], [], [], [], [], []],
        tier3Queue: [[], [], [], [], [], [], []],

        tier1ElapsedTime: [0, 0, 0, 0, 0, 0, 0],
        tier2ElapsedTime: [0, 0, 0, 0, 0, 0, 0],
        tier3ElapsedTime: [0, 0, 0, 0, 0, 0, 0],

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
            reqRounds: [],
            hotness: 0
        },

        // Playback Control
        pauser: false,
        reloader: 0,
        playing: false,
        delay: 2000,
        started: false,
        finished: false,

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

        // Store actual phi vectors for eligibility trace (not sumPhi)
        lastPhiT1: [0, 0, 0, 0],
        lastPhiT2: [0, 0, 0, 0],
        lastPhiT3: [0, 0, 0, 0],

        // RL learning schedule control
        rlStartUpdate: false,
        rlStartUpdateI: -1,
        rlUpdateFreqs: 1,//100,
        rlInitRounds: 0,//20,

        // Sliding window for dynamic a_i, b_i updates
        s1T1List: [0.5], s1T2List: [0.5], s1T3List: [0.5],
        s2T1List: [0], s2T2List: [0], s2T3List: [0],
        numElementsToConsider: 30,//300,

        approxTimeElapsed: 0,
        approxT1QueueSizeEstimate: 0,
        approxT2QueueSizeEstimate: 0,
        approxT3QueueSizeEstimate: 0,

        latencyValuesForPlot: [[], [], [], [], [], [], []],
        migrationCountsForPlot: [[], [], [], [], [], [], []],
        t2t1MigrationCountsForPlot: [[], [], [], [], [], [], []],
        t2t3MigrationCountsForPlot: [[], [], [], [], [], [], []]
    }
};

// revisit this after finalizing the page structure and any other changes to the tier structure
function resetTiersState() {
    const s = state.tiers;
    // Tier page lists
    s.tier1CurPages = [[], [], [], [], [], [], []];
    s.tier2CurPages = [[], [], [], [], [], [], []];
    s.tier3CurPages = [[], [], [], [], [], [], []];
    // Reads
    s.tier1read = [0, 0, 0, 0, 0, 0, 0];
    s.tier2read = [0, 0, 0, 0, 0, 0, 0];
    s.tier3read = [0, 0, 0, 0, 0, 0, 0];
    // Writes
    s.tier1write = [0, 0, 0, 0, 0, 0, 0];
    s.tier2write = [0, 0, 0, 0, 0, 0, 0];
    s.tier3write = [0, 0, 0, 0, 0, 0, 0];
    // Migration stats
    s.tier2_1Migration = [0, 0, 0, 0, 0, 0, 0];
    s.tier2_3Migration = [0, 0, 0, 0, 0, 0, 0];
    // Queues
    s.tier1Queue = [[], [], [], [], [], [], []];
    s.tier2Queue = [[], [], [], [], [], [], []];
    s.tier3Queue = [[], [], [], [], [], [], []];

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
    s.delay = state.config.slow_step_delay;
    s.started = false;
    s.finished = true;

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

    // Reset actual phi vectors
    s.lastPhiT1 = [0, 0, 0, 0];
    s.lastPhiT2 = [0, 0, 0, 0];
    s.lastPhiT3 = [0, 0, 0, 0];

    // Reset RL scheduling
    s.rlStartUpdate = false;
    s.rlStartUpdateI = -1;

    // Reset sliding windows
    s.s1T1List = [0.5]; s.s1T2List = [0.5]; s.s1T3List = [0.5];
    s.s2T1List = [0]; s.s2T2List = [0]; s.s2T3List = [0];
    
    s.approxTimeElapsed = 0;

    s.simActions = [[], [], [], [], [], [], []];
}

function resetAll() {
    resetStats();
    resetTiersState();
    resetPlots();
    emptyTiers();
    console.log(state.tiers.algorithms);
    renderTiers(tier1, tier2, tier3, state.tiers.algorithms, -1);
    updateProgress(0, 100);
    document.getElementById("curOp").textContent = "Read/Write from/to Page ??";
    document.getElementById("curRound").textContent = "0";
}

function resetStats() {
    const numAlgos = state.tiers.algorithms.length;
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

function resetPlots() {
    console.log("🔄 Resetting # Total all plots...");
    state.tiers.latencyValuesForPlot = [[], [], [], [], [], [], []];
    state.tiers.migrationCountsForPlot = [[], [], [], [], [], [], []];
    state.tiers.t2t1MigrationCountsForPlot = [[], [], [], [], [], [], []];
    state.tiers.t2t3MigrationCountsForPlot = [[], [], [], [], [], [], []];

    const migrationCountPlot = document.getElementById('migration_count-graph');
    if (migrationCountPlot) {
        Plotly.react(migrationCountPlot, [], {
            font: {
                family: 'Linux Libertine, serif',
                size: 17,
                color: '#111',
                weight: 400
            },
            margin: { t: 20, b: 40, l: 50, r: 10 },
            xaxis: { title: 'Operation steps' },
            yaxis: { title: '# Total Migrations' },
            height: 350,
            showlegend: false
        });
    }

    const indivMigrationCountPlot = document.getElementById('indiv_migration_count-graph');
    if (indivMigrationCountPlot) {
        Plotly.react(indivMigrationCountPlot, [], {
            font: {
                family: 'Linux Libertine, serif',
                size: 17,
                color: '#111',
                weight: 400
            },
            margin: { t: 20, b: 40, l: 50, r: 10 },
            xaxis: { title: 'Operation steps' },
            // yaxis: { title: '# Migrations' },
            height: 350,
            showlegend: true
        });
    }

    const latencyPlot = document.getElementById('latency-graph');
    if (latencyPlot) {
        Plotly.react(latencyPlot, [], {
            font: {
                family: 'Linux Libertine, serif',
                size: 17,
                color: '#111',
                weight: 400
            },
            margin: { t: 20, b: 40, l: 50, r: 10 },
            xaxis: { title: 'Operation steps' },
            yaxis: { title: 'Latency (ms)' },
            height: 350,
            showlegend: true
        });
    }
}

function handleInputChange() {
    const s = state.tiers;
    console.log("Input changed, resetting stats, stopping simulation, and clearing plots...");

    // Stop the Simulation
    s.playing = false;
    s.pauser = false;
    s.reloader = 1;  // Ensure myLoop stops execution

    // Reset Control + Step Tracker
    s.p = 0;
    s.workload = [];

    // Reset Buffer States and Metrics via utility
    resetAll();

    // Re-enable play button
    $("#play-button").prop("disabled", false);

    console.log("Simulation reset. Waiting for Play button.");
}

// Log user edits to individual input fields
$(document).on("input", "input[type='number']", function () {
    const id = $(this).attr("id");
    const newValue = $(this).val();
    console.log(`User manually changed ${id} → ${newValue}`);
});

$(document).on("change", "#device1, #device2, #device3", function () {
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

    if (id === "device1") {
        latencyId = "lat1";
        asymId = "asym1";
        alphaId = "alpha1";
    } else if (id === "device2") {
        latencyId = "lat2";
        asymId = "asym2";
        alphaId = "alpha2";
    } else if (id === "device3") {
        latencyId = "lat3";
        asymId = "asym3";
        alphaId = "alpha3";
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

$(document).on("change", "#tierRatios", function () {
    const configIndex = parseInt($(this).val()) - 1;
    tierConfig = tierRatioCapacities[configIndex];
    initTierConfig(tierConfig, state.tiers.algorithms);
});

// ensure in this function that changing top/mid tier capacity reflects in the bottom tier capacity so that sum is 100
$(document).on("change", "#topTierCapacity, #midTierCapacity", function () {
    const id = $(this).attr("id");
    if (id === "topTierCapacity") {
    }
    else if (id === "midTierCapacity") {
    }
});

function clonePage(p) {
    return {
        id: p.id,
        lastRequestRound: p.lastRequestRound,
        frequency: p.frequency,
        temperature: p.temperature,
        reqRounds: [...p.reqRounds]
    };
}

$(document).ready(function () {
    $("#lat1").val(optaneSSD[0]);
    $("#asym1").val(optaneSSD[1]);
    $("#alpha1").val(optaneSSD[2]);

    $("#lat2").val(pciSSD[0]);
    $("#asym2").val(pciSSD[1]);
    $("#alpha2").val(pciSSD[2]);

    $("#lat3").val(sataSSD[0]);
    $("#asym3").val(sataSSD[1]);
    $("#alpha3").val(sataSSD[2]);

    tierConfig = tierRatioCapacities[5]; // Default to last (custom) configuration
    initTierConfig(tierConfig, state.tiers.algorithms);
    resetPlots();

    // Attach event listeners to all relevant inputs
    $("#workload, #e, #s, #x, #d").on("change input", handleInputChange);
    $("#asym1, #asym2, #asym3, #lat1, #lat2, #lat3, #alpha1, #alpha2, #alpha3, #device1, #device2, #device3").on("change input", handleInputChange);
    $("#tierRatio, #topTierCapacity, #midTierCapacity, #bottomTierCapacity").on("change input", handleInputChange);

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
                updateLatencyPlot(s);
                updateMigrationCountPlot(s);
                updateIndivMigrationCountPlot(s);
            }

        } else {
            console.warn("Already at the first step.");
        }
    });

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

                updateMigrationCountPlot(s);
                updateIndivMigrationCountPlot(s);
                updateLatencyPlot(s);
            }


            // Update visual state
            baseDisplay();
            ACEDisplay();
            updateProgress(s.p, s.workload.length);

        } else {
            console.warn("⚠️ Already at the last step.");
        }
    });

    $("#fast-button").click(function () {
        const s = state;
        s.tiers.delay = s.config.fast_step_delay;
    });

    $("#medium-button").click(function () {
        const s = state;
        s.tiers.delay = s.config.medium_step_delay;
    });

    $("#slow-button").click(function () {
        const s = state;
        s.tiers.delay = s.config.slow_step_delay;
    });

    $("#finish-button").click(function () {
        const s = state.tiers;
        finisher();
    });

    $("#play-button").click(function () {
        console.log("Play button clicked.");
        // need to fix ui naming
        // curently alphaX means concurreny, asymX means alpha, latX means read latency
        // console.log("Raw UI values:",
        //     $("#lat1").val(),
        //     $("#lat2").val(),
        //     $("#lat3").val(),
        //     $("#asym1").val(),
        //     $("#asym2").val(),
        //     $("#asym3").val(),
        //     $("#alpha1").val(),
        //     $("#alpha2").val(),
        //     $("#alpha3").val()
        // );

        const t1AlphaVal = parseFloat($("#asym1").val());
        const t2AlphaVal = parseFloat($("#asym2").val());
        const t3AlphaVal = parseFloat($("#asym3").val());
        const t1ReadLatencyVal = parseFloat($("#lat1").val());
        const t2ReadLatencyVal = parseFloat($("#lat2").val());
        const t3ReadLatencyVal = parseFloat($("#lat3").val());
        const t1ConcurrencyVal = parseInt($("#alpha1").val());
        const t2ConcurrencyVal = parseInt($("#alpha2").val());
        const t3ConcurrencyVal = parseInt($("#alpha3").val());

        // console.log("Parsed parameter values:",
        //     t1ReadLatencyVal, t2ReadLatencyVal, t3ReadLatencyVal,
        //     t1ConcurrencyVal, t2ConcurrencyVal, t3ConcurrencyVal,
        //     t1AlphaVal, t2AlphaVal, t3AlphaVal
        // );

        const s = state.tiers;

        if (s.finished) {
            console.log("Simulation already finished. Resetting state for new run.");
            resetAll();
            s.finished = false;
        }
        // Latch parameters once on first start
        if (!s.started) {
            s.started = true;
            s.t1Alpha = t1AlphaVal;
            s.t2Alpha = t2AlphaVal;
            s.t3Alpha = t3AlphaVal;
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

            // initTiers();
            initializeWithRandomPages(s);
            resetPlots();
            const algorithms = [tLRU, tLFU, tTemp, tRL];

            if (s.workload.length === 0) {
                s.workload = generateWorkload();
                printWorkloadStats(s.workload);
                if (s.workload.length === 0) {
                    console.error("Failed to generate workload. Check input parameters.");
                    return;
                }
                s.p = 0;
                s.algorithms = algorithms;
                // let workloadEnqueueTimeEstimatePerReq = getWorkloadEnqueueTimeEstimate(s.workload);
                // state.config.perReqEnqueueTime = workloadEnqueueTimeEstimatePerReq;
                // let's hardcode this to 5, uncomment the above two lines to avoid hardcoding
                // but then it will be device specific and run specific, not consistent
                state.config.perReqEnqueueTime = 2//15;

                printSimulationInputs(state.config.perReqEnqueueTime, tier1, tier2, tier3, s.workload)
                // console.log("Workload generated, length:", s.workload.length);
                // console.log("Estimated enqueue time per request (microseconds):", state.config.perReqEnqueueTime);


                for (let i = 0; i < algorithms.length; i++) {
                    s.tier1CurPages[i] = tier1.map(clonePage);
                    s.tier2CurPages[i] = tier2.map(clonePage);
                    s.tier3CurPages[i] = tier3.map(clonePage);
                }
                // console.log(s.tier2CurPages[2].find(p => p.id === 15).reqRounds === s.tier2CurPages[3].find(p => p.id === 15).reqRounds);
                renderTiers(tier1, tier2, tier3, algorithms, 0);

                calculate(s, algorithms);
            }

            s.playing = true;
            s.pauser = false;
            s.reloader = 0;

            console.log("▶️ Starting simulation...");
            myLoop(s);
            return;
        }

        // ── State 2: Pause ───────────────────────────────────────────────────────
        if (!s.pauser) {
            s.pauser = true;
            console.log("⏸ Simulation paused.");
            return;
        }

        // ── State 3: Resume ──────────────────────────────────────────────────────
        s.pauser = false;
        s.reloader = 0;
        console.log("▶️ Simulation resumed.");
        myLoop(s);
    });

    $("#progress-bar").on("input", function () {
        const s = state.tiers;
        // need to fix this later (if needed)
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
        resetTiersState();   // Clear metrics, buffer, flags, etc.

        const samplingRate = 10;

        for (let i = 0; i <= newStep; i++) {
            if (s.workload[i] !== undefined) {
                s.baseAlgorithm(i, s);
                s.ACEAlgorithm(i, s);

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

        // updateMigrationCountPlot(s.aceWriteBatches, s.traditionalWriteBatches);
        // updateIndivMigrationCountPlot(s);
        // updateLatencyPlot(s.aceLatency, s.traditionalLatency);
        updateLatencyPlot(s);
        updateMigrationCountPlot(s);
        updateIndivMigrationCountPlot(s);
    });
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
        s.finished = true;
        return;
    }

    setTimeout(function () {
        if (s.reloader === 1) return;

        if (!s.pauser) {
            // console.log(s.p, s.workload[s.p])
            for (let i = 0; i < s.algorithms.length; i++) {
                s.algorithms[i](s);
            }
            for (let i = 0; i < s.algorithms.length; i++) {
                algoDisplay(i, s);
            }

            if (s.p < s.workload.length) {
                document.getElementById("curRound").textContent = s.p+1;
                document.getElementById("curOp").textContent = s.workload[s.p][0] === 'R' ?
                    `Read from Page ${s.workload[s.p][1]}` : `Write to Page ${s.workload[s.p][1]}`;
                s.p++;
                updateProgress(s.p, s.workload.length);
            }

            if ((s.p - 1) % state.config.plotUpdateInterval === 0) { // || s.p === s.workload.length - 1) {
                updateLatencyPlot(s);
                updateMigrationCountPlot(s);
                updateIndivMigrationCountPlot(s);
            }
        }

        if (s.playing) {
            myLoop(s);
        } else {
            console.log("Simulation paused or stopped.");
        }
    }, s.delay);
}

/* Progress Bar Update Function */
function updateProgress(currentStep, totalSteps) {
    let progressPercent = Math.round((currentStep / totalSteps) * 100);
    // console.log(`   Step ${currentStep}/${totalSteps} → Progress: ${progressPercent}%`);

    $("#progress-bar").val(progressPercent);  // Update slider value
    $("#progress-label").text(progressPercent + "%");  // Update label
    $("#progress-bar").trigger('change');  // Force DOM refresh
}

function calculateTotalMigrationCountFromTiers(algoIndex) {
    tier1MigrationCount = state.tiers.tier2_1Migration[algoIndex];
    tier3MigrationCount = state.tiers.tier2_3Migration[algoIndex];
    tier2MigrationCount = tier1MigrationCount + tier3MigrationCount;
    return tier2MigrationCount;
}

function calculateLatencyFromTiers(algoIndex) {
    const s = state.tiers;
    tier1ReadCounts = s.tier1read[algoIndex];
    tier1WriteCounts = s.tier1write[algoIndex];
    tier2ReadCounts = s.tier2read[algoIndex];
    tier2WriteCounts = s.tier2write[algoIndex];
    tier3ReadCounts = s.tier3read[algoIndex];
    tier3WriteCounts = s.tier3write[algoIndex];
    tier1MigrationCount = s.tier2_1Migration[algoIndex];
    tier3MigrationCount = s.tier2_3Migration[algoIndex];
    tier2MigrationCount = tier1MigrationCount + tier3MigrationCount;

    // 1 migration = 1 read + 1 write on source tier, 1 write + 1 read on dest tier
    // so read counts and write counts for both tiers should be incremented by the migration count
    tier1ReadCounts += tier1MigrationCount;
    tier1WriteCounts += tier1MigrationCount;
    tier3ReadCounts += tier3MigrationCount;
    tier3WriteCounts += tier3MigrationCount;
    tier2ReadCounts += tier2MigrationCount;
    tier2WriteCounts += tier2MigrationCount;

    tier1Latency = s.t1ReadLatency * (tier1ReadCounts + tier1WriteCounts * s.t1Alpha);
    tier2Latency = s.t2ReadLatency * (tier2ReadCounts + tier2WriteCounts * s.t2Alpha);
    tier3Latency = s.t3ReadLatency * (tier3ReadCounts + tier3WriteCounts * s.t3Alpha);

    accumulatedLatency = Math.max(tier1Latency, tier2Latency, tier3Latency);    // since they will be executed in parallel

    return accumulatedLatency;
}

function updateMigrationCountPlot(s) {
    let algorithmNames = [];
    for (let i = 0; i < s.algorithms.length; i++) {
        s.migrationCountsForPlot[i].push(calculateTotalMigrationCountFromTiers(i));
        algorithmNames.push(s.algorithms[i].name === "tRL" ? "ReStore" : (s.algorithms[i].name === "tTemp" ? "TEMP" : s.algorithms[i].name));
    }
    const xValues = Array.from({ length: s.p }, (_, i) => i * state.config.plotUpdateInterval);

    // console.log("Migration count values for plot:", s.migrationCountsForPlot);

    const traces = [
        {
            x: xValues,
            y: s.migrationCountsForPlot[0],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[0],
            line: { color: 'forestgreen' }
        },
        {
            x: xValues,
            y: s.migrationCountsForPlot[1],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[1],
            line: { color: 'cornflowerblue' }
        },
        {
            x: xValues,
            y: s.migrationCountsForPlot[2],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[2],
            line: { color: 'coral' }
        },
        {
            x: xValues,
            y: s.migrationCountsForPlot[3],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[3],
            line: { color: 'black' }
        }
    ];

    const layout = {
        font: {
            family: 'Linux Libertine, serif',
            size: 17,
            color: '#111',
            weight: 400
        },
        margin: { t: 20, b: 40, l: 50, r: 10 },
        xaxis: { title: 'Operation steps' },
        yaxis: { title: '# Total Migrations' },
        height: 350,
        showlegend: false
    };

    const plotDiv = document.getElementById('migration_count-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, traces, layout);
    } else {
        Plotly.newPlot('migration_count-graph', traces, layout);
    }
}

function updateIndivMigrationCountPlot(s) {
    let algorithmNames = [];
    for (let i = 0; i < s.algorithms.length; i++) {
        s.t2t1MigrationCountsForPlot[i].push(s.tier2_1Migration[i]);
        s.t2t3MigrationCountsForPlot[i].push(s.tier2_3Migration[i]);
        algorithmNames.push((s.algorithms[i].name === "tRL" ? "ReStore" : (s.algorithms[i].name === "tTemp" ? "TEMP" : s.algorithms[i].name)) + " T1&#8596;T2");
        algorithmNames.push((s.algorithms[i].name === "tRL" ? "ReStore" : (s.algorithms[i].name === "tTemp" ? "TEMP" : s.algorithms[i].name)) + " T2&#8596;T3");
    }
    const xValues = Array.from({ length: s.p }, (_, i) => i * state.config.plotUpdateInterval);

    // console.log("Migration count values for plot:", s.migrationCountsForPlot);

    const traces = [
        {
            x: xValues,
            y: s.t2t1MigrationCountsForPlot[0],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[0],
            line: { color: '#2e8b57', dash: 'dot' }       // dark green
        },
        {
            x: xValues,
            y: s.t2t3MigrationCountsForPlot[0],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[1],
            line: { color: '#66bb66', dash: 'dash' },      // medium green
            marker: { symbol: 'x' }
        },
        {
            x: xValues,
            y: s.t2t1MigrationCountsForPlot[1],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[2],
            line: { color: '#2255cc', dash: 'dot' }        // dark blue
        },
        {
            x: xValues,
            y: s.t2t3MigrationCountsForPlot[1],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[3],
            line: { color: '#6699ee', dash: 'dash' },      // medium blue
            marker: { symbol: 'x' }
        },
        {
            x: xValues,
            y: s.t2t1MigrationCountsForPlot[2],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[4],
            line: { color: '#bb1122', dash: 'dot' }        // dark red
        },
        {
            x: xValues,
            y: s.t2t3MigrationCountsForPlot[2],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[5],
            line: { color: '#ee6655', dash: 'dash' },      // medium red
            marker: { symbol: 'x' }
        },
        {
            x: xValues,
            y: s.t2t1MigrationCountsForPlot[3],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[6],
            line: { color: '#333333', dash: 'dot' }        // dark grey
        },
        {
            x: xValues,
            y: s.t2t3MigrationCountsForPlot[3],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[7],
            line: { color: '#777777', dash: 'dash' },      // medium grey
            marker: { symbol: 'x' }
        }
    ];

    const layout = {
        font: {
            family: 'Linux Libertine, serif',
            size: 17,
            color: '#111',
            weight: 400
        },
        margin: { t: 20, b: 40, l: 50, r: 10 },
        xaxis: { title: 'Operation steps' },
        // yaxis: { title: '# Migrations' },
        height: 350,
        showlegend: true
    };

    const plotDiv = document.getElementById('indiv_migration_count-graph');
    if (plotDiv) {
        Plotly.react(plotDiv, traces, layout);
    } else {
        Plotly.newPlot('indiv_migration_count-graph', traces, layout);
    }
}

function updateLatencyPlot(s) {
    let algorithmNames = [];

    for (let i = 0; i < s.algorithms.length; i++) {
        s.latencyValuesForPlot[i].push(calculateLatencyFromTiers(i) / 1000);
        algorithmNames.push(s.algorithms[i].name === "tRL" ? "ReStore" : (s.algorithms[i].name === "tTemp" ? "TEMP" : s.algorithms[i].name));
    }

    // console.log("Latency values for plot:", latencyValues);

    // TODO: replace with history if needed
    const xValues = Array.from({ length: s.p }, (_, i) => i * state.config.plotUpdateInterval);

    const traces = [
        {
            x: xValues,
            y: s.latencyValuesForPlot[0],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[0],
            line: { color: 'forestgreen' }
        },
        {
            x: xValues,
            y: s.latencyValuesForPlot[1],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[1],
            line: { color: 'cornflowerblue' }
        },
        {
            x: xValues,
            y: s.latencyValuesForPlot[2],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[2],
            line: { color: 'coral' }
        },
        {
            x: xValues,
            y: s.latencyValuesForPlot[3],
            type: 'scatter',
            mode: 'lines+markers',
            name: algorithmNames[3],
            line: { color: 'black' }
        }
    ];

    const layout = {
        font: {
            family: 'Linux Libertine, serif',
            size: 17,
            color: '#111',
            weight: 400
        },
        margin: { t: 20, b: 40, l: 50, r: 10 },
        xaxis: { title: 'Operation steps' },
        yaxis: { title: 'Latency (ms)' },
        height: 350,
        showlegend: true
    };

    const plotDiv = document.getElementById('latency-graph');

    if (plotDiv) {
        Plotly.react(plotDiv, traces, layout);
    } else {
        Plotly.newPlot('latency-graph', traces, layout);
    }
}

function initializeWithRandomPages(s) {
    // Reset tiers
    s.tier1CurPages = [[], [], [], [], [], [], []];
    s.tier2CurPages = [[], [], [], [], [], [], []];
    s.tier3CurPages = [[], [], [], [], [], [], []];

    initTiers();
    // JS deep copy
    s.tier1CurPages = tier1.map(p => ({ ...p }));
    s.tier2CurPages = tier2.map(p => ({ ...p }));
    s.tier3CurPages = tier3.map(p => ({ ...p }));

    // Reset stats
    s.tier1read = [0, 0, 0, 0, 0, 0, 0];
    s.tier1write = [0, 0, 0, 0, 0, 0, 0];
    s.tier2read = [0, 0, 0, 0, 0, 0, 0];
    s.tier2write = [0, 0, 0, 0, 0, 0, 0];
    s.tier3read = [0, 0, 0, 0, 0, 0, 0];
    s.tier3write = [0, 0, 0, 0, 0, 0, 0];
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
    s.delay = state.config.finisher_step_delay;
    // console.log("🏁 Finishing simulation from scratch...");

    // s.playing = false;
    // s.pauser = false;
    // s.reloader = 0;

    // // Reset simulation state (just like progress-bar logic)
    // resetStats();

    // s.buffer = [];
    // s.dirty = [];
    // s.coldflag = [];
    // s.uses = {};

    // s.ACEbuffer = [];
    // s.ACEdirty = [];
    // s.ACEcoldflag = [];
    // s.ACEuses = {};

    // s.bufferHit = 0;
    // s.bufferMiss = 0;
    // s.readIO = 0;
    // s.writeIO = 0;
    // s.pagesWritten = 0;
    // s.pagesRead = 0;
    // s.pagesEvicted = 0;
    // s.pagesPrefetched = 0;

    // s.ACEbufferHit = 0;
    // s.ACEbufferMiss = 0;
    // s.ACEreadIO = 0;
    // s.ACEwriteIO = 0;
    // s.ACEpagesWritten = 0;
    // s.ACEpagesRead = 0;
    // s.ACEpagesEvicted = 0;
    // s.ACEpagesPrefetched = 0;

    // s.aceWriteBatches = [];
    // s.traditionalWriteBatches = [];
    // s.aceLatency = [];
    // s.traditionalLatency = [];

    // let samplingRate = 10;

    // // Re-parse the values
    // let baseReadLatency = parseFloat($('#lat').val()) || 1;
    // let asymmetry = parseFloat($('#asym').val()) || 1;

    // for (let i = 0; i < s.workload.length; i++) {
    //     s.baseAlgorithm(i, s);
    //     s.ACEAlgorithm(i, s);

    //     s.tradLatency = calculateLatency(s.writeIO, s.readIO, false, baseReadLatency, asymmetry) / 1000;
    //     s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true, baseReadLatency, asymmetry) / 1000;

    //     if (i % samplingRate === 0 || i === s.workload.length - 1) {
    //         s.aceWriteBatches.push(s.ACEwriteIO);
    //         s.traditionalWriteBatches.push(s.writeIO);
    //         s.aceLatency.push(s.aceLatencyval);
    //         s.traditionalLatency.push(s.tradLatency);
    //     }
    // }

    // // Final latency calculation (in case last loop iteration didn’t run sampling block)
    // s.tradLatency = calculateLatency(s.writeIO, s.readIO, false, baseReadLatency, asymmetry) / 1000;
    // s.aceLatencyval = calculateLatency(s.ACEwriteIO, s.ACEreadIO, true, baseReadLatency, asymmetry) / 1000;

    // s.p = s.workload.length - 1;

    // baseDisplay();
    // ACEDisplay();
    // updateProgress(s.p, s.workload.length);
    // updateMigrationCountPlot(s);
    // updateIndivMigrationCountPlot(s);
    // updateLatencyPlot(s);
    // $("#play-button").prop('disabled', false);
}

function algoDisplay(algoIndex, s) {
    // console.log("Updating algoDisplay for algorithm:", algoIndex);

    let perAlgoDelay = s.delay * 0.9; // Allocate 90% of the delay to cell highlighting and tier updates
    let perActionDelay = perAlgoDelay;
    let cell1InHTML = null;
    let cell2InHTML = null;
    let cell1ClassCSS = null;
    let cell2ClassCSS = null;
    let cellDelay = perActionDelay / s.simActions[algoIndex].length; // Default to equal split if there are actions
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
        highlightCells([cell1InHTML], cell1ClassCSS, cellDelay * 0.9);
        if (s.simActions[algoIndex].length > 1) {
            action = s.simActions[algoIndex][1];
            if (action.op === "M") {
                cell1ClassCSS = "highlight-from";
                cell2ClassCSS = "highlight-to";
                cell1InHTML = `tier${action.tierId}alg${algoIndex}-${action.cellId[0]}`;
                cell2InHTML = `tier${action.tierId - 1}alg${algoIndex}-${action.cellId[1]}`;
            }
            setTimeout(function () {
                highlightCells([cell1InHTML], cell1ClassCSS, cellDelay / 2);
                highlightCells([cell2InHTML], cell2ClassCSS, cellDelay / 2);
                setTimeout(function () {
                    renderUpdatedTiers(action.tierId, action.tierId - 1, action.cellId[0], action.cellId[1], algoIndex);
                    highlightCells([cell1InHTML], cell2ClassCSS, cellDelay / 2);
                    highlightCells([cell2InHTML], cell1ClassCSS, cellDelay / 2);
                }, cellDelay * 0.4)
            }, cellDelay * 0.4)
        }
        setTimeout(function () {
            renderTemperature(s.tier1CurPages[algoIndex], s.tier2CurPages[algoIndex], s.tier3CurPages[algoIndex], s.algorithms, algoIndex, s.p);
        }, cellDelay * 0.9);
    }

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
    $(`#alg${algoIndex}-pages-migrated-t2t3`).text(s.tier2_3Migration[algoIndex]);
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
            s.simActions[0].push({ op: 'W', tierId: 1, cellId: foundPageT1Index });
        } else if (type === "R") {
            s.tier1read[0]++;
            //highlightCells([`tier1alg0-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[0].push({ op: 'R', tierId: 1, cellId: foundPageT1Index });
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
            s.simActions[0].push({ op: 'W', tierId: 2, cellId: foundPageT2Index });
        } else if (type === "R") {
            s.tier2read[0]++;
            //highlightCells([`tier2alg0-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[0].push({ op: 'R', tierId: 2, cellId: foundPageT2Index });
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

function decayTemperatures(tier, currentRound, dropThreshold = Math.round(totalPages / 10), dropScale = 0.02) {
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

function updateTemperature(page, currentRound, windowSize = totalPages, tempAlpha = 0.05) {
    // as per paper implementation, tempAlpha (temp_incr_alpha) is 0.05
    // in the paper implementation, buffersize = 1e4, #ops = 1M probably, so 1/100
    // actually no, it is the number of pages

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

function tTemp(s) {
    // console.log("Running tTemp");
    const algoIndex = 2;
    const currentRound = s.p;
    const minAccessToT1 = 3;
    const minAccessToT2 = 1;
    const tempAlpha = 0.05; // as per paper implementation
    const minT1MigrationTemp = 1 - 0.5 / Math.exp(tempAlpha * minAccessToT1);
    const minT2MigrationTemp = 1 - 0.5 / Math.exp(tempAlpha * minAccessToT2);

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

        const timeWindow = totalPages;
        // updateTemperature(foundPageT1, currentRound, s.workload.length/100);
        updateTemperature(foundPageT1, currentRound, timeWindow);

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
        decayTemperatures(s.tier1CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[2], currentRound, 1, 0.002);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[2].findIndex(p => p.id === page);
    // console.log(s.tier2CurPages[2], foundPageT2Index);

    if (foundPageT2Index !== -1) {

        const foundPageT2 = s.tier2CurPages[2][foundPageT2Index];

        const timeWindow = totalPages;
        updateTemperature(foundPageT2, currentRound, timeWindow);

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
        decayTemperatures(s.tier1CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[2], currentRound, 1, 0.002);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[2].findIndex(p => p.id === page);
    // console.log(s.tier3CurPages[2], foundPageT3Index);

    if (foundPageT3Index !== -1) {

        const foundPageT3 = s.tier3CurPages[2][foundPageT3Index];

        const timeWindow = totalPages;
        updateTemperature(foundPageT3, currentRound, timeWindow);

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
        decayTemperatures(s.tier1CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[2], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[2], currentRound, 1, 0.002);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        // decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 10, 0.02);
        return;
    }
    // coming here means did not find page in any tier, which is impossible if implementation is correct
}

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

    learn(s_prev, s_curr, action, cost_prev, cost_curr, reward, phi_prev, gamma, tau_n = 1) {
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

// ---- FIX: MATCH C++ ----
function cal_s2(queue, threads, read, asym) {
    // return queue/2000;
    const denominator = 2000;
    if (threads <= 0) return 0;

    // C++ logic approximation:
    // s2 = read_time * ceil(queue / threads)
    // const batches = Math.ceil(queue / threads);

    // return batches * read * (1 + asym);

    // double s2 = queued_tasks * (read_time_tier + asym_tier * read_time_tier) / 2000 / k_thrd;
    s2 = queue * read * (1 + asym) / denominator / threads;
    return s2;
}

// ---- INIT RL ----
function initRL(s, total_num_pages) {

    s.lastStateT1 = null;
    s.lastStateT2 = null;
    s.lastStateT3 = null;

    s.lastCostT1 = 0;
    s.lastCostT2 = 0;
    s.lastCostT3 = 0;

    s.sumPhiT1 = [0.5, 0.5, 0.5, 0.5];
    s.sumPhiT2 = [0.5, 0.5, 0.5, 0.5];
    s.sumPhiT3 = [0.5, 0.5, 0.5, 0.5];

    const p_init = [0, 0, 0, 0]; // all 1
    const beta = 0.1;
    const lam = 0.8; //1.5;// 0.8;

    // ---- NEW: scaling from C++ ----
    const exponent = Math.floor(Math.log10(1.0 / total_num_pages));
    const a_scale = Math.pow(10, exponent);

    // ---- NEW: Tier 1 ----
    const init_rng_s2_t1 =
        cal_s2(2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal) -
        cal_s2(0, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);
    console.warn("init_rng_s2_t1", init_rng_s2_t1);
    console.warn(cal_s2(2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal), cal_s2(0, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal));

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

    // ---- NEW: Tier 2 ----
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

    // ---- NEW: Tier 3 ----
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

    // ---- NEW: correct scaling factor ----
    const inv_scale = 1 / a_scale;

    console.log("DEBUG initRL: p_init", p_init, "beta ", beta, "lambda ", lam, "inv_scale ", inv_scale);
    console.log("a_i_1", a_i_1, "b_i_1", b_i_1, "a_i_2", a_i_2, "b_i_2", b_i_2, "a_i_3", a_i_3, "b_i_3", b_i_3);
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
    // console.log("Checking sizes: ", Tier1.size, Tier2.size, Tier3.size);
    const sumExpT1 = Math.exp((1 + avg_temp_T1) / 2) * Tier1.size;
    const sumExpT2 = Math.exp((1 + avg_temp_T2) / 2) * Tier2.size;
    const sumExpT3 = Math.exp((1 + avg_temp_T3) / 2) * Tier3.size;
    const coeff = -1;

    let reward =
        0.5 * (read_time_tier1 + wr_ww * read_time_tier1 * asym_tier1) * sumExpT1 +
        0.5 * (read_time_tier2 + wr_ww * read_time_tier2 * asym_tier2) * sumExpT2 +
        0.5 * (read_time_tier3 + wr_ww * read_time_tier3 * asym_tier3) * sumExpT3;

    reward = coeff * reward / total_num_pages;

    return reward;
}

// 3. STATE FUNCTION (MATCH C++)
function getState(s, tierId, algoIndex = 3) {
    const avgTemp =
        tierId === 1 ? getAvgTemp(s.tier1CurPages[algoIndex]) :
            tierId === 2 ? getAvgTemp(s.tier2CurPages[algoIndex]) :
                getAvgTemp(s.tier3CurPages[algoIndex]);

    const queue =
        tierId === 1 ? s.approxT1QueueSizeEstimate :
            tierId === 2 ? s.approxT2QueueSizeEstimate :
                s.approxT3QueueSizeEstimate;

    const threads =
        tierId === 1 ? s.t1Concurrency :
            tierId === 2 ? s.t2Concurrency :
                s.t3Concurrency;

    const read =
        tierId === 1 ? s.t1ReadLatency :
            tierId === 2 ? s.t2ReadLatency :
                s.t3ReadLatency;

    const asym =
        tierId === 1 ? s.t1AlphaVal : // keep simple (or match your config)
            tierId === 2 ? s.t2AlphaVal :
                s.t3AlphaVal;

    const s1 = avgTemp;
    const s2 = cal_s2(queue, threads, read, asym);

    return [s1, s2];
}

/*
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
    s.lastStateT1 = getState(s,1,algoIndex);
    s.lastStateT2 = getState(s,2,algoIndex);
    s.lastStateT3 = getState(s,3,algoIndex);
}
*/

function rlLearn(s, algoIndex) {
    // Check if RL_start_update should be triggered (first non-Tier1 hit)
    const foundInT1 = s.tier1CurPages[algoIndex].findIndex(p => p.id === s.workload[s.p]?.[1]) !== -1;
    if (!s.rlStartUpdate && !foundInT1) {
        s.rlStartUpdate = true;
        s.rlStartUpdateI = s.p;
    }

    // Update a_i, b_i dynamically using sliding windows (match C++)
    updateAB(s, algoIndex);

    // Learn in every round
    if (!s.rlStartUpdate) return;
    // const roundsSinceStart = s.p - s.rlStartUpdateI;
    // if (roundsSinceStart >= s.rlInitRounds && roundsSinceStart % s.rlUpdateFreqs !== 0) return;

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
        // s.workload.length
        totalPages
    );

    if (s.lastStateT1) {
        const state1_next = getState(s, 1, algoIndex);
        const state2_next = getState(s, 2, algoIndex);
        const state3_next = getState(s, 3, algoIndex);

        const [cost1_next, phi1_next] = s.rlAgent1.cost_phi(state1_next);
        const [cost2_next, phi2_next] = s.rlAgent2.cost_phi(state2_next);
        const [cost3_next, phi3_next] = s.rlAgent3.cost_phi(state3_next);

        // Pass lastPhi (actual phi from before-state), NOT sumPhi
        s.rlAgent1.learn(s.lastStateT1, state1_next, [], s.lastCostT1, cost1_next, reward, s.lastPhiT1, 1);
        s.rlAgent2.learn(s.lastStateT2, state2_next, [], s.lastCostT2, cost2_next, reward, s.lastPhiT2, 1);
        s.rlAgent3.learn(s.lastStateT3, state3_next, [], s.lastCostT3, cost3_next, reward, s.lastPhiT3, 1);
    }
    // store last
    s.lastStateT1 = getState(s, 1, algoIndex);
    s.lastStateT2 = getState(s, 2, algoIndex);
    s.lastStateT3 = getState(s, 3, algoIndex);
}

// revisit this function

function computeAB(s1List, s2List, tierType, concurrency, readLat, alpha, a_scale) {
    const min_s1 = Math.min(...s1List);
    const max_s1 = Math.max(...s1List);
    const min_s2 = Math.min(...s2List);
    const max_s2 = Math.max(...s2List);

    const s1_last = s1List.length > 1 ? s1List[s1List.length - 2] : s1List[s1List.length - 1];
    const s2_last = s2List.length > 1 ? s2List[s2List.length - 2] : s2List[s2List.length - 1];

    let average_s1;

    average_s1 = (max_s1 + min_s1) / 2; // default to match C++ Tier1
    // if (tierType === 1) {
    //     // Match C++ Tier1
    //     average_s1 = (max_s1 + s1_last) / 2;
    // } else if (tierType === 2) {
    //     average_s1 = (max_s1 + min_s1) / 2;
    // } else {
    //     // Match C++ Tier2 & Tier3
    //     average_s1 = (max_s1 + min_s1) / 2.2;
    //     if (tierType === 3) {
    //         average_s1 = Math.max(average_s1, 1e-4); // Revisit
    //     }
    // }

    let range_s1 = max_s1 - min_s1;
    range_s1 = Math.max(range_s1, 0.1 / totalPages);

    let avg_s2 = (max_s2 + min_s2) / 2;
    let rng_s2 = max_s2 - min_s2;
    rng_s2 = Math.max(rng_s2, cal_s2(2, concurrency, readLat, alpha));

    let b_i = [5 / range_s1, 5 / rng_s2];
    if (tierType === 3) {
        //avg_s2 = s2_last;
        b_i = [5 / range_s1, 5 / rng_s2];
    }
    const a_i = [
        Math.exp(a_scale * average_s1 * 5 / range_s1),
        Math.exp(a_scale * avg_s2 * 5 / rng_s2)
    ];

    return { a_i, b_i };
}

function updateAB(s, algoIndex) {
    const avgT1 = getAvgTemp(s.tier1CurPages[algoIndex]);
    const avgT2 = getAvgTemp(s.tier2CurPages[algoIndex]);
    const avgT3 = getAvgTemp(s.tier3CurPages[algoIndex]);

    // Push current s1 values
    s.s1T1List.push(avgT1);
    s.s1T2List.push(avgT2);
    s.s1T3List.push(avgT3);

    // Push current s2 values
    const s2_t1 = cal_s2(s.approxT1QueueSizeEstimate, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);
    const s2_t2 = cal_s2(s.approxT2QueueSizeEstimate, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);
    const s2_t3 = cal_s2(s.approxT3QueueSizeEstimate, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);
    s.s2T1List.push(s2_t1);
    s.s2T2List.push(s2_t2);
    s.s2T3List.push(s2_t3);

    // Maintain sliding window size
    const maxLen = s.numElementsToConsider;
    while (s.s1T1List.length > maxLen) s.s1T1List.shift();
    while (s.s1T2List.length > maxLen) s.s1T2List.shift();
    while (s.s1T3List.length > maxLen) s.s1T3List.shift();
    while (s.s2T1List.length > maxLen) s.s2T1List.shift();
    while (s.s2T2List.length > maxLen) s.s2T2List.shift();
    while (s.s2T3List.length > maxLen) s.s2T3List.shift();

    if (!s.rlAgent1) return;

    const exponent = Math.floor(Math.log10(1.0 / totalPages));
    const a_scale = Math.pow(10, exponent);

    const ab1 = computeAB(s.s1T1List, s.s2T1List, 1, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal, a_scale);
    const ab2 = computeAB(s.s1T2List, s.s2T2List, 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal, a_scale);
    const ab3 = computeAB(s.s1T3List, s.s2T3List, 3, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal, a_scale);

    s.rlAgent1.a_i = ab1.a_i; s.rlAgent1.b_i = ab1.b_i;
    s.rlAgent2.a_i = ab2.a_i; s.rlAgent2.b_i = ab2.b_i;
    s.rlAgent3.a_i = ab3.a_i; s.rlAgent3.b_i = ab3.b_i;
}

// revisit
function updateApproxQueueSizes(s, algoIndex, totalEnqueuedReqCount) {
    s.approxT1QueueSizeEstimate = s.tier1Queue[algoIndex].length;
    s.approxT2QueueSizeEstimate = s.tier2Queue[algoIndex].length;
    s.approxT3QueueSizeEstimate = s.tier3Queue[algoIndex].length;

    // console.log(s.approxT1QueueSizeEstimate, s.approxT2QueueSizeEstimate, s.approxT3QueueSizeEstimate);

    const curTimeInMicrosecondEstimate = totalEnqueuedReqCount * state.config.perReqEnqueueTime;

    // console.log(s.approxT1QueueSizeEstimate, s.approxT2QueueSizeEstimate, s.approxT3QueueSizeEstimate);
    // console.log(curTimeInMicrosecondEstimate);

    timeTier1 = timeTier2 = timeTier3 = 0;
    // the following can be made even better if we consider how concurrent requests are processed in each tier
    // for example, RRWR with concurrency 4 may need time of 1 write
    // but let's keep it simple for now, assume the threads keep running continuously and process requests one by one
    // and we just accumulate the time taken for each request in the queue
    // until we reach the current time estimate, then stop and use that to update the queue size estimates
    for (let i = 0; i < s.tier1Queue[algoIndex].length; i++) {
        operation = s.tier1Queue[algoIndex][i];
        if (operation === "W") {
            timeTier1 += s.t1ReadLatency * s.t1AlphaVal;
        }
        else {
            timeTier1 += s.t1ReadLatency;
        }
        s.approxT1QueueSizeEstimate--;
        // console.log(timeTier1 / s.t1Concurrency, curTimeInMicrosecondEstimate);
        if (timeTier1 / s.t1Concurrency > curTimeInMicrosecondEstimate) break;
    }
    // the following uses the concept of batches, but maybe this is not how it is done in CPP, so commented out
    // for (let i = 0; i < s.tier1Queue[algoIndex].length; ) {
    //     let batchLatency = s.t1ReadLatency;
    //     for (let threadNo = 0; threadNo < s.t1Concurrency && i < s.tier1Queue[algoIndex].length; threadNo++, i++) {
    //         operation = s.tier1Queue[algoIndex][i];
    //         if (operation === "W") {
    //             batchLatency = s.t1ReadLatency * s.t1AlphaVal;
    //         }
    //         s.approxT1QueueSizeEstimate--;
    //     }
    //     timeTier1 += batchLatency;
    //     if (timeTier1 > curTimeInMicrosecondEstimate) break;
    // }

    // console.log(`Approx queue size after T1 processing: ${s.approxT1QueueSizeEstimate}, T2: ${s.approxT2QueueSizeEstimate}, T3: ${s.approxT3QueueSizeEstimate}`);

    for (let i = 0; i < s.tier2Queue[algoIndex].length; i++) {
        operation = s.tier2Queue[algoIndex][i];
        if (operation === "W") {
            timeTier2 += s.t2ReadLatency * s.t2AlphaVal;
        }
        else {
            timeTier2 += s.t2ReadLatency;
        }
        s.approxT2QueueSizeEstimate--;
        if (timeTier2 / s.t2Concurrency > curTimeInMicrosecondEstimate) break;
    }

    // console.log(`Approx queue size after T2 processing: ${s.approxT2QueueSizeEstimate}, T1: ${s.approxT1QueueSizeEstimate}, T3: ${s.approxT3QueueSizeEstimate}`);

    for (let i = 0; i < s.tier3Queue[algoIndex].length; i++) {
        operation = s.tier3Queue[algoIndex][i];
        if (operation === "W") {
            timeTier3 += s.t3ReadLatency * s.t3AlphaVal;
        }
        else {
            timeTier3 += s.t3ReadLatency;
        }
        s.approxT3QueueSizeEstimate--;
        if (timeTier3 / s.t3Concurrency > curTimeInMicrosecondEstimate) break;
    }

    // console.log(`Approx queue size after T3 processing: ${s.approxT3QueueSizeEstimate}, T1: ${s.approxT1QueueSizeEstimate}, T2: ${s.approxT2QueueSizeEstimate}`);

    // console.log(`Total enqueued req count: ${totalEnqueuedReqCount}`);
    // console.log(`Time of completion: ${timeOfCompletion}, TimeTier1: ${timeTier1}, TimeTier2: ${timeTier2}, TimeTier3: ${timeTier3}`);
    // console.log(`Approx queue sizes - T1: ${s.approxT1QueueSizeEstimate}, T2: ${s.approxT2QueueSizeEstimate}, T3: ${s.approxT3QueueSizeEstimate}`);
    // console.log(s.approxT1QueueSizeEstimate, s.approxT2QueueSizeEstimate, s.approxT3QueueSizeEstimate);
    if (s.approxT1QueueSizeEstimate < 0) {
        // console.warn("Negative queue size estimate for T1, resetting to 0");
        s.approxT1QueueSizeEstimate = 0;
    }
    if (s.approxT2QueueSizeEstimate < 0) {
        // console.warn("Negative queue size estimate for T2, resetting to 0");
        s.approxT2QueueSizeEstimate = 0;
    }
    if (s.approxT3QueueSizeEstimate < 0) {
        // console.warn("Negative queue size estimate for T3, resetting to 0");
        s.approxT3QueueSizeEstimate = 0;
    }
    // console.log(s.approxT1QueueSizeEstimate, s.approxT2QueueSizeEstimate, s.approxT3QueueSizeEstimate);
}

function tRL(s) {
    // console.log("Running ReStore");
    const algoIndex = 3;
    const currentRound = s.p;
    const minAccessToT1 = 3;
    const minAccessToT2 = 1;
    const tempAlpha = 0.05; // as per paper implementation
    const minT1MigrationTemp = 1 - 0.5 / Math.exp(tempAlpha * minAccessToT1);
    const minT2MigrationTemp = 1 - 0.5 / Math.exp(tempAlpha * minAccessToT2);

    if (s.rlAgent1 === null) {
        // console.log("initRL inputs:", s.t1ReadLatency, s.t2ReadLatency, s.t3ReadLatency,
            // s.t1Concurrency, s.t2Concurrency, s.t3Concurrency,
            // s.t1AlphaVal, s.t2AlphaVal, s.t3AlphaVal);
        initRL(s, totalPages);
        // console.log("a_i_1:", s.rlAgent1.a_i, "b_i_1:", s.rlAgent1.b_i);
        // console.log("a_i_2:", s.rlAgent2.a_i, "b_i_2:", s.rlAgent2.b_i);
    }

    const entry = s.workload[currentRound];
    if (!entry) return;

    const type = entry[0];
    const page = entry[1];

    // Check if the page is not found in Tier1 and updates have not started yet
    if (!s.rlStartUpdate && s.tier1CurPages[algoIndex].findIndex(p => p.id === page) === -1) {
        s.rlStartUpdate = true;  // Enable updates
        s.rlStartUpdate_i = currentRound;    // Record the iteration where update starts
        console.log(`RL updates enabled starting from round ${currentRound} (page ${page})`);
    }

    s1_t1_be = getAvgTemp(s.tier1CurPages[algoIndex]);
    s2_t1_be = cal_s2(s.approxT1QueueSizeEstimate, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);
    state_t1_be = [s1_t1_be, s2_t1_be];
    // cost is a number, phi is the weights
    // cost = sum (phi_i * p_i)
    [cost_tier1_be, phi_t1] = s.rlAgent1.cost_phi(state_t1_be);

    s.lastPhiT1 = phi_t1; // Store actual phi for eligibility trace
    for (let i = 0; i < s.sumPhiT1.length; i++) {
        s.sumPhiT1[i] += phi_t1[i];
    }

    s1_t2_be = getAvgTemp(s.tier2CurPages[algoIndex]);
    s2_t2_be = cal_s2(s.approxT2QueueSizeEstimate, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);
    state_t2_be = [s1_t2_be, s2_t2_be];
    [cost_tier2_be, phi_t2] = s.rlAgent2.cost_phi(state_t2_be);

    s.lastPhiT2 = phi_t2; // Store actual phi for eligibility trace
    for (let i = 0; i < s.sumPhiT2.length; i++) {
        s.sumPhiT2[i] += phi_t2[i];
    }

    s1_t3_be = getAvgTemp(s.tier3CurPages[algoIndex]);
    s2_t3_be = cal_s2(s.approxT3QueueSizeEstimate, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);
    state_t3_be = [s1_t3_be, s2_t3_be];
    [cost_tier3_be, phi_t3] = s.rlAgent3.cost_phi(state_t3_be);

    s.lastPhiT3 = phi_t3; // Store actual phi for eligibility trace
    for (let i = 0; i < s.sumPhiT3.length; i++) {
        s.sumPhiT3[i] += phi_t3[i];
    }

    if (s.rlStartUpdate && (currentRound - s.rlStartUpdate_i < s.rlInitRounds || (currentRound - s.rlStartUpdate_i) % s.rlUpdateFreqs === 0)) {
        s.lastStateT1 = state_t1_be;
        s.lastStateT2 = state_t2_be;
        s.lastStateT3 = state_t3_be;
        s.lastCostT1 = cost_tier1_be;
        s.lastCostT2 = cost_tier2_be;
        s.lastCostT3 = cost_tier3_be;
    }

    // ----------------------------------
    // CASE 1: Page already in Tier 1
    // ----------------------------------
    const foundPageT1Index = s.tier1CurPages[algoIndex].findIndex(p => p.id === page);
    // console.log(s.tier1CurPages[algoIndex], foundPageT1Index);

    if (foundPageT1Index !== -1) {
        const foundPageT1 = s.tier1CurPages[algoIndex][foundPageT1Index];
        s.tier1Queue[algoIndex].push(type);

        const timeWindow = totalPages;
        updateTemperature(foundPageT1, currentRound, timeWindow);

        if (type === "W") {
            s.tier1write[algoIndex]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-write", s.delay);
            s.simActions[algoIndex].push({ op: 'W', tierId: 1, cellId: foundPageT1Index });
        } else {
            s.tier1read[algoIndex]++;
            // highlightCells([`tier1alg2-${foundPageT1Index}`], "highlight-read", s.delay);
            s.simActions[algoIndex].push({ op: 'R', tierId: 1, cellId: foundPageT1Index });
        }

        updateApproxQueueSizes(s, algoIndex, currentRound);
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound, 1, 0.002);

        // learn
        rlLearn(s, algoIndex);
        return;
    }

    // ----------------------------------
    // CASE 2: Page in Tier 2
    // ----------------------------------
    const foundPageT2Index = s.tier2CurPages[algoIndex].findIndex(p => p.id === page);

    if (foundPageT2Index !== -1) {
        s.tier2Queue[algoIndex].push(type);
        const foundPageT2 = s.tier2CurPages[algoIndex][foundPageT2Index];

        const timeWindow = totalPages;
        updateTemperature(foundPageT2, currentRound, timeWindow);

        if (type === "W") {
            s.tier2write[algoIndex]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-write", s.delay);
            s.simActions[algoIndex].push({ op: 'W', tierId: 2, cellId: foundPageT2Index });
        } else {
            s.tier2read[algoIndex]++;
            // highlightCells([`tier2alg2-${foundPageT2Index}`], "highlight-read", s.delay);
            s.simActions[algoIndex].push({ op: 'R', tierId: 2, cellId: foundPageT2Index });
        }

        updateApproxQueueSizes(s, algoIndex, currentRound);

        const tempInfo = getTemperaturePage(s.tier1CurPages[algoIndex]);

        if (tempInfo !== null) {

            const tempT1Index = tempInfo.index;
            const tempT1page = tempInfo.page;
            const victimTemp = getAvgTemp(s.tier1CurPages[algoIndex]);

            // if (foundPageT2.temperature > Math.max(victimTemp, minT1MigrationTemp)) {
            //---- RL DECISION (Tier2 to Tier1) ----
            const state_t2_be = getState(s, 2, algoIndex);
            const state_t1_be = getState(s, 1, algoIndex);

            const [cost_t2_be, phi_t2] = s.rlAgent2.cost_phi(state_t2_be);
            const [cost_t1_be, phi_t1] = s.rlAgent1.cost_phi(state_t1_be);

            // simulate AFTER state (same as C++)
            // s1_t2_af, s1_t1_af are just average temperatures of tier2 and tier1 after the potential migration
            const s1_t2_af = (state_t2_be[0] * s.tier2CurPages[algoIndex].length - foundPageT2.temperature) /
                (s.tier2CurPages[algoIndex].length - 1);

            const s1_t1_af = (state_t1_be[0] * s.tier1CurPages[algoIndex].length + foundPageT2.temperature) /
                (s.tier1CurPages[algoIndex].length + 1);

            // s2_t2_af, s2_t1_af are the s2 values after the potential migration (due to queue size changes)
            const s2_t2_af = cal_s2(s.approxT2QueueSizeEstimate + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);
            const s2_t1_af = cal_s2(s.approxT1QueueSizeEstimate + 2, s.t1Concurrency, s.t1ReadLatency, s.t1AlphaVal);

            const [cost_t2_af, phi_t2_af] = s.rlAgent2.cost_phi([s1_t2_af, s2_t2_af]);
            const [cost_t1_af, phi_t1_af] = s.rlAgent1.cost_phi([s1_t1_af, s2_t1_af]);

            let cost_t1_be_g = cost_t1_be, cost_t2_be_g = cost_t2_be;
            let cost_t1_af_g = cost_t1_af, cost_t2_af_g = cost_t2_af;
            if (cost_t1_be_g === 0.0 || cost_t2_be_g === 0.0) {
                cost_t1_be_g = 0.0; cost_t1_af_g = 0.0;
                cost_t2_be_g = 0.0; cost_t2_af_g = 0.0;
            }

            // const left = cost_t1_be + cost_t2_af;
            // const right = cost_t1_af + cost_t2_be;
            const left = cost_t1_be + cost_t2_be;
            const right = cost_t1_af + cost_t2_af;

            // ---- STORE FOR LEARNING ----
            s.lastStateT1 = state_t1_be;
            s.lastStateT2 = state_t2_be;

            s.lastCostT1 = cost_t1_be;
            s.lastCostT2 = cost_t2_be;

            s.lastPhiT1 = phi_t1;
            s.lastPhiT2 = phi_t2;

            // s.sumPhiT1 = phi_t1;
            // s.sumPhiT2 = phi_t2
            s.sumPhiT1 = s.sumPhiT1.map((v, i) => v + phi_t1[i]);
            s.sumPhiT2 = s.sumPhiT2.map((v, i) => v + phi_t2[i]);

            const state_t3_snap = getState(s, 3, algoIndex);
            const [cost_t3_snap, phi_t3_snap] = s.rlAgent3.cost_phi(state_t3_snap);
            s.lastStateT3 = state_t3_snap;
            s.lastCostT3 = cost_t3_snap;
            // s.sumPhiT3 = phi_t3_snap;
            s.lastPhiT3 = phi_t3_snap;
            // Accumulate sumPhi for T3
            s.sumPhiT3 = s.sumPhiT3.map((v, i) => v + phi_t3_snap[i]);
            // RL Based Decision

            console.log(`Round: ${currentRound} - RL Decision for Tier 2 to Tier 1 migration:`);
            // print page temperature, s1 value and s2 value for before and after states of both tiers, and the left and right values for comparison
            console.log(`Page ${foundPageT2.id} temp: ${foundPageT2.temperature}, Page ${tempT1page.id} temp: ${tempT1page.temperature}`);
            console.log(`Approx queue size before - Tier 2: ${s.approxT2QueueSizeEstimate}, Tier 1: ${s.approxT1QueueSizeEstimate}`);
            console.log(`Approx queue size after - +2 to both previous queue sizes`);
            console.log(`Tier 2 before state - s1: ${state_t2_be[0]}, s2: ${state_t2_be[1]}, cost: ${cost_t2_be}, phi: ${phi_t2}`);
            console.log(`Tier 1 before state - s1: ${state_t1_be[0]}, s2: ${state_t1_be[1]}, cost: ${cost_t1_be}, phi: ${phi_t1}`);
            console.log(`Tier 2 after state - s1: ${s1_t2_af}, s2: ${s2_t2_af}, cost: ${cost_t2_af}, phi: ${phi_t2_af}`);
            console.log(`Tier 1 after state - s1: ${s1_t1_af}, s2: ${s2_t1_af}, cost: ${cost_t1_af}, phi: ${phi_t1_af}`);
            console.log(`Left (cost_t1_be + cost_t2_be): ${left}, Right (cost_t1_af + cost_t2_af): ${right}`);
            if (left <= right) {
                console.log(`Migrating page ${foundPageT2.id} from Tier 2 to Tier 1, swapping with page ${tempT1page.id} in Tier 1`);
                console.log(`Page ${foundPageT2.id} temp: ${foundPageT2.temperature}, Page ${tempT1page.id} temp: ${tempT1page.temperature}`);
            }
            else {
                console.log(`Not migrating page ${foundPageT2.id} from Tier 2 to Tier 1`);
                console.log(`Page ${foundPageT2.id} temp: ${foundPageT2.temperature}, Page ${tempT1page.id} temp: ${tempT1page.temperature}`);
            }

            // if (left <= right && foundPageT2.temperature > Math.max(victimTemp, minT1MigrationTemp)) {
            if (left <= right) {
                s.tier1Queue[algoIndex].push("R");
                s.tier2Queue[algoIndex].push("W");
                s.tier2Queue[algoIndex].push("R");
                s.tier1Queue[algoIndex].push("W");
                // const temp = s.tier1CurPages[algoIndex][tempT1Index];
                const temp = tempT1page;
                s.tier1CurPages[algoIndex][tempT1Index] = foundPageT2;
                s.tier2CurPages[algoIndex][foundPageT2Index] = temp;

                s.tier2_1Migration[algoIndex]++;
                s.simActions[algoIndex].push({ op: 'M', tierId: 2, cellId: [foundPageT2Index, tempT1Index] });

                s

            }
        }
        // temperature decay of all pages
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound, 1, 0.002);
        // ---- RL LEARNING ----
        rlLearn(s, algoIndex);
        return;
    }

    // ----------------------------------
    // CASE 3: Page in Tier 3
    // ----------------------------------
    const foundPageT3Index = s.tier3CurPages[algoIndex].findIndex(p => p.id === page);
    // console.log(s.tier3CurPages[algoIndex], foundPageT3Index);

    if (foundPageT3Index !== -1) {
        s.tier3Queue[algoIndex].push(type);
        const foundPageT3 = s.tier3CurPages[algoIndex][foundPageT3Index];

        const timeWindow = totalPages;
        updateTemperature(foundPageT3, currentRound, timeWindow);

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

        var timeOfCompletion = ((s.tier3write[algoIndex] + s.tier2_3Migration[algoIndex]) * s.t3Alpha +
            (s.tier3read[algoIndex] + s.tier2_3Migration[algoIndex])) * s.t3ReadLatency;
        var totalEnqueuedReqCount = Math.floor(timeOfCompletion / state.config.perReqEnqueueTime);
        // console.log(`Page ${page} in Tier 3, Time of completion: ${timeOfCompletion} microseconds, Total enqueued req count: ${totalEnqueuedReqCount}`);
        updateApproxQueueSizes(s, algoIndex, currentRound);

        const tempInfo = getTemperaturePage(s.tier2CurPages[algoIndex]);

        if (tempInfo !== null) {

            const tempT2Index = tempInfo.index;
            const tempT2page = tempInfo.page;

            const victimTemp = getAvgTemp(s.tier2CurPages[algoIndex]);

            // if (foundPageT3.temperature > Math.max(victimTemp, minT2MigrationTemp)) {
            // ---- RL DECISION (Tier3 to Tier2) ----
            const state_t3_be = getState(s, 3, algoIndex);
            const state_t2_be = getState(s, 2, algoIndex);

            const [cost_t3_be, phi_t3] = s.rlAgent3.cost_phi(state_t3_be);
            const [cost_t2_be, phi_t2] = s.rlAgent2.cost_phi(state_t2_be);

            const s1_t3_af = (state_t3_be[0] * s.tier3CurPages[algoIndex].length - foundPageT3.temperature) /
                (s.tier3CurPages[algoIndex].length - 1);

            const s1_t2_af = (state_t2_be[0] * s.tier2CurPages[algoIndex].length + foundPageT3.temperature) /
                (s.tier2CurPages[algoIndex].length + 1);

            const s2_t3_af = cal_s2(s.approxT3QueueSizeEstimate + 2, s.t3Concurrency, s.t3ReadLatency, s.t3AlphaVal);
            const s2_t2_af = cal_s2(s.approxT2QueueSizeEstimate + 2, s.t2Concurrency, s.t2ReadLatency, s.t2AlphaVal);

            const [cost_t3_af, phi_t3_af] = s.rlAgent3.cost_phi([s1_t3_af, s2_t3_af]);
            const [cost_t2_af, phi_t2_af] = s.rlAgent2.cost_phi([s1_t2_af, s2_t2_af]);

            let cost_t3_be_g = cost_t3_be, cost_t2_be_g2 = cost_t2_be;
            let cost_t3_af_g = cost_t3_af, cost_t2_af_g2 = cost_t2_af;
            if (cost_t2_be_g2 === 0.0 || cost_t3_be_g === 0.0) {
                cost_t2_be_g2 = 0.0; cost_t2_af_g2 = 0.0;
                cost_t3_be_g = 0.0; cost_t3_af_g = 0.0;
            }

            // const left = cost_t2_be + cost_t3_af;
            // const right = cost_t2_af + cost_t3_be;
            const left = cost_t2_be + cost_t3_be;
            const right = cost_t2_af + cost_t3_af;

            // ---- STORE FOR LEARNING ----
            s.lastStateT3 = state_t3_be;
            s.lastStateT2 = state_t2_be;

            s.lastCostT3 = cost_t3_be;
            s.lastCostT2 = cost_t2_be;

            // s.sumPhiT3 = phi_t3;
            // s.sumPhiT2 = phi_t2;
            s.lastPhiT3 = phi_t3;
            s.lastPhiT2 = phi_t2;

            // Accumulate sumPhi
            s.sumPhiT3 = s.sumPhiT3.map((v, i) => v + phi_t3[i]);
            s.sumPhiT2 = s.sumPhiT2.map((v, i) => v + phi_t2[i]);

            const state_t1_snap = getState(s, 1, algoIndex);
            const [cost_t1_snap, phi_t1_snap] = s.rlAgent1.cost_phi(state_t1_snap);
            s.lastStateT1 = state_t1_snap;
            s.lastCostT1 = cost_t1_snap;
            // s.sumPhiT1 = phi_t1_snap;
            // Store actual phi for T1
            s.lastPhiT1 = phi_t1_snap;
            // Accumulate sumPhi for T1
            s.sumPhiT1 = s.sumPhiT1.map((v, i) => v + phi_t1_snap[i]);
            // RL Based Decision
            console.log(`Round: ${currentRound} - RL Decision for Tier 3 to Tier 2 migration:`);
            // print page temperature, s1 value and s2 value for before and after states of both tiers, and the left and right values for comparison
            console.log(`Page ${foundPageT3.id} temp: ${foundPageT3.temperature}, Page ${tempT2page.id} temp: ${tempT2page.temperature}`);
            console.log(`Approx queue size before - Tier 3: ${s.approxT3QueueSizeEstimate}, Tier 2: ${s.approxT2QueueSizeEstimate}`);
            console.log(`Approx queue size after - +2 to both previous queue sizes`);
            console.log(`Tier 3 before state - s1: ${state_t3_be[0]}, s2: ${state_t3_be[1]}, cost: ${cost_t3_be}, phi: ${phi_t3}`);
            console.log(`Tier 2 before state - s1: ${state_t2_be[0]}, s2: ${state_t2_be[1]}, cost: ${cost_t2_be}, phi: ${phi_t2}`);
            console.log(`Tier 3 after state - s1: ${s1_t3_af}, s2: ${s2_t3_af}, cost: ${cost_t3_af}, phi: ${phi_t3_af}`);
            console.log(`Tier 2 after state - s1: ${s1_t2_af}, s2: ${s2_t2_af}, cost: ${cost_t2_af}, phi: ${phi_t2_af}`);
            console.log(`Left (cost_t2_be + cost_t3_be): ${left}, Right (cost_t2_af + cost_t3_af): ${right}`);
            // if (left <= right && foundPageT3.temperature > Math.max(victimTemp, minT2MigrationTemp)) {
            if (left <= right) {
                console.log(`Migrating page ${foundPageT3.id} from Tier 3 to Tier 2, swapping with page ${tempT2page.id} in Tier 2`);
                console.log(`Page ${foundPageT3.id} temp: ${foundPageT3.temperature}, Page ${tempT2page.id} temp: ${tempT2page.temperature}`);
            }
            else {
                console.log(`Not migrating page ${foundPageT3.id} from Tier 3 to Tier 2`);
                console.log(`Page ${foundPageT3.id} temp: ${foundPageT3.temperature}, Page ${tempT2page.id} temp: ${tempT2page.temperature}`);
            }
            if (left <= right) {
                s.tier2Queue[algoIndex].push("R");
                s.tier3Queue[algoIndex].push("W");
                s.tier3Queue[algoIndex].push("R");
                s.tier2Queue[algoIndex].push("W");
                // const temp = s.tier2CurPages[algoIndex][tempT2Index];
                const temp = tempT2page;
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
        decayTemperatures(s.tier1CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier2CurPages[algoIndex], currentRound, 1, 0.002);
        decayTemperatures(s.tier3CurPages[algoIndex], currentRound, 1, 0.002);

        // ---- RL LEARNING ----
        rlLearn(s, algoIndex);
        return;
    }
    // coming here means did not find page in any tier, which is impossible if implementation is correct
}

/*

Say, we are at round 100
Maybe 50 in tier 1
30 in tier 2, 20 in tier 3

migration 2-1: 10
migration 3-2: 5

tier1QueueLen = 50 + migration 2-1
tier2QueueLen = 30 + migration 3-2 + migration 2-1
tier3QueueLen = 20 + migration 3-2

// these should not be calculated in the updateApprox function
// these should be accumulated as we go, and then used in the updateApprox function to calculate the new approx queue sizes after the time window
// Use queues of tiers

Enter tRL:
Start a timer
End the timer
totalTimeInTRL +=  (end - start)
// we need make sure the iterations thorugh the previous workloads are not included in time

// start from the first req in the workload
// iterate through the workload until we reach a time (we add the latencies) that exceeds the totalTimeInTRL for each tier
// by that time we will have some requests served, say the counts are t1Count, t2Count, t3Count for each tier respectively

tier1QueueLen -= t1Count
tier2QueueLen -= t2Count
tier3QueueLen -= t3Count

*/