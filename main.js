database=[];
data=[]
d3.csv("./Dataset/dataset_full(optimal).csv")
    .row(function(d) {
        data.push(d);
        return database.push([
            +d.acousticness,
            +d.danceability,
            +d.energy,
            +d.instrumentalness,
            +d.liveness,
            +d.speechiness, +d.tempo, +d.valence]); })
    .get(function(error, rows) {
        console.log("About to print dataset");
        //console.log(database) //we can get the data in csv file really quick
        data_min=database.slice(0,1000) // Test with 1000 data point first.
        startWorker({dataset:data_min,
                     epsilon: 1,        // epsilon is learning rate (10 = default)
                     perplexity: 30,    // roughly how many neighbors each point influences (30 = default)
                     iterations: 500});
    });

function getcluster(dataset){
    var result=[];
    var result2=[];
//give number of clusters we want
    clusters.k(10);

//number of iterations (higher number gives more time to converge), defaults to 1000
    clusters.iterations(750);

//data from which to identify clusters, defaults to []
    clusters.data(dataset);

    result=clusters.clusters();
    result.forEach(function(d){
        return result2.push(d.centroid)
    })
    return result2
    console.log(result2)

}

// function draw(tsne_data){
//     var totalscore = [];
//     var links = [];
//     var link2 = [];
//     for (i = 0; i < tsne_data.length - 1; i++) {
//         var scorefinal = [];
//         var link1 = [];
//         for (j = i + 1; j < tsne_data.length; j++) {
//
//             //Calculate distance based on Euclidean Distance
//             scorefinal.push(euclidean(tsne_data[i], tsne_data[j]))
//             link1.push({"source": i, "target": j})
//
//             //Calculate distance based on T-sne output and Euclidean Distance
//             // scorefinal.push(euclideanDistance(tsne_score[i],tsne_score[j]))
//         }
//         totalscore.push(scorefinal)
//         link2.push(link1)
//
//     }
//     data1 = d3.merge(totalscore);
//     links = d3.merge(link2);
//     links.forEach(function (d, i) {
//         d.value = data1[i];
//     });
//     links.forEach(function (d, i) {
//         d.i = i;
//     });
//
//     var nodes=data.slice(0,1000);
//     console.log(nodes)
//     var width = 1000,
//         height = 1000;
//     var colors = colorbrewer.Spectral[9];
//     var dataset=totalscore;
//     var scale = d3.scale.linear().domain([math.min(dataset), math.max(dataset)]).range([0, 1])
//     var colorScale = d3.scale.quantize()
//         .domain([0, 1])
//         .range(colors)
//     var force = d3.layout.force()
//         .charge(-20)
//         .linkDistance(30)
//         .size([width, height]);
//     var x = d3.scale.linear()
//         .domain([0, math.max(totalscore)])
//         .range([280, 450])
//         .clamp(true);
//     var brush = d3.svg.brush()
//         .y(x)
//         .extent([0, 0]);
//     var control2 = d3.select("#controller").append("svg")
//         .attr("width",650)
//         .attr("height",100);
//     var svg = d3.select("#network").append("svg")
//         .attr("width", width)
//         .attr("height", height);
//
//     var links_g = svg.append("g");
//     var nodes_g = svg.append("g");
//
//     control2.append("g")
//         .attr("transform", "translate(0,50) rotate(270)")
//         .attr("class", "x axis")
//         .call(d3.svg.axis()
//             .scale(x)
//             .orient("left")
//             .tickFormat(function (d) {
//                 return d;
//             })
//             .tickSize(0)
//             .tickPadding(5))
//         .select(".domain")
//         .select(function () {
//             return this.parentNode.appendChild(this.cloneNode(true));
//         })
//         .attr("class", "halo");
//     var slider = control2.append("g")
//         .attr("class", "slider")
//         .attr("transform", "translate(0,0),rotate(270)")
//         .call(brush);
//
//     slider.selectAll(".extent,.resize")
//         .remove();
//
//     var handle = slider.append("circle")
//         .attr("class", "handle")
//         .attr("transform", "translate(" + (-50) + ",0)")
//         .attr("r", 5);
//     function brushed() {
//         var value = brush.extent()[0];
//         if (d3.event.sourceEvent) {
//             value = x.invert(d3.mouse(this)[1]);
//             brush.extent([value, value]);
//         }
//         handle.attr("cy", x(value));
//         var threshold = value;
//
//         var thresholded_links = links.filter(function (d) {
//
//             return (d.value <= threshold);
//         });
//         console.log(thresholded_links)
//
//
//         force
//             .links(thresholded_links);
//
//         var active_value;
//         var link = links_g.selectAll(".link")
//             .data(thresholded_links, function (d) {
//                 return d.i;
//             });
//
//         link.enter().append("line")
//             .attr("class", "link")
//             .attr("stroke-width", function (d) {
//                 return Math.sqrt(d.value);})
//             .attr("stroke", function(d) { return 'lightgray' });
//
//
//
//         link.exit().remove();
//
//         force.on("tick", function () {
//             link.attr("x1", function (d) {
//                 return d.source.x;
//             })
//                 .attr("y1", function (d) {
//                     return d.source.y;
//                 })
//                 .attr("x2", function (d) {
//                     return d.target.x;
//                 })
//                 .attr("y2", function (d) {
//                     return d.target.y;
//                 });
//
//             node.attr("cx", function(d) { return d.x; })
//                 .attr("cy", function(d) { return d.y; });
//         });
//
//         force.start();
//     }
//
//     force
//         .nodes(nodes);
//
//
//     brush.on("brush", brushed);
//     slider
//         .call(brush.extent([0, 0]))
//         .call(brush.event);
//
//
//     var node = nodes_g.selectAll(".node")
//         .data(nodes)
//         .enter().append("circle")
//         .attr("class", "node")
//         .attr("r", 3)
//         .style("fill", "steelblue")
//         .call(force.drag);
//     node.append("title")
//         .text(function(d) { return d.genre; });
//
// }

function euclidean(a,b){
var sum = 0
var n
for (n = 0; n < a.length; n++) {
    sum += Math.pow(a[n] - b[n], 2)
}
return math.sqrt(sum)
}



const width = 800, height = 800,
    margin = {left: 20, top: 20, right: 20, bottom: 20},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

const svg = d3.select("#theGraph").append("svg").attr("width", width).attr("height", height);

const maing = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.right})`);

function draw(data){
    const xScale = d3.scaleLinear().domain(getExtent(data, 0)).range([0, contentWidth]);
    const yScale = d3.scaleLinear().domain(getExtent(data, 1)).range([0, contentHeight]);
    const selection = maing.selectAll(".compute").data(data);
    //Exit
    selection.exit().remove();
    //Enter
    const newElements = selection.enter().append('circle').attr("class", "compute").attr("cx", d=>xScale(d[0])).attr("cy", d=>yScale(d[1])).attr("r", 3);
    //Update
    selection.attr("cx", d=>xScale(d[0])).attr("cy", d=>yScale(d[1])).attr("r", 2);
}
function getExtent(data, columnIndex) {
    return d3.extent(data.map(d=>d[columnIndex]));
}


