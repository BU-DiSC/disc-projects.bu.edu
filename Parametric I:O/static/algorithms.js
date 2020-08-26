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
    const baseAlgorithms = [baseLRU, baseLFU, baseCC];

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
    console.log(result);
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

function baseCC(algorithm){
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
            //move page to the end of buffer array
            buffer.push(buffer.splice(buffer.indexOf(page), 1)[0]);
        }
        // if buffer doesn't have page
        else
        {
            bufferMiss++;
            readIO++;
            //if buffer not full
            if (buffer.length < bufferLength)
                buffer.push(page);
            else
            {
                if (algorithm == base){
                    // remove item from dirty
                    var checkIndex = 0;
                    var target = buffer[checkIndex];
                    while (dirty.includes(target) && checkIndex < buffer.length -1){
                        checkIndex++;
                        target = buffer[checkIndex];
                    }
                    buffer.splice(checkIndex,1); // remove one item from buffer
                    buffer.push(page);
                } else {
                    algorithm(page);
                }
            }
        }
    }
    return[bufferMiss, readIO, writeIO, writeCost];
}

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
