// console.log('1111111111');

// Info to show visualization
var width = 900, height = 600,
    margin = {top: 20, right: 20, bottom: 30, left: 30},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

var svg = d3.select("body").append("svg").attr("width",width).attr("height",height),
    g = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")");

// x and y Scale
var xScale = d3.scalePoint().range([0,contentWidth]),
    yScale = {};

// axises definition
var xAxis = d3.axisBottom(xScale),
    yAxis = d3.axisLeft(yScale).ticks(5);

d3.select(".domain").attr("opacity", 0);

// Axis Group
var xAxisGroup;
// = g.append("g")
//     .attr("transform", "translate(0, " + contentHeight + ")");
// var yAxisGroup = g.append("g");

// Define line
var line = d3.line(),
    //Background and foreground line
    background, foreground;

//drag object
var dragging = {};

let features = [];
// console.log('44444444');
d3.csv("dataset/dataset.csv",function (error, songs) {
    // console.log('222222222');

    // get features that used for mutlti-dimension coordinates
    features = songs.columns.slice(1, 9);
    xScale.domain(features);

    features.forEach(d => {
        yScale[d] = d3.scaleLinear().range([contentHeight, 0])
            .domain(d3.extent(songs, function (fea) {
                return Number(fea[d]);
            }))
        // console.log(temp);
    });

    // Add grey background lines for context.
    // background = g.append("g")
    //     .attr("class", "background")
    //     .selectAll("path")
    //     .data(songs)
    //     .enter().append("path")
    //     .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = g.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(songs)
        .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension.
    xAxisGroup = g.selectAll(".dimension")
        .data(features)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", d => {
            return "translate(" + xScale(d) + ")";
        })
        .call(d3.drag()
            .subject(function(d) { return {x: xScale(d)}; })
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add an axis and title.
    xAxisGroup.append("g")
        .attr("class", "axis")
        .each(function (d) {
            d3.select(this).call(d3.axisLeft(yScale[d]).ticks(5));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", contentHeight + 10)
        .text(function (d) {
            return d;
        });

    // Add and store a brush for each axis.
    xAxisGroup.append("g")
        .attr("class", "brush")
        .each(function (d) {
            yScale[d].brush = d3.brushY(yScale[d])
                .extent([[-10, 0], [10, contentHeight]])
                .on("start", brushstart)
                .on("brush", brush);
            d3.select(this).call(yScale[d].brush);
            // console.log(yScale[d].brush);
        });
});

function brushstart() {
    d3.event.sourceEvent.stopPropagation();
    // var t = d3.event.target;
    // var s = (d3.event.selection);
    // var actives = features.filter(function(p) {
    //     console.log(!yScale[p].brush.empty);
    //     return yScale[p].brush.empty})
    // console.log(actives);
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var s = (d3.event.selection);

    // console.log(s);
    var actives = features.filter(function(p) {
        console.log("HERE"+yScale[p].brush.filter(d3.target));
        return yScale[p].brush.empty;});
    var  extents = actives.map(function(p) { return yScale[p].brush.extent();
    });
    // console.log(actives);
    // foreground.style("display", function(d) {
    //     return actives.every(function(p, i) {
    //         return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    //     }) ? null : "none";
    // });
}


function path(d) {
    // console.log('333333')
    return line(features.map(function(p) {return [position(p), yScale[p](d[p])]; }));
}

function position(d) {
    var v = dragging[d];
    return v == null ? xScale(d) : v;
}
function dragstarted(d) {
    dragging[d] = xScale(d);

    // console.log(dragging[d]);
    // background.attr("visibility", "hidden");
}

function dragged(d) {
    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
    // console.log(dragging[d]);
    foreground.attr("d", path);

    features.sort(function(a, b) { return position(a) - position(b); });
    xScale.domain(features);
    xAxisGroup.attr("transform", function(da) {
        // console.log((da));
        return "translate(" + position(da) + ")"; })
}


function transition(g) {
    return g.transition().duration(500);
}
function dragended(d) {
    console.log("drag end");
    delete dragging[d];
    d3.select(this).attr("transform", "translate(" + xScale(d) + ")");
    transition(foreground).attr("d", path);
    // background
    //     .attr("d", path)
    //     .transition()
    //     .delay(500)
    //     .duration(0)
    //     .attr("visibility", null);

}