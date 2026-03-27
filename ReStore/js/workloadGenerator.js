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


function generateWorkload(){

    var b_val, n_val, x_val, e_val, s_val, d_val;

    // Individual experiment
    d_val = 10 // page skew
    s_val = 80 // access skew
    e_val = 50 // read percentage
    x_val = 100 // number of operations, actually 10000, working with smaller number for testing
    // b_val = parseInt($("#b").val());
    // n_val = parseInt($("#n").val());
    // x_val = parseInt($("#x").val());
    e_val = parseInt($("#e").val());
    s_val = parseInt($("#s").val());
    d_val = parseInt($("#d").val());
    x_val = parseInt($("#x").val());

    // Generate workload
    var pageId;
    // var endPageId = n_val * (d_val / 100);
    var endPageId = highestPageId;
    var hotMax = Math.floor(endPageId * d_val / 100);
    if (hotMax < 0) hotMax = 0;
    console.log(`endPageId=${endPageId}, hotMax=${hotMax}`);

    var workload = [];

    for (let i = 0; i < x_val; i++) {
        const typeDecider = Math.random() * 100;
        const skewed = Math.random() * 100;

        if (skewed < s_val) {
            // 80% accesses → hot region
            pageId = Math.floor(Math.random() * (hotMax + 1));
        } else {
            // 20% accesses → cold region
            pageId = Math.floor(Math.random() * (endPageId - hotMax)) + hotMax + 1;
        }

        if (typeDecider < e_val)
            workload.push(['R', pageId]);
        else
            workload.push(['W', pageId]);
    }
    console.log("Generated workload, len = ", workload.length);
    console.log(workload);
    printWorkloadStats(workload);
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
    var endPageId = highestPageId;
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
    $("#x, #s, #d, #e, #alpha").prop("disabled", false);
    var playing = false;

    //input fields
    const $x = $('#x'); //number of operations
    const $e = $('#e'); //read percentage
    const $alpha = $('#alpha'); //asymmetry
    const $s = $('#s'); //skewness
    const $d = $('#d'); // skewness data

    const smallWorkload1 = [100, 80, 10, 50];
    const smallWorkload2 = [100, 80, 10, 90];
    const smallWorkload3 = [100, 80, 10, 20];
    const smallWorkload4 = [100, 90, 5, 50];
    const smallWorkload5 = [100, 100, 100, 50];
    // const smallCustomWorkload = [100, 90, 10, 50]; // Placeholder for custom workload, will be updated with user inputs
    const smallCustomWorkload = [100, 80, 50, 50]; // Placeholder for custom workload, will be updated with user inputs

    var workloads = [smallWorkload1, smallWorkload2, smallWorkload3, smallWorkload4, smallWorkload5, smallCustomWorkload];
    var inputs = [$x, $s, $d, $e, $alpha];

    $(document).on("change", "#workload", function() {
        var workloadIndex = parseInt($(this).val());
        var id = $(this).attr("id");

        console.log("Workload changed:", id, "Index:", workloadIndex);

        var ids = ["x", "s", "d", "e"];

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
        } 
        else {
            console.log("Invalid workload selected.");
        }

        playing = false;
    });
});


