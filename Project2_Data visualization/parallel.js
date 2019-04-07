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
var selectedGenres=[];
var genres = [];
var genresCount = [];
var data = [];
d3.csv("dataset/dataset_full(optimal).csv",function (error, songs) {
    // console.log('222222222');
    data = songs;
    // get features that used for mutlti-dimension coordinates
    features = songs.columns.slice(1, 9);
    xScale.domain(features);


    // Doing Time Slider
    // Time
    songs.forEach(d=>{
        d.tracks_track_date_created = formatYear(parseTime(d.tracks_track_date_created));
        var gen = d["genre"];
        // Create new element in genres count if the element is in first appears.
        if(!genres.includes(gen)) {
            genres.push(gen);
            genresCount.push(1);
        }
        // // or else increase count for that genres by 1
        // else {
        //     genresCount[genres.indexOf(gen)]++;
        // }
    });
    // console.log(genres);
    // console.log(genresCount);

    var timeRange = d3.extent(songs,d=>{return d.tracks_track_date_created});
    var dataTime = d3.range(Number(timeRange[0]),Number(timeRange[1])+1).map(d=>{
        // console.log(d);
        return d;
    });


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
            graphByYear(songs,sliderTime.value());
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

    // graphByYear(songs,sliderTime.value());


    // Add check boxes of genres
    addCheckBoxes(genres);


});

function chooseOption() {
    var yearChart = document.getElementById("slider-time"),
        genreChart = document.getElementById("container"),
        yearChoice = document.getElementById("year"),
        genreChoice = document.getElementById("genre")

    if(yearChoice.checked)
        yearChart.disabled = true;
    if(genreChoice.checked)
        console.log(genreChart);
}

function graphByGenre() {
    var selectedSongs=[];
    if(this.checked) {
        if(!selectedGenres.includes(this.id)) {
            selectedGenres.push(this.id);
        }
    }
    else {
        if(selectedGenres.includes(this.id)) {
            selectedGenres.splice(selectedGenres.indexOf(this.id),1);
        }
    }
    selectedGenres.forEach(gen=>{
        data.forEach(song=>{
            if(song.genre == gen)
                selectedSongs.push(song);
        })
    });
    drawGraph(selectedSongs);
    console.log(selectedGenres);
}
function addCheckBoxes(array) {
    // console.log(array);
    var container = document.getElementById("container");
    array.forEach(d=>{
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = d;
        checkbox.value = d;
        checkbox.id = d
        checkbox.onclick = graphByGenre;

        var label = document.createElement('label')
        label.htmlFor = d;
        label.appendChild(document.createTextNode(d));

        container.appendChild(checkbox);
        container.appendChild(label)
        container.appendChild(document.createElement("br"));
    })
}

function graphByYear(songs, year) {
    var selectedSongs = [];
    songs.forEach(d=>{
        if(d.tracks_track_date_created == year)
            selectedSongs.push(d);
    });
    graphByYear(selectedSongs);
}

function drawGraph(songs) {
    // console.log(year+ ": "+songs.length);
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
                .text(d.title + " - " + d.genre);
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