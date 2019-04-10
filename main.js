var raw_dataset = [];
var dataset = [];
var audioData = [];
const testSize = 8000; // The size of our test data for development speed
var topGenresAll = [];           // Must not be greater than the size of our precomputed
var topGenres20 = [];            // t-SNE result if we are using it

let features = [];
var selectedGenres = [];
var genres = [];
var genresByYear = {};
// var genresCount = [];

d3.csv("./Dataset/dataset_full(optimal).csv")
    .row(function (d) {
        audioData.push([
            +d.acousticness,
            +d.danceability,
            +d.energy,
            +d.instrumentalness,
            +d.liveness,
            +d.speechiness,
            +d.tempo,
            +d.valence]);
        return d;
    })
    .get(function (error, songData) {
        raw_dataset = songData;     // Save a copy of the raw dataset
        audioData = audioData.slice(0, testSize); // Limit the test data for quick debugging
        dataset = songData.slice(0, testSize);
        dataset.columns = songData.columns;

        // get features that used for mutlti-dimension coordinates
        features = songData.columns.slice(1, 10);
        xScale.domain(features);

        // Doing Time Slider
        // Time
        dataset.forEach(d => {
            var year = d.tracks_track_date_created = formatYear(parseTime(d.tracks_track_date_created));
            features.forEach(feature => {
                if (feature != "genre")
                    d[feature] = +d[feature];
            });
            var gen = d["genre"];
            // Create new element in genres count if the element is in first appears.
            if (!genres.includes(gen)) {
                genres.push(gen);
            }
            //Add genres by each year
            if (!genresByYear.hasOwnProperty(year)) {
                genresByYear[year] = [];
                genresByYear[year].push(d.genre);
            } else {
                if (!genresByYear[year].includes(d.genre))
                    genresByYear[year].push(d.genre);
            }
        });

        topGenresAll = CountGenres(dataset);
        topGenres20 = topGenresAll.slice(0, 20);

        UpdateDataTSNE(bigdata.slice(0, testSize));

        drawSlider();
        graphByYear(dataset, sliderTime.value());

        document.getElementById("genreContainer").style.display = "none";

    });

// Count the genres and return a descending frequency-ordered list of top genres
function CountGenres(data) {    // ***We could optimize this function further, but maybe later
    var genres = [];            // ***I think it has O(N^2) time complexity or more     ~Darien
    var count_genre = [];
    var genre_queue = [];
    //(data) get from d3.csv, push all genre to genres array
    data.forEach(d => { // Build the list of genre occurrences
        genres.push(d.genre);
    });

    var count;
    data.forEach((d) => {
        count = 0;
        if (!genre_queue.includes(d.genre)) {        // If this genre has not been counted
            for (i = 0; i < genres.length; i++) {   // Count the occurrences of this genre
                if (genres[i] === d.genre) {
                    count++;
                }
            }
            genre_queue.push(d.genre);              // Mark this genre as counted
            count_genre.push({genre: d.genre, number: count})    // Add the count of this genre
        }
    });

    //sort count_genre array
    count_genre.sort(function (a, b) {
        return b.number - a.number;
    });

    return count_genre;
}

const width = 700, height = 500,
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


//create zoom handler
var zoom_handler = d3.zoom()
    .on("zoom", zoom);


//specify what to do when zoom event listener is triggered
function zoom() {
    scatterplot.attr("transform", d3.event.transform);
}

//add zoom behaviour to the svg element backing our graph.
zoom_handler(svg);


// Draw a scatterplot from the given t-SNE data
function TSNEDraw_Scatterplot(tsne_data) {
    UpdateDataTSNE(tsne_data);      // Update our data with the given t-SNE data
    Draw_Scatterplot(dataset);    // Draw the scatterplot with the updated data
}


// Update the data with the given t-SNE result
function UpdateDataTSNE(data) {
    data.forEach(function (d, i) {
        dataset[i].x = d[0];  // Add the t-SNE x result to the dataset
        dataset[i].y = d[1];  // Add the t-SNE y result to the dataset
    });
}

// Draw a scatterplot from the given data
function Draw_Scatterplot(data) {
    const xScale = d3.scaleLinear()
        .domain(getExtent(data, "x"))
        .range([0, contentWidth]);
    const yScale = d3.scaleLinear()
        .domain(getExtent(data, "y"))
        .range([0, contentHeight]);

    UpdateNodes(data);

    //DrawLegend(color, topGenres20);

    function UpdateNodes(data) {
        const hoverDelay = 50;
        const radius = 3;
        const opacity = "0.75";


        const selection = scatterplot.selectAll(".compute").data(data);
        //Exit
        selection.exit().remove();
        //Enter
        const newElements = selection.enter()
            .append('circle')
            .attr("class", "compute")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", radius)
            .style("opacity", opacity)
            .style("fill", function (d) {
                if (topGenres20.some(element => element.genre === d.genre)) {
                    return color(d.genre);
                } else {
                    return "black";
                }
            })
            .on("mouseover", function (d) {
                /*d3.select(this)   // Doesn't work
                .append("circle")
                    .attr("cx", d => xScale(d.x))
                    .attr("cy", d => yScale(d.y))
                    .attr("r", radius * 2)
                    .style("fill", "black");*/
                d3.select(this)     // Does work
                    .attr("r", radius * 3);
                d3.select(this)
                    .append("title")
                    .text(function (d) {
                        if (topGenres20.includes(d.genre)) {
                            return "Top Genre: " + d.genre;
                        } else {
                            return "Other Genre: " + d.genre;
                        }
                    })
            })
            .on("mouseout", function (d) {
                /*d3.select(this)   // Doesn't Work
                .select("circle")
                    .remove();*/
                d3.select(this)     // Does work
                    .attr("r", radius);
                d3.select(this)
                    .select("text")
                    .remove();
            });
        //Update
        selection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", radius)
            .style("opacity", opacity)
            .style("fill", function (d) {
                if (topGenres20.some(element => element.genre === d.genre)) {
                    return color(d.genre);
                } else {
                    return "black";
                }
            });
    }
}

/*function DrawLegend(colorScale, values) {

    values.forEach(function(d, i) {
        legend
        .append("rect")
            .attr("x", 5)
            .attr("y", i*5)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => colorScale(d.genre))


    });
}*/

function getExtent(data, key) {
    return d3.extent(data.map(d => d[key]));
}

// Get a set of cluster centroids based on the given data
function getcluster(data) {
    let clusterSet = [];
    let centroids = [];

    //give number of clusters we want
    clusters.k(10);

    //number of iterations (higher number gives more time to converge), defaults to 1000
    clusters.iterations(750);

    //data from which to identify clusters, defaults to []
    clusters.data(data);

    clusterSet = clusters.clusters();
    clusterSet.forEach(function (d) { // Save the centroids of each cluster
        return centroids.push(d.centroid)
    });

    console.log(centroids);
    return centroids;
}