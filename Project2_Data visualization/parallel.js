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


// Axis Group
var xAxisGroup;

// Define line
var line = d3.line(),
    //Background and foreground line
    foreground;

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
    // Add blue foreground lines for focus.
    foreground = g.append("g")
        .attr("class", "foreground")
        .attr("opacity","0.7")
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
            d3.select(this).call(yScale[d].brush = d3.brushY()
                .extent([[-10, 0], [10, contentHeight]])
                .on("brush", brush)
                .on("end", brush)
             );
        });
});

function brushstart() {
    d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {

    var actives = [];
    svg.selectAll(".brush")
        .filter(function(d) {
            yScale[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
            actives.push({
                feature: d,
                extent: d3.brushSelection(this).map(yScale[d].invert)
            });
        });

    var selected = [];
    // Update foreground to only display selected values
    foreground.style("display", function(d) {
        return actives.every(function(active) {
            let result = active.extent[1] <= d[active.feature] && d[active.feature] <= active.extent[0];
            if(result)selected.push(d);
            return result;
        }) ? null : "none";
    });
    // (actives.length>0)?out.text(d3.tsvFormat(selected.slice(0,24))):out.text(d3.tsvFormat(sample_data.slice(0,24)));;

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
    foreground.attr("opacity","0.2");
}

function dragged(d) {
    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
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

    foreground.attr("opacity","0.7");

}