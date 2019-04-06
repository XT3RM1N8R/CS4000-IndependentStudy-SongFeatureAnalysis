// console.log('1111111111');

// Info to show visualization
var width = 900, height = 600,
    margin = {top: 30, right: 20, bottom: 30, left: 30},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

//Time Format and Parsing
const parseTime = d3.timeParse("%m/%d/%Y %H:%M");
const formatYear = d3.timeFormat("%Y");

var svg = d3.select("#chart-area").append("svg").attr("width",width).attr("height",height),
    g = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")"),
    titleGroup = svg.append("g").attr("transform","translate("+(margin.left+20)+","+(margin.top-10)+")");

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
d3.csv("dataset/dataset_full(optimal).csv",function (error, songs) {
    // console.log('222222222');

    // get features that used for mutlti-dimension coordinates
    features = songs.columns.slice(1, 9);
    xScale.domain(features);


    // Doing Time Slider
    // Time

    songs.forEach(d=>{
        d.tracks_track_date_created = formatYear(parseTime(d.tracks_track_date_created));
    });
    var timeRange = d3.extent(songs,d=>{return d.tracks_track_date_created});
    var dataTime = d3.range(Number(timeRange[0]),Number(timeRange[1])+1).map(d=>{
        // console.log(d);
        return d;
    });

    //Slider
    // var slidersvg = d3.select('div#slider').append('svg')
    //     .attr('width', 100)
    //     .attr('height', 50);
    //
    // var slider = slidersvg.append('g')
    //     .classed('slider', true);
    //
    // // using clamp here to avoid slider exceeding the range limits
    // var xScale = d3.scaleLinear()
    //     .domain(range)
    //     .range([0, width - margin.left - margin.right])
    //     .clamp(true);
    //
    // // array useful for step sliders
    // var rangeValues = d3.range(range[0], range[1], step || 1).concat(range[1]);
    // var xAxis = d3.axisBottom(xScale).tickValues(rangeValues).tickFormat(function (d) {
    //     return d;
    // });
    //
    // xScale.clamp(true);


    var sliderTime = d3.sliderBottom()
        .min(timeRange[0])
        .max(timeRange[1])
        .step(1)
        .width(300)
        .tickFormat(d3.format(".0f"))
        .tickValues(dataTime)
        .default(dataTime[0])
        .on('onchange', val => {
            d3.select('p#value-time').text((val));
            drawGraph(songs,sliderTime.value());

        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text((sliderTime.value()));


    drawGraph(songs,sliderTime.value());



});

function drawGraph(allData,year) {
    var songs = [];
    allData.forEach(d=>{
        if(d.tracks_track_date_created == year)
            songs.push(d);
    });
    console.log(songs);
    d3.selectAll(".foreground").remove();
    // Make yScale for each dimension
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
        .attr("id",d=>{return "path"+ d.track_id;})
        .attr("d", path)
        .on("mouseover",d=>{
            foreground.style("opacity","0.1");
            d3.select("#path"+ d.track_id).style("stroke-width","4px").style("opacity","1");
            titleGroup.append("text")
                .attr("class","title")
                .text( "Title: " + d.title);
        })
        .on("mouseout",d=>{
            // console.log("mouse out");
            // brush();
            foreground.style("opacity","0.7");
            d3.select("#path"+ d.track_id).style("stroke-width","1px").style("opacity","0.7");
            d3.selectAll(".title").remove();
        });

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

// Handles a brush event, toggling the display of foreground lines.
function brush() {

    var actives = [];
    svg.selectAll(".brush")
        .filter(function(d) {
            // console.log(d3.brushSelection(this));
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
    // foreground.style("opacity",function(d) {
    //         return actives.every(function(active) {
    //             let result = active.extent[1] <= d[active.feature] && d[active.feature] <= active.extent[0];
    //             if(result)selected.push(d);
    //             return result;
    //         }) ? "1" : "0.1";
    //     });
    foreground.style("display", function(d) {
        return actives.every(function(active) {
            let result = active.extent[1] <= d[active.feature] && d[active.feature] <= active.extent[0];
            if(result)selected.push(d);
            return result;
        }) ? null : "none";
    });
    // (actives.length>0)?out.text(d3.tsvFormat(selected.slice(0,24))):out.text(d3.tsvFormat(sample_data.slice(0,24)));;

}