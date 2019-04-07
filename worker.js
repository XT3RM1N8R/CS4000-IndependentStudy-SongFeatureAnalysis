importScripts("js/tsne.js");
onmessage = function(e){
    const inputs = e.data;
    inputs.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(inputs); // create a tSNE instance

    alert("About to initialize tSNE with Raw Data");
    tsne.initDataRaw(inputs.dataset);
    alert("tSNE Initialization Complete");
    
    for(let k = 0; k < inputs.iterations; k++) {
        tsne.step(); // every time you call this, solution gets better
            drawPoints(tsne.getSolution(), "Learning Rate: " + inputs.epsilon +
                                           "<br>Perplexity: " + inputs.perplexity +
                                           "<br>Iteration: " + k);
    }
    alert("tSNE Complete")
};

// Tell the worker container in the main thread to send an alert
function alert(strMessage) {
    postMessage({command:"alert", content:strMessage});
}

// Tell the worker container in the main thread to draw the points within objectData
function drawPoints(objectData, strMessage) {
    postMessage({command:"drawPoints", content:objectData, logMessage:strMessage});
}