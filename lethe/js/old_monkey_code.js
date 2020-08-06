

function clickbloomTuningButton_OLD() {

// document.getElementById("mEV").value=document.getElementById("mEV").value.replace(/\./g,"");
// document.getElementById("mPWage").value=document.getElementById("mPWage").value.replace(/\./g,"");

    var N = parseInt(document.getElementById("N").value,10);
    var E = parseInt(document.getElementById("E").value,10);
    var mbuffer = parseFloat(document.getElementById("mbuffer").value)*1048576;
    var T = parseInt(document.getElementById("T").value, 10);
    var R = parseFloat(document.getElementById("R").value);
    var P = parseInt(document.getElementById("P").value, 10);
    var W = parseFloat(document.getElementById("W").value);
    var leveltier = getRadioValueByName("ltradio");
    
    Rmax=getRmax(leveltier,N,E,mbuffer,T);
    document.getElementById('RmaxLabel').value = "Rmax = "+Rmax;

    if (R>Rmax)
    {
            document.getElementById("explanation").value = ("Rmax = "+Rmax+", and you selected R = "+R+". Please select an R < Rmax.");
            return;
    }       

    var filter_array = [];
    var remainingKeys=N;
    var level=0;
    //Calculate the number of keys per level in a almost-full in each level LSM tree
    while (remainingKeys>0)
    {
        level++;
        var levelKeys=Math.ceil(Math.min(Math.pow(T,level)*mbuffer/E,N));
        var newFilter = new Filter();
        newFilter.nokeys=levelKeys;
        newFilter.fp=1.0;
        console.log("New remaining keys: "+(remainingKeys-levelKeys))
        if (remainingKeys-levelKeys<0)
            newFilter.nokeys=remainingKeys;
        filter_array.push(newFilter);
        remainingKeys=remainingKeys-levelKeys;
        console.log(levelKeys)
    }

    var maxNumRuns;
    if (leveltier==0)
        maxNumRuns=filter_array.length;
    else if (leveltier==1)
        maxNumRuns=filter_array.length*(T-1);
    
    //Initialize the false positive so that they are all equal
    for (var i=0;i<filter_array.length;i++)
    {
        filter_array[i].fp=R/maxNumRuns;
    }
    var regularFP=R/maxNumRuns;
    var regularBFsizeMB=calcTotalMemBits(filter_array)/8/1024/1024;
    console.log("The size of the default LSM tree in MB: "+(calcTotalMemBits(filter_array)/8/1024/1024))




    var diff = 0.001;
    var current_num_bits = calcTotalMemBits(filter_array);
    var original = current_num_bits;
    //console.log("start val:  %f\n", current);

    console.log("uniform strategy:  "+ current_num_bits / (8 * 1024) );

    //prvar(filter_array, current, 0);

    var change = true;
    var iteration = 0;
    while (true) {
        change = false;

        for (var i = 0; i < filter_array.length - 1; i++) {
            for (var j = i + 1; j < filter_array.length ; j++) {

                filter_array[i].fp += diff;
                filter_array[j].fp -= diff;
                var value = calcTotalMemBits(filter_array);
                if (value < current_num_bits && value > 0 && filter_array[j].fp > 0 && filter_array[i].fp < 1) {
                    current_num_bits = value;
                    change = true;
                    continue;
                }
                filter_array[i].fp -= diff * 2;
                filter_array[j].fp += diff * 2;

                value = calcTotalMemBits(filter_array);

                if (value < current_num_bits && value > 0 && filter_array[i].fp > 0 && filter_array[j].fp < 1) {
                    current_num_bits = value;
                    change = true;
                    continue;
                }

                filter_array[i].fp += diff;
                filter_array[j].fp -= diff;
            }
        }
        if (!change) {
            diff /= 2;
            if (diff < 0.0000001) {
                break;
            }
        }
        //prvar(filter_array, current, iteration);
        iteration++;
        //prvar_detail(filter_array, current);
    }
    // prvar_detail(filter_array, current_num_bits);
    console.log("ratio saving  "+ current_num_bits / original );
    console.log("original "+ original / (8 * 1024)+"KB");
    //total_uniform_RAM3(limit_on_reads, size_ratio, filter_array.back().size, page_size);
    console.log("current "+ current_num_bits / (8 * 1024)+"KB");
    //console.log("size:  %ld\n", filter_array.back().size);


    for (var i=0;i<filter_array.length;i++)
    {
        if (Math.abs(filter_array[i].fp-1)<0.0000001)
            filter_array[i].fp=1.0;
    }


    console.log(filter_array.length);
    console.log(filter_array);

    document.getElementById("explanation").value ="";
    document.getElementById("explanation").value = "The LSM tree holds "+(N*E/1024/1024).toFixed(1)+" MB of Key-Value pairs.\n";
    document.getElementById("explanation").value += "Level 0 buffer size is "+(mbuffer/1024/1024).toFixed(1)+" MB.\n";
    var bf_total_size=calcTotalMemBits(filter_array);
    document.getElementById("explanation").value += "Bloom filter memory consumtion for state-of-the-art is "+(regularBFsizeMB).toFixed(1)+" MB.\n";
    document.getElementById("explanation").value += "Bloom filter memory consumtion for MonKey is "+(bf_total_size/8/1024/1024).toFixed(1)+" MB, i.e., "+(regularBFsizeMB/(bf_total_size/8/1024/1024)).toFixed(2)+ "x smaller.\n";
    

    document.getElementById("explanation").value += ("Level\t\t#Keys\t\tfp (%)\t\tfp state-of-art\n");
    var total_keys=0;
    for (var i=0;i<filter_array.length;i++)
    {
        console.log(filter_array[i].nokeys+", "+filter_array[i].fp);
        total_keys+=filter_array[i].nokeys;
        document.getElementById("explanation").value += ("  "+(i+1)+"  \t\t"+pad(numberWithCommas(filter_array[i].nokeys),12," ")+"\t\t"+(100*filter_array[i].fp).toFixed(2)+"%\t\t"+(100*regularFP).toFixed(2)+"%  hello \n");

    }
    console.log("Total indexed keys: "+total_keys);


    var W;
    var entries_per_page=Math.floor(P/E);
    if (leveltier==0)
        W=(filter_array.length/entries_per_page)*(T-1)/2;
    else if (leveltier==1)
        W=(filter_array.length/entries_per_page)*(T-1)/T;

    document.getElementById("W").value = W.toFixed(4);

}

function holisticTuning()
{
    var N = parseInt(document.getElementById("N").value,10);
    var E = parseInt(document.getElementById("E").value,10);
    var M = parseInt(document.getElementById("M").value, 10)*1048576;
    var page_size = parseInt(document.getElementById("P").value, 10);
    document.getElementById("explanationHolistic").value="";

    var conf = new LSM_config();
    conf.N=N;
    conf.E=E;
    conf.B=page_size/E;
    conf.M=M;

    conf.P=0;
    conf.T=0;
    conf.L=0;
    conf.R=0;
    conf.W=0;
    conf.valid=false;
    conf.throughput=0;
    conf.num_levels=0;
    console.log("start")
    print_csv_experiment(conf,0,true,-1,true,true,true);

// function print_csv_experiment(conf, num_commas, print_details, fix_buffer_size = -1, use_new_strategy = true, smoothing = false, differentiate_tiered_leveled = true) {

}

function clickRWboundsButton() {

    var N = parseInt(document.getElementById("N").value,10);
    var E = parseInt(document.getElementById("E").value,10);
    var mbuffer = parseFloat(document.getElementById("mbuffer").value)*1048576;
    var T = parseInt(document.getElementById("T").value, 10);
    var leveltier = getRadioValueByName("ltradio");

    console.log(leveltier);
    var Rmax;
    Rmax=getRmax(leveltier,N,E,mbuffer,T);
    document.getElementById('RmaxLabel').value = "Rmax = "+Rmax;


}