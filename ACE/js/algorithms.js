var pauser = false;
var reloader = 0;
var delay = 100;
var playing = false;

$(document).ready(function(){
    $("#fast-button").click(function(){
        delay = 15;    
    });
    
    $("#slow-button").click(function(){
        delay = 1000;
    });

    $("#finish-button").click(function(){
        playing = false;
        pauser = false;
        reloader = 1;
        finisher();
        $("#play-button").prop('disabled', false);
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
    const ACEalgorithms = [ACELRU, ACECFLRU];
    ACEAlgorithm = ACEalgorithms[baseAlg];
    const baseAlgorithms = [baseLRU, baseCFLRU];
    baseAlgorithm = baseAlgorithms[baseAlg];
    //base bufferpool
    buffer = [];
    dirty = [];
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
        var row = $('<tr>').addClass("tablecell");
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
        var row = $('<tr>').addClass("tablecell");
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
                //baseAlgorithm(p);
                //ACEAlgorithm(p);
                baseLRUWSR(p);
                baseDisplay();
                //ACEDisplay();    
                p++;
            }
                   
            
          
          if (--i) myLoop(i); 
        }, delay)
    })(workload.length);             
    
}

function finisher(){
    for(var pagesLeft = p; pagesLeft < workload.length; pagesLeft++){
        baseAlgorithm(pagesLeft);
        ACEAlgorithm(pagesLeft);
    }
    baseDisplay();
    ACEDisplay(); 
}

function Highlight(index){
    var table = document.getElementById('ACE-alg-table');
    var num_columns = table.rows[0].cells.length;
    var cell = table.rows[Math.floor(cellIndex/num_columns)].cells[index % num_columns];    
    cell.style.backgroundColor = "yellow";
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
    $("#base-alg-pages-evicted").text(pagesEvicted);
    $("#base-alg-pages-prefetched").text(pagesPrefetched);
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
    $("#ace-alg-pages-prefetched").text(ACEpagesPrefetched);
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

    var coldflag = [];
    var eviction = [];

    // console.log(algorithm==base?"base":(algorithm==coneAlpha?"coneA":(algorithm==coneXAlpha?"coneX":(algorithm==cowAlpha?"cowA":(algorithm==cowXAlpha?"cowX":"invalid")))));
    // console.log("asymmetry: "+alphaVal);

    
        var type = workload[p][0];
        var page = workload[p][1];

        // console.log(type,page);
        
        // add to dirty if "W"
        if (type == "W" && !dirty.includes(page)){
            dirty.push(page);
        }

        // if buffer has page
        if (buffer.includes(page)){
            bufferHit++;
            if (coldflag[buffer.indexOf(page)]==1||(dirty.includes(page)&&coldflag[buffer.indexOf(page)]==-1))
                eviction.splice(eviction.indexOf(page),1);
            if (dirty.includes(page))
                coldflag[buffer.indexOf(page)] = 0; //if the page is dirty, (re)set cold flag to 0
            //move page to the end of buffer & coldflag arrays
            coldflag.push(coldflag.splice(buffer.indexOf(page),1)[0]);
            buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
        }
        //if buffer does not have a page
        else
        {
            bufferMiss++;
            readIO++;
            //if buffer not full
            if (buffer.length < bufferLength){
                buffer.push(page);
                if (dirty.includes(page)){
                    coldflag.push(0); //if the page is dirty, set cold flag to 0
                }else{
                    coldflag.push(-1);
                    eviction.push(page);
                }
            }
            //if buffer is full
            else {
                const first = buffer[0];
                //if first page is clean
                if ((!dirty.includes(first)) && coldflag[0] == -1){
                    buffer.shift();
                    coldflag.shift();
                    eviction.shift();
                }
                //if first page is not clean
                else{
                    //look for a page with cold flag set
                    var candidate = 0;
                    while ((coldflag[buffer.indexOf(eviction[candidate])] == -1 || coldflag[buffer.indexOf(eviction[candidate])] == 0) && candidate < eviction.length){
                        candidate++;
                    }

                    var evictPage = eviction[candidate];
                    if (evictPage == null) evictPage = buffer[0];

                    const candidateIndex = buffer.indexOf(evictPage);

                    if (dirty.includes(evictPage)) 
                        dirty.splice(dirty.indexOf(evictPage),1);
                    
                    buffer.splice(candidateIndex,1);
                    coldflag.splice(candidateIndex,1);

                    for (var k = 0; k < candidateIndex; k++){
                        if (dirty.includes(buffer[k]))
                            coldflag[k] = 1;
                    }

                    if (candidateIndex != 0){
                        const lastItem = buffer[candidateIndex - 1];

                        var setIndex = 0;
                        while (buffer[setIndex] != lastItem && setIndex < buffer.length){
                            if (coldflag[setIndex] == 1){
                                buffer.push(buffer.splice(setIndex,1)[0]);
                                coldflag.push(coldflag.splice(setIndex,1)[0]);
                                eviction.push(buffer[setIndex]);
                            }
                            setIndex++;  
                        }
                    }

                    //write to the disk before eviction
                    writeIO++;
                }
                
                
                buffer.push(page);
                if (dirty.includes(page)){
                    coldflag.push(0); //if the page is dirty, set cold flag to 0
                } else {
                    coldflag.push(-1);
                    eviction.push(page);
                }
            }
        }
        // console.log(buffer);
        // console.log(coldflag);
        // console.log(eviction);
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
                    Highlight(i);
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
    const ACEalgorithms = [ACELRU, ACECFLRU];
    ACEAlgorithm = ACEalgorithms[baseAlg];
    const baseAlgorithms = [baseLRU, baseCFLRU];
    baseAlgorithm = baseAlgorithms[baseAlg];
    //base bufferpool
    buffer = [];
    dirty = [];
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

