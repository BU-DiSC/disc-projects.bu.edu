var pauser = false;
var reloader = 0;
var delay = 200;
var playing = false;
var firstWrite = true;
$(document).ready(function(){
    $("#ACEAlert").css('visibility', 'hidden');
    const $workload = $('#workload');
    $workload.change(function(){
        finisher();
        resetStats();
        $("#base-alg-table").remove();
        $("#ACE-alg-table").remove();
        $("#ACEAlert").css('visibility', 'hidden');
        firstWrite = true;
    });

    const $alg = $('#baseAlg');
    $alg.change(function(){
        finisher();
        resetStats();
        $("#base-alg-table").remove();
        $("#ACE-alg-table").remove();
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

    $("#play-button").click(function(){
        
        if(playing){
            if(!pauser){
                pauser = true;
            }else{
                pauser= false;
            }
        }
        if(!playing){
            playing = true;
        }
        
    });
});

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

function finisher(){
    playing = false;
    pauser = false;
    reloader = 1;
    for(var pagesLeft = p; pagesLeft < workload.length; pagesLeft++){
        baseAlgorithm(pagesLeft);
        ACEAlgorithm(pagesLeft);
    }
    baseDisplay();
    ACEDisplay(); 
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

    $("#ace-alg-buffer-misses").text(0);
    $("#ace-alg-buffer-hits").text(0);
    $("#ace-alg-pages-read").text(0);
    $("#ace-alg-pages-written").text(0);
    $("#ace-alg-read-IO").text(0);
    $("#ace-alg-write-IO").text(0);
    $("#ace-alg-pages-evicted").text(0);
}

function baseDisplay(){
    //update end of buffer pool
    let i = 0;
    $("#base-alg-table tr").each(function () {
        $('td', this).each(function () {
            if(dirty.includes(buffer[i])){
                $(this).css("background-color", "#8B0000");
            }
            else if(buffer[i] == null){
                $(this).css("background-color", "grey");
            }
            else{
                $(this).css("background-color", "#028A0F");
            }
            i++;
        });
    });
    //update metrics
    $("#base-alg-buffer-misses").text(bufferMiss);
    $("#base-alg-buffer-hits").text(bufferHit);
    $("#base-alg-pages-read").text(pagesRead);
    $("#base-alg-pages-written").text(pagesWritten);
    $("#base-alg-read-IO").text(readIO);
    $("#base-alg-write-IO").text(writeIO);
    $("#base-alg-pages-evicted").text(ACEpagesEvicted);
}

function ACEDisplay(){
    //update end of buffer pool
    let i = 0;
    $("#ACE-alg-table tr").each(function () {
        $('td', this).each(function () {
            if(ACEdirty.includes(ACEbuffer[i])){
                $(this).css("background-color", "#8B0000");
            }
            else if(ACEbuffer[i] == null){
                $(this).css("background-color", "grey");
            }
            else{
                $(this).css("background-color", "#028A0F");
            }
            i++;
        });
    });
    //update metrics
    $("#ace-alg-buffer-misses").text(ACEbufferMiss);
    $("#ace-alg-buffer-hits").text(ACEbufferHit);
    $("#ace-alg-pages-read").text(ACEpagesRead);
    $("#ace-alg-pages-written").text(ACEpagesWritten);
    $("#ace-alg-read-IO").text(ACEreadIO);
    $("#ace-alg-write-IO").text(ACEwriteIO);
    $("#ace-alg-pages-evicted").text(ACEpagesEvicted);
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
    return [writeIO + readIO, ACEwriteIO + ACEreadIO];
}

