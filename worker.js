importScripts("js/tsne.js");
onmessage = function(e){
    const opt = {};
    opt.epsilon = 1; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    alert("About to initialize tSNE with Raw Data");
    tsne.initDataRaw(e.data);
    alert("tSNE Initialization Complete");
    
    const size = e.data.length;
    const stepSize = Math.floor(size/1000);
    
    for(var k = 0; k < 500; k++) {
        tsne.step(); // every time you call this, solution gets better
            drawPoints(tsne.getSolution(), "Learning Rate: " + opt.epsilon.toString() +
                                           "<br>Perplexity: " + opt.perplexity +
                                           "<br>Iteration: " + k.toString());
    }
    alert("tSNE Complete")
}

// Tell the worker container in the main thread to send an alert
function alert(strMessage) {
    postMessage({command:"alert", content:strMessage});
}

// Tell the worker container in the main thread to draw the points within objectData
function drawPoints(objectData, strMessage) {
    postMessage({command:"drawPoints", content:objectData, logMessage:strMessage});
}