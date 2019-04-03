let w;
function startWorker(data,getresult){
    if(typeof(Worker)!== "undefined"){
        if(w===undefined){
            w = new Worker('worker.js');
            w.postMessage(data);
        }
        w.onmessage = function (event){
            console.log(event.data)
        };
    }
    else{
        throw "Browser doesn't support web worker";
    }
}
