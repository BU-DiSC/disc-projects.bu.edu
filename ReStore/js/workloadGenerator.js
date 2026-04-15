//check if input values are too high
function capacity() {
    return true; // Bypassing capacity check for now, can re-enable later if needed

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

function generateWorkload() {
    if (fixedId === 0) {
        return generateWorkloadOriginal();
    }
    else if (fixedId === 1) {
        return savedWorkloadFixed1;
    }
    else if (fixedId === 2) {
        return savedWorkloadFixed2;
    }
}

function generateWorkloadOriginal() {

    var b_val, n_val, x_val, e_val, s_val, d_val;

    e_val = $("#e").val(); // read percentage
    s_val = $("#s").val(); // access skew
    d_val = $("#d").val(); // page skew
    x_val = $("#x").val(); // number of operations

    e_val = e_val.split(","); // Handle dynamic workload with two values
    s_val = s_val.split(",");
    d_val = d_val.split(",");
    x_val = x_val.split(",");

    // check if each element in x_val, e_val, s_val, d_val is a valid number
    for (let i = 0; i < x_val.length; i++) {
        if (isNaN(x_val[i]) || isNaN(e_val[i]) || isNaN(s_val[i]) || isNaN(d_val[i])) {
            alert("Invalid input values. Please enter comma separated numbers only.");
            return [];
        }
        // check if x_val is a positive integer, e_val, s_val, d_val are between 0 and 100
        if (Number(x_val[i]) <= 0 || Number(x_val[i]) % 1 !== 0) {
            alert("Number of operations must be a positive integer.");
            return [];
        }
        if (Number(e_val[i]) < 0 || Number(e_val[i]) > 100) {
            alert("Read percentage must be between 0% and 100%.");
            return [];
        }
        if (Number(s_val[i]) < 0 || Number(s_val[i]) > 100) {
            alert("Access percentage to the selected pages must be between 0% and 100%.");
            return [];
        }
        if (Number(d_val[i]) < 0 || Number(d_val[i]) > 100) {
            alert("Page percentage for skewed access must be between 0% and 100%.");
            return [];
        }
    }
    // Allow total number of operations to be between 100 to 10000
    const totalOps = x_val.reduce((acc, val) => acc + Number(val), 0);
    if (totalOps < 100 || totalOps > 10000) {
        alert("Please choose a total number of operations between 100 and 10000.");
        return [];
    }

    // Generate workload
    var workload = [];
    var pageId;

    const endPageId = highestPageId;
    for (let j = 0; j < x_val.length; j++) {
        cur_e_val = parseFloat(e_val[j]);
        cur_s_val = parseFloat(s_val[j]);
        cur_d_val = parseFloat(d_val[j]);
        cur_x_val = parseInt(x_val[j]);

        // Generate a shuffled array of all page IDs for random hot page selection
        const allPageIds = Array.from({ length: endPageId + 1 }, (_, i) => i);
        for (let i = allPageIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPageIds[i], allPageIds[j]] = [allPageIds[j], allPageIds[i]];
        }

        var hotMax = Math.floor((endPageId + 1) * cur_d_val / 100);
        if (hotMax < 0) hotMax = 0;
        console.log(`endPageId=${endPageId}, hotMax=${hotMax}`);

        const hotPages = allPageIds.slice(0, hotMax);
        const coldPages = allPageIds.slice(hotMax);

        for (let i = 0; i < cur_x_val; i++) {
            const typeDecider = Math.random() * 100;
            const skewed = Math.random() * 100;

            if (skewed < cur_s_val && hotPages.length > 0) {
                // hot region — random page from the shuffled hot pool
                pageId = hotPages[Math.floor(Math.random() * hotPages.length)];
            } else {
                // cold region — random page from the shuffled cold pool
                pageId = coldPages[Math.floor(Math.random() * coldPages.length)];
            }

            if (typeDecider < cur_e_val)
                workload.push(['R', pageId]);
            else
                workload.push(['W', pageId]);
        }

        // var hotMax = Math.floor(endPageId * cur_d_val / 100);
        // if (hotMax < 0) hotMax = 0;
        // console.log(`endPageId=${endPageId}, hotMax=${hotMax}`);
        // for (let i = 0; i < cur_x_val; i++) {
        //     const typeDecider = Math.random() * 100;
        //     const skewed = Math.random() * 100;

        //     if (skewed < cur_s_val) {
        //         // hot region
        //         pageId = Math.floor(Math.random() * (hotMax + 1));
        //     } else {
        //         // cold region
        //         pageId = Math.floor(Math.random() * (endPageId - hotMax)) + hotMax + 1;
        //     }

        //     if (typeDecider < cur_e_val)
        //         workload.push(['R', pageId]);
        //     else
        //         workload.push(['W', pageId]);
        // }
    }
    // console.log("Generated workload, len = ", workload.length);
    // console.log(workload);
    // printWorkloadStats(workload);
    return workload;
}

function printWorkloadStats(workload) {
    var endPageId = highestPageId;
    var readCount = 0;
    var writeCount = 0;
    var pageAccessCount = new Array(endPageId + 1).fill(0);
    for (let i = 0; i < workload.length; i++) {
        const [type, pageId] = workload[i];
        pageAccessCount[pageId]++;
        if (type === 'R') readCount++;
        else if (type === 'W') writeCount++;
    }
    console.log("Reads: " + readCount);
    console.log("Writes: " + writeCount);
    console.log("Page Access Distribution:");
    for (let i = 0; i <= endPageId; i++) {
        if (pageAccessCount[i] > 0) {
            console.log("Page " + i + ": " + pageAccessCount[i] + " accesses");
        }
    }

}

function getWorkloadEnqueueTimeEstimate(workload) {
    if (fixedId === 0) {
        return getWorkloadEnqueueTimeEstimateOriginal(workload);
    }
    else if (fixedId === 1) {
        return perReqEnqueueTimeFixed1; // in microseconds, using the estimate from the fixed trace for now
    }
    else if (fixedId === 2) {
        return perReqEnqueueTimeFixed2; // in microseconds, using the estimate from the fixed trace for now
    }
}

function getWorkloadEnqueueTimeEstimateOriginal(workload) {
    // Estimate time to put 100 requests
    let t1Queue = [];
    let t2Queue = [];
    let t3Queue = [];
    const start = performance.now();
    for (let i = 0; i < Math.min(workload.length, 100); i++) {
        const [type, pageId] = workload[i];
        if (tier1.find(p => p.id === pageId)) {
            // console.log(`Enqueueing ${type} request for page ${pageId} in tier 1`);
            t1Queue.push([type, pageId]);
        }
        else if (tier2.find(p => p.id === pageId)) {
            // console.log(`Enqueueing ${type} request for page ${pageId} in tier 2`);
            t2Queue.push([type, pageId]);
        }
        else {
            // console.log(`Enqueueing ${type} request for page ${pageId} in tier 3`);
            t3Queue.push([type, pageId]);
        }
    }
    const end = performance.now();
    const actualTime = (end - start) * 1000 / Math.min(workload.length, 100); // in microseconds
    const safetyMarginMultiplier = 5; // Add a safety margin to account for variability
    // console.log(`Average time to enqueue 100 requests: ${(end - start)*1000 / Math.min(workload.length, 100)} microseconds`);
    return actualTime * safetyMarginMultiplier; // in microseconds
}

$(document).ready(function () {
    $("#x, #s, #d, #e, #alpha").prop("disabled", false);
    var playing = false;

    //input fields
    const $x = $('#x'); //number of operations
    const $e = $('#e'); //read percentage
    const $s = $('#s'); //skewness
    const $d = $('#d'); // skewness data

    const smallWorkload1 = [2500, 60, 10, 50];
    const smallWorkload2 = [2500, 60, 10, 90];
    const smallWorkload3 = [2500, 60, 10, 20];
    const smallWorkload4 = [2500, 85, 10, 80];
    const smallWorkload5 = [2500, 100, 100, 50];
    // const smallCustomWorkload = [100, 90, 10, 50]; // Placeholder for custom workload, will be updated with user inputs
    const smallCustomWorkload = [2500, 80, 10, 50]; // Placeholder for custom workload, will be updated with user inputs
    const smallDynamicWorkload1 = [[2500, 2500], [60, 100], [10, 100], [50, 50]];
    const smallDynamicWorkload2 = [[2000, 3000], [85, 60], [10, 10], [90, 20]];

    var workloads = [smallWorkload1, smallWorkload2, smallWorkload3, smallWorkload4, smallWorkload5, smallCustomWorkload, smallDynamicWorkload1, smallDynamicWorkload2];
    const ids = [$x, $s, $d, $e];

    $(document).on("change", "#workload", function () {
        var workloadIndex = parseInt($(this).val());
        var id = $(this).attr("id");

        console.log("Workload changed:", id, "Index:", workloadIndex);

        if (workloadIndex > 0 && workloadIndex <= workloads.length) {
            var workload = workloads[workloadIndex - 1];

            console.log("Selected Workload Values:", workload);

            for (let i = 0; i < ids.length; i++) {
                var element = $("#" + ids[i].attr("id"));
                if (element.length === 0) {
                    console.warn(`Field ${fieldId} not found!`);
                    continue;
                }
                var uiText = workload[i];
                // special UI handling for #op, #skew, #data-skew to show two values for dynamic workload
                if (workloadIndex === 7 || workloadIndex === 8) {
                    uiText = workload[i].join(",");
                }
                // console.log(uiText)
                element.val(uiText);
            }
            console.log("Workload updated successfully.");
        }
        else {
            console.log("Invalid workload selected.");
        }

        playing = false;
    });
});


