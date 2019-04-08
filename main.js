var data = [];
var data_min = [];
var audioData = [];
const testSize = 500; // The size of our test data for development speed
var audioData_min = [];

d3.csv("./Dataset/dataset_full(optimal).csv")
    .row(function(d) {
        data.push(d);
        return audioData.push([
            +d.acousticness,
            +d.danceability,
            +d.energy,
            +d.instrumentalness,
            +d.liveness,
            +d.speechiness, +d.tempo, +d.valence]); })
    .get(function(error, rows) {
        audioData_min = audioData.slice(0,testSize); // Limit the test data for quick debugging
        data_min = data.slice(0,testSize);
        startWorker({dataset:audioData_min,
                     epsilon: 1,        // epsilon is learning rate (10 = default)
                     perplexity: 30,    // roughly how many neighbors each point influences (30 = default)
                     iterations: 500});
    });

// Get a set of cluster centroids based on the given data
function getcluster(dataset){
    let clusterSet = [];
    let centroids = [];
    
    //give number of clusters we want
    clusters.k(10);

    //number of iterations (higher number gives more time to converge), defaults to 1000
    clusters.iterations(750);

    //data from which to identify clusters, defaults to []
    clusters.data(dataset);

    clusterSet = clusters.clusters();
    clusterSet.forEach(function(d){ // Save the centroids of each cluster
        return centroids.push(d.centroid)
    });
    
    console.log(centroids);
    return centroids;
}

// Draw a network diagram based on the given data
function Draw_Network(tsne_data){
    let totalscore = [];
    let links = [];
    let link2 = [];
    for (i = 0; i < tsne_data.length - 1; i++) {
        let scorefinal = [];
        let link1 = [];
        for (j = i + 1; j < tsne_data.length; j++) {

            //Calculate distance based on Euclidean Distance
            scorefinal.push(Euclidean(tsne_data[i], tsne_data[j]));
            link1.push({"source": i, "target": j})

            //Calculate distance based on T-sne output and Euclidean Distance
            // scorefinal.push(euclideanDistance(tsne_score[i],tsne_score[j]))
        }
        totalscore.push(scorefinal);
        link2.push(link1)
    }
    
    var data1 = d3.merge(totalscore);
    links = d3.merge(link2);
    links.forEach(function (d, i) {
        d.value = data1[i];
        d.i = i;
    });
    
    const dataset = totalscore;
    var scale = d3.scale.linear()
        .domain([math.min(dataset), math.max(dataset)])
        .range([0, 1]);
    
    const colors = colorbrewer.Spectral[9];
    const colorScale = d3.scale.quantize()
                         .domain([0, 1])
                         .range(colors);
    
    const width = 1000,
          height = 1000;
    var force = d3.layout.force()
                    .charge(-20)
                    .linkDistance(30)
                    .size([width, height]);
    
    var svg = d3.select("#network")
              .append("svg")
                .attr("width", width)
                .attr("height", height);
    
    var x = d3.scale.linear()
                .domain([0, math.max(totalscore)])
                .range([280, 450])
                .clamp(true);
    
    var brush = d3.svg.brush()
        .y(x)
        .extent([0, 0]);

    var links_g = svg
                  .append("g")
                    .attr("id", "links");
    var nodes_g = svg
                  .append("g")
                    .attr("id", "nodes");
    
    var control2 = d3.select("#controller")
                   .append("svg")
                     .attr("width",650)
                     .attr("height",100);
    
    control2
    .append("g")
        .attr("transform", "translate(0,50) rotate(270)")
        .attr("class", "x axis")
        .call(d3.svg.axis()
            .scale(x)
            .orient("left")
            .tickFormat(function (d) {
                return d;
            })
            .tickSize(0)
            .tickPadding(5))
        .select(".domain")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "halo");
    
    var slider = control2
                 .append("g")
                    .attr("class", "slider")
                    .attr("transform", "translate(0,0),rotate(270)")
                    .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    var handle = slider
                 .append("circle")
                    .attr("class", "handle")
                    .attr("transform", "translate(" + (-50) + ",0)")
                    .attr("r", 5);
    
    // Handle the link threshold slider
    function brushed() {
        let threshold;
        if (d3.event.sourceEvent) {
            threshold = x.invert(d3.mouse(this)[1]);
            brush.extent([threshold, threshold]);
        } else {
            threshold = brush.extent()[0];
        }
        
        handle.attr("cy", x(threshold));
        
        // Find the links that satisfy the threshold
        const thresholded_links = links.filter(function (d) {
            return (d.value <= threshold);
        });
        //console.log(thresholded_links);

        force
            .links(thresholded_links);
        
        var link = links_g.selectAll(".link")
            .data(thresholded_links, function (d) {
                return d.i;
            });
        link.enter()
        .append("line")
            .attr("class", "link")
            .attr("stroke-width", function (d) {
                return Math.sqrt(d.value);})
            .attr("stroke", function(d) { return 'lightgray' });
        link.exit().remove();

        force.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });

        force.start();
    }

    force
        .nodes(data_min);

    brush.on("brush", brushed);
    slider
        .call(brush.extent([0, 0]))
        .call(brush.event);

    var node = nodes_g.selectAll(".node")
               .data(data_min)
               .enter()
    .append("circle")
        .attr("class", "node")
        .attr("r", 3)
        .style("fill", "steelblue")
        .call(force.drag);
    node
    .append("title")
        .text(function(d) { return d.genre; });

}

// Calculate the Euclidean Distance between two arrays of the same length
function Euclidean(a,b){
    let sum = 0;
    for (let n = 0; n < a.length; n++) {
        sum += Math.pow(a[n] - b[n], 2)
    }
    return math.sqrt(sum)
}

const width = 800, height = 800,
    margin = {left: 20, top: 20, right: 20, bottom: 20},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

const svg = d3.select("#theGraph")
            .append("svg")
                .attr("width", width)
                .attr("height", height);

const scatterplot = svg
                    .append("g")
                      .attr("transform", `translate(${margin.left}, ${margin.right})`)
                      .attr("id", "snodes");

// Draw a scatterplot from the given data
function Draw_Scatterplot(data){
    const xScale = d3.scale.linear()
                            .domain(getExtent(data, 0))
                            .range([0, contentWidth]);
    const yScale = d3.scale.linear()
                            .domain(getExtent(data, 1))
                            .range([0, contentHeight]);
    
    UpdateNodes(data);
    
    function UpdateNodes(data) {
        const selection = scatterplot.selectAll(".compute").data(data);
        //Exit
        selection.exit().remove();
        //Enter
        const newElements = selection.enter()
                            .append('circle')
                                .attr("class", "compute")
                                .attr("cx", d=>xScale(d[0]))
                                .attr("cy", d=>yScale(d[1]))
                                .attr("r", 3);
        //Update
        selection
            .attr("cx", d=>xScale(d[0]))
            .attr("cy", d=>yScale(d[1])).attr("r", 2);
    }
}

function getExtent(data, columnIndex) {
    return d3.extent(data.map(d=>d[columnIndex]));
}

