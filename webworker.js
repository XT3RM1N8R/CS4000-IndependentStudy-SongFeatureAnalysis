let w;
function startWorker(data,drawresult){
    if(typeof(Worker)!== "undefined"){
        if(w===undefined){
            w = new Worker('worker.js');
            w.postMessage(data);
        }
        w.onmessage = function (event){
            // drawresult(event.data)
            getcluster(event.data)
            draw(getcluster(event.data))
        };

    }
    else{
        throw "Browser doesn't support web worker";
    }
}
