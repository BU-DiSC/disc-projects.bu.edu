$(document).ready(function(){

	/*First & Second Graphs*/
    //input fields
    const $b = $('#b'); //buffer size
    const $n = $('#n'); //disk size
    const $x = $('#x'); //number of operations
    const $e = $('#e'); //read percentage
    const $alpha = $('#alpha'); //number of pages
    const $s = $('#s'); //skewness
    const $d = $('#d'); //skewness data
    const $type = $('#type'); //type of graph
    const $baseAlg = $('#baseAlg'); //base algorithm
    const $recalc_va = $('#recalc_va'); 
    const $switch = $('#rawData');

    const $workload = $('#workload');

    var workloadVA = generateWorkload(); 
    var rawDataVA = getVA(workloadVA);
    updateVA(rawDataVA);

    //[b,n,x,s,d,e,alpha]
    const workload1 = [250, 5000, 50000, 80, 15, 60, 8];
    const workload2 = [2500, 5000, 50000, 80, 15, 60, 8];
    const workload3 = [500, 5000, 50000, 80, 15, 90, 8];
    const workload4 = [500, 5000, 50000, 80, 15, 20, 8];
    const workload5 = [500, 10000, 50000, 95, 5, 60, 8];
    const workload6 = [500, 500, 50000, 100, 100, 60, 8];
    var workloads = [workload1, workload2, workload3, workload4, workload5, workload6];
    var inputs = [$b, $n, $x, $s, $d, $e, $alpha];

    /*Workload Changes*/
    $workload.change(function(){
        $recalc_va.prop('disabled',false);
        // $recalc_numOp.prop('disabled',false);
        $recalc_buff.prop('disabled',false);
        $recalc_read.prop('disabled',false);
    	var workloadIndex = parseInt($(this).val());
    	if (workloadIndex > 0){
    		var workload = workloads[workloadIndex - 1];
    		inputs.forEach((element, index) => {element.prop("disabled",true);element.val(workload[index])});
    	}
    	else{
    		inputs.forEach((element) => element.prop("disabled",false));
    	}
    });

    inputs.forEach((element) => {element.change(function(){
        $recalc_va.prop('disabled',false);
        // $recalc_numOp.prop('disabled',false);
        $recalc_buff.prop('disabled',false);
        $recalc_read.prop('disabled',false);
    })});

    $type.change(function(){
        updateVA(rawDataVA);
    });

    $baseAlg.change(function(){
        $recalc_va.prop('disabled',false);
    });

    $recalc_va.click(function(){
        $('.spinner-va').show(400, function(){ //using callback to make sure that the followings are run after spinner
            $recalc_va.prop('disabled',true);
            workloadVA = generateWorkload();
            rawDataVA = getVA(workloadVA);
            updateVA(rawDataVA);
            $('#span_va').text("Recalculate");
        });
    });

    $switch.change(function(){
        updateVA(rawDataVA);
    });

    /*Varying Read Percentage*/
    //input fields
    const $baseAlg_read = $('#baseAlg_read');
    const $type_read = $('#type_read');
    const $recalc_read = $('#recalc_read');

    var workloadRP;
    var rawDataRP;

    $recalc_read.click(function(){
        $('.spinner-read').show(400, function(){
            $recalc_read.prop('disabled',true);
            console.log("hmm");
            workloadRP =[];
            for (var i = 5; i < 100; i = i + 15){
                workloadRP.push(generateWorkload(3, i));
            }
            rawDataRP = getRPRaw(workloadRP);
            updateRP(rawDataRP);
            $('#span_read').text("Recalculate");
        });
    });

    $type_read.change(function(){
        $('.spinner-read').show(400,updateRP(rawDataRP));
    });

    $baseAlg_read.change(function(){
        $recalc_read.prop("disabled", false);
    })

    /*Varying Buffer Pool %*/
    //input fields
    const $baseAlg_buff = $('#baseAlg_buff');
    const $type_buff = $('#type_buff');
    const $recalc_buff = $('#recalc_buff');

    var workloadBuff;
    var rawDataBuff;
    $recalc_buff.click(function(){
        $('.spinner-buff').show(400, function(){
            $recalc_buff.prop('disabled',true);
            workloadBuff = [];
            const bufferPoolRatio = [1,2,5,10,15,20,30,50,75,90];
            for (var ratio in bufferPoolRatio){
                workloadBuff.push(generateWorkload(2, ratio));
            }
            rawDataBuff = getBPRaw(workloadBuff, bufferPoolRatio);
            updateBP(rawDataBuff, bufferPoolRatio);
            $('#span_buff').text("Recalculate");
        });
    });

    $baseAlg_buff.change(function(){
        $recalc_buff.prop("disabled",false);
    });

    $type_buff.change(function(){
        $('.spinner-buff').show(400, updateBP(rawDataBuff));
    });

    /*Varying Number of Operations*/
    //input fields
    // const $type_numOp = $('#type_numOp'); //type of graph
    // const $baseAlg_numOp = $('#baseAlg_numOp'); //base algorithm
    // const $steps = $('#steps');
    // const $recalc_numOp = $('#recalc_numOp');

    // var workloadNumOp;
    // var rawDataNumOp;

    // $recalc_numOp.click(function(){
    //     $(this).text("Recalculate");
    //     $('.spinner-numOp').show(400, function(){
    //         workloadNumOp = [];
    //         for (var k = 1; k < 11; k++){
    //             workloadNumOp.push(generateWorkload(1, parseInt($steps.val())*k));
    //         }
    //         rawDataNumOp = getNORaw(workloadNumOp);
    //         updateNO(rawDataNumOp);
    //         $('#span_numOp').text("Recalculate");
    //     });
    // });

    // $baseAlg_numOp.change(function(){
    //     $recalc_numOp.prop("disabled",false);
    // });

    // $type_numOp.change(function(){
    //     $('.spinner-numOp').show(400, updateBP(rawDataBuff));
    // });


});

function generateWorkload(type, extraInput){

    var b_val = parseInt(b.value);
    var n_val = parseInt(n.value);
    var x_val = parseInt(x.value);
    var e_val = parseInt(e.value);
    var s_val = parseInt(s.value);
    var d_val = parseInt(d.value);

    if (type == 1)
        x_val = extraInput;
    else if (type == 2)
        b_val = n_val * extraInput/100;
    else if (type == 3)
        e_val = extraInput;

    //generate workload
    var pageId;
    var endPageId = n_val*(d_val/100);
    var workload = [];

    for(i = 0; i < x_val; i++){

        const typeDecider = Math.random()*100;
        const skewed = Math.random()*100;

        if (skewed < s_val)
            pageId = Math.ceil(Math.random()*endPageId);
        else
            pageId = Math.ceil(Math.random()*(n_val - endPageId) + endPageId);

        if (typeDecider < e_val)
            workload.push(['R', pageId]);
        else
            workload.push(['W', pageId]);

    }
    return workload;

}
