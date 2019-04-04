let w;
function startWorker(data,drawresult){
    if(typeof(Worker)!== "undefined"){
        if(w===undefined){
            w = new Worker('worker.js');
            w.postMessage(data);
        }
        w.onmessage = function (event){
            // getcluster(event.data)
            console.log(event.data) //show raw-result of t-sne
            draw(event.data) //plot the 2D datapoint.
        };

    }
    else{
        throw "Browser doesn't support web worker";
    }
}
