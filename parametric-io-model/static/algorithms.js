/*Variables*/
var buffer;
var dirty;
var uses;

var bufferHit;
var bufferMiss;
var readIO;
var writeIO;
var writeCost;

var bufferLength;
var alphaVal;
var workload;

function calculate(wload, bLen, alpha, baseAlg){

	workload = wload;
	bufferLength = bLen;
	alphaVal = alpha;

    const algorithms = [base, coneAlpha, coneXAlpha, cowAlpha, cowXAlpha];
    const baseAlgorithms = [baseLRU, baseLFU, baseCFLRU, baseLRUWSR];

    var result = (function(){
        var data = [];
        for (var i = 0; i < algorithms.length; i++){
            buffer = [];
            dirty = [];
            uses = {};
            bufferHit = 0;
            bufferMiss = 0;
            readIO = 0;
            writeIO = 0;
            writeCost = 0;

            const baseAlgorithm = baseAlgorithms[baseAlg];

            data.push(baseAlgorithm(algorithms[i]));
        }
        return data;
    })();
	return result;
}

function baseLRU(algorithm){

	for (var j = 0; j < workload.length; j++){
	    var type = workload[j][0];
	    var page = workload[j][1];

		// add to dirty if "W"
	  	if (type == "W" && !dirty.includes(page))
		    dirty.push(page);

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
	    	if (buffer.length < bufferLength)
			    buffer.push(page);
		    else
			    algorithm(page);
	    }
	}
	return[bufferMiss, readIO, writeIO, writeCost];

}

function baseLFU(algorithm){
    for (var j = 0; j < workload.length; j++){
        var type = workload[j][0];
        var page = workload[j][1];

        if (page in uses)
            uses[page] += 1;
        else
            uses[page] = 1;

        // add to dirty if "W"
        if (type == "W" && !dirty.includes(page))
            dirty.push(page);

        // if buffer has page
        if (buffer.includes(page))
            bufferHit++;

        // if buffer doesn't have page
        else
        {
            bufferMiss++;
            readIO++;
            //if buffer not full
            if (buffer.length < bufferLength)
                buffer.push(page);
            else
                algorithm(page);
        }

        //remove evicted buffer pages from uses dictionary 
        var usesDic = uses;
        Object.keys(uses).forEach(function(key){
            if (!(buffer.includes(parseInt(key)))){
                delete usesDic[key];
            }
        });
        uses = usesDic;

        //sort buffer and dirty based on their usage
        var values = Object.keys(uses).map(function(key){
            return uses[key];
        });
        values = values.sort(); //sort by number of uses (least used to the first, most used to the last)

        //sort buffer based on uses - LFU to the front, MFU to the end
        buffer = new Array(values.length);
        Object.keys(uses).forEach(function(key){
            const index = values.indexOf(uses[key]);
            buffer[index] = parseInt(key);
            values[index] = 0;
        });

        //sort dirty so that it matches the order in buffer
        for (var i = 0; i < buffer.length; i++){
            if (dirty.includes(buffer[i])){
                dirty.splice(dirty.indexOf(buffer[i]), 1);
                dirty.push(buffer[i]);
            }
        }
    }

    return [bufferMiss, readIO, writeIO, writeCost];
}

function baseCFLRU(algorithm){
    const cleanPer = 1/3;
    const cleanSize = Math.floor(buffer.length * cleanPer);

    for (var j = 0; j < workload.length; j++){
        var type = workload[j][0];
        var page = workload[j][1];

        // add to dirty if "W"
        if (type == "W" && !dirty.includes(page))
            dirty.push(page);

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
            } else{
                var cleanFirst = buffer.slice(0, cleanSize - 1);
                var allDirty = true;
                for (var k = 0; k < cleanFirst.size; k++){
                    if (!dirty.includes(cleanFirst[i])) allDirty = false;
                }
                //if all pages in clean first region are dirty, then run algorithms
                if (allDirty) algorithm(page);
                //if there are clean pages, evict clean page first
                else {
                    //iterate through clean first region of buffer until you find a clean page
                    var k = 0;
                    while (dirty.includes(cleanFirst[k])) k++;
                    buffer.splice(buffer.indexOf(cleanFirst[k]),1);
                    buffer.push(page);
                }
            }
        }
    }
    return[bufferMiss, readIO, writeIO, writeCost];

}

function baseLRUWSR(algorithm){

    var coldflag = [];
    var element = document.createElement('a');
    var text = "";
    for (var j = 0; j < workload.length; j++){
        var type = workload[j][0];
        var page = workload[j][1];

        // add to dirty if "W"
        if (type == "W" && !dirty.includes(page)){
            dirty.push(page);
        }

        // if buffer has page
        if (buffer.includes(page)){
            bufferHit++;
            if (dirty.includes(page)) {
                coldflag[buffer.indexOf(page)] = 0; //if the page is dirty, (re)set cold flag to 0
                dirty.push(dirty.splice(dirty.indexOf(page),1)[0]); //move the page to the end of dirty array
            } else {
                coldflag[buffer.indexOf(page)] = -1;
            }
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
                if (dirty.includes(page))
                    coldflag.push(0); //if the page is dirty, (re)set cold flag to 0
                else
                    coldflag.push(-1);
            }
            //if buffer is full
            else {
                const first = buffer[0];
                //if first page is clean
                if (!dirty.includes(first)){
                    dirty.splice(dirty.indexOf(first),1)[0];
                    buffer.splice(0,1);
                    coldflag.splice(0,1);
                }
                //if first page is not clean && running LRU-WSR
                else if (algorithm == base){
                    //look for a page with cold flag set
                    var k = 0;
                    while (coldflag[k] == 0){
                        if (dirty.includes(buffer[k])) {
                            coldflag[k] = 1; //only set cold flag if page is dirty
                            dirty.push(dirty.splice(k,1)[0]); //move the page to the end of dirty array
                        }
                        //move the page to the end of buffer & cold flag array
                        coldflag.push(coldflag.splice(k,1)[0]);
                        buffer.push(buffer.splice(k,1)[0]);
                        k++;
                    }
                    //when a page with cold flag set is found, evict that page from all arrays
                    dirty.splice(dirty.indexOf(buffer[k]),1);
                    buffer.splice(k,1);
                    coldflag.splice(k,1);
                    //write to the disk before eviction
                    writeCost++;
                    writeIO++;
                }
                //if first page !clean && base = CONE-n
                else if (algorithm = coneAlpha) {
                    //evict up to alpha number of dirty pages with cold flag set
                    for (var k = 0; k < alphaVal; k++){
                        //remove page if coldflag is set
                        if(dirty.includes(buffer[k]) && coldflag[k] == 1){
                            dirty.splice(dirty.indexOf(buffer[k]),1); 
                            coldflag.splice(k,1);
                            buffer.splice(k,1); //remove dirty pages from buffer & dirty from the first alpha number of pages in the buffer
                            writeIO++;
                        } else if (dirty.includes(buffer[k]) && coldflag[k] == 0){
                            //set coldflag if page is dirty and push the page to the end
                            coldflag[k] = 1;
                            dirty.push(dirty.splice(dirty.indexOf(buffer[k]),1)[0]);
                            buffer.push(buffer.splice(k,1)[0]);
                            coldflag.push(coldflag.splice(k,1)[0]);
                        }
                    }
                    writeCost++;
                } 
                //if first page ! clean && base = CONE-Xn
                else if (algorithm = coneXAlpha){
                    //evict n number of dirty pages with cold flag set from buffer
                    var k = 0;
                    var count = 0;
                    while (k < buffer.length && count < alphaVal){
                        if (coldflag[k] == 1){
                            coldflag.splice(k,1);
                            dirty.splice(dirty.indexOf(buffer[k]),1);
                            buffer.splice(k,1);
                            writeIO++;
                            count++;
                        }
                        k++;
                    }
                    writeCost++;
                }
                //if first page is not clean && base = COW-n
                else if (algorithm == cowAlpha){
                    // check LRU n number of pages in buffer
                    for(var k = 0; k < alphaVal; k++){
                        // if dirty, then write to disk (but not evict)
                        if (dirty.includes(buffer[k]) && coldflag[k] == 1){
                            coldflag[k] = -1;
                            dirty.splice(dirty.indexOf(buffer[k]),1);
                            writeIO++;
                        } else if (dirty.includes(buffer[k]) && coldflag[k] == 0){
                            coldflag[k] == 1; //set coldflag

                        }
                    }
                    //move pages with coldflag set to the end of the buffer
                    var k = 0;
                    while (k < alphaVal) {
                        if (coldflag[k] == 1){
                            coldflag.push(coldflag.splice(k,1)[0]);
                            buffer.push(buffer.splice(k,1)[0]);
                        }
                        k++;
                    }
                    buffer.shift();// evict only one page
                    writeCost++;
                } 
                //if first page ! clean && base = COW-Xn
                else if (algorithm == cowXAlpha){

                    //evict n number of dirty pages with cold flag set from buffer
                    var k = 0;
                    var count = 0;
                    while (k < buffer.length && count < alphaVal){
                        if (coldflag[k] == 1){
                            coldflag[i] == -1;
                            dirty.splice(dirty.indexOf(buffer[k]),1);
                            writeIO++;
                            count++;
                        }
                        k++;
                    }

                    var l = 0;
                    while (l < alphaVal) {
                        if (coldflag[l] == 1){
                            coldflag.push(coldflag.splice(l,1)[0]);
                            buffer.push(buffer.splice(l,1)[0]);
                        }
                        l++;
                    }
                    buffer.shift();// evict only one page
                    writeCost++;
                } 
                buffer.push(page);
                if (dirty.includes(page))
                    coldflag.push(0); //if the page is dirty, (re)set cold flag to 0
                else
                    coldflag.push(-1);
            }
        }
        text+= (j+1)+"th operation\n"
        text += "Workload\n"+workload[j][0]+workload[j][1]+"\nBuffer:"+buffer+"\nCold Flag:"+coldflag+"\nDirty:"+dirty+"\n";
        text+="Buffer Miss:"+bufferMiss+"\nRead IO:"+readIO+"\nWrite IO:"+writeIO+"\nWrite Cost:"+writeCost+"\n\n";
    }
    element.setAttribute('href', 'data:'+text+'/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "test.txt");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    return[bufferMiss, readIO, writeIO, writeCost];
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

/*Algorithms*/
function base(page){

	// remove item from dirty
	const first = buffer[0];
    if (dirty.includes(first)){
	    dirty.splice(dirty.indexOf(first), 1);
	    writeIO++;
	    writeCost++;
    }
    buffer.shift(); // remove one item from buffer
    buffer.push(page);
	
}

function coneAlpha(page){

    //remove item from dirty
    const first = buffer[0];
    if (dirty.includes(first)){
        for(var j = 0; j < alphaVal; j++){
            if(dirty.includes(buffer[j])){
                dirty.splice(dirty.indexOf(buffer[j]),1); 
                buffer.splice(j,1); //remove dirty pages from buffer & dirty from the first alpha number of pages in the buffer
                writeIO++;
            }
        }
        writeCost++;
    } else {
        buffer.shift(); // remove one least recently used item from buffer
    }
    buffer.push(page);
	
}

function coneXAlpha(page){

    const first = buffer[0];
    if (dirty.includes(first)){
        //remove item from dirty
        for(var j = 0; j < alphaVal; j++){
            // if dirty is not empty
            if (dirty.length > 0 && dirty[j] != null){
                buffer.splice(buffer.indexOf(dirty[j]),1); // remove alpha number of dirty pages from buffer
                writeIO++;
            }
        }
        writeCost++;
        dirty.splice(0,alphaVal); // remove alpha number of pages from dirty
    } else {
        buffer.shift(); // remove one page from buffer
    }
    buffer.push(page);
}

function cowAlpha(page){

    const first = buffer[0];
    if (dirty.includes(first)){
        // check LRU alpha number of pages in buffer
        for(var j = 0; j < alphaVal; j++){
            // if dirty, then remove from dirty and write to disk
            if (dirty.includes(buffer[j])){
                dirty.splice(dirty.indexOf(buffer[j]),1);
                writeIO++;
            }
        }
        writeCost++;
    }
    buffer.shift();// evict only one page
    buffer.push(page);
}

function cowXAlpha(page){

    const first = buffer[0];
    if (dirty.includes(first)){
        buffer.splice(buffer.indexOf(dirty[0]),1); // remove first dirty page from buffer
        if (dirty.length >= alphaVal)
            writeIO+=alphaVal;
        else
            writeIO+= dirty.length;
        dirty.splice(0,alphaVal); // remove pages written to the disk
        writeCost++;
    } else {
        buffer.shift();
    }
    buffer.push(page);

}
