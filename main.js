var dataset = [];
var data_min = [];
var audioData = [];
const testSize = bigdata.length; // The size of our test data for development speed
var audioData_min = [];
var topGenresAll = [];
var topGenres20 = [];

d3.csv("./Dataset/dataset_full(optimal).csv")
    .row(function(d) {
        dataset.push(d);
        return d;/*audioData.push([
            +d.acousticness,
            +d.danceability,
            +d.energy,
            +d.instrumentalness,
            +d.liveness,
            +d.speechiness, +d.tempo, +d.valence]);*/ })
    .get(function(error, songs) {
        audioData_min = audioData.slice(0,testSize); // Limit the test data for quick debugging
        data_min = dataset.slice(0,testSize);
    
        // console.log('222222222');
        // get features that used for mutlti-dimension coordinates
        features = songs.columns.slice(1, 13);
        features.splice(8,3);
        xScale.domain(features);
    
    
        // Doing Time Slider
        // Time
        songs.forEach(d=>{
            var year = d.tracks_track_date_created = formatYear(parseTime(d.tracks_track_date_created));
            features.forEach(feature=>{
                if (feature != "genre")
                    d[feature] = +d[feature];
            });
            var gen = d["genre"];
            // Create new element in genres count if the element is in first appears.
            if(!genres.includes(gen)) {
                genres.push(gen);
                // genresCount.push(1);
            }
            // // or else increase count for that genres by 1
            // else {
            //     genresCount[genres.indexOf(gen)]++;
            // }
            //
            //Add genres by each year
            if(!genresByYear.hasOwnProperty(year)) {
                genresByYear[year] = [];
                genresByYear[year].push(d.genre);
            }
            else {
                if (!genresByYear[year].includes(d.genre))
                    genresByYear[year].push(d.genre);
            }
        });
    
        data = songs;
        // console.log(genresByYear["2008"]);
        // console.log(genresCount);
        drawSlider();
    
    
        graphByYear(data,sliderTime.value());
    
        document.getElementById("genreContainer").style.display = "none";
    
    
    
        /*startWorker({dataset:audioData_min,
                     epsilon: 1,        // epsilon is learning rate (10 = default)
                     perplexity: 30,    // roughly how many neighbors each point influences (30 = default)
                     iterations: 500});*/
        alert("Data Size: " + bigdata.length);
        
        topGenresAll = CountGenres(data_min);
        topGenres20 = topGenresAll.slice(0,20);
        Draw_Scatterplot(bigdata);
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
        if(!genre_queue.includes(d.genre)) {        // If this genre has not been counted
            for (i = 0; i < genres.length; i++) {   // Count the occurrences of this genre
                if (genres[i] === d.genre) {
                    count++;
                }
            }
            genre_queue.push(d.genre);              // Mark this genre as counted
            count_genre.push({genre:d.genre, number:count})    // Add the count of this genre
        }
    });

    //sort count_genre array
    count_genre.sort( function ( a, b ) { return b.number - a.number; } );

    return count_genre;
}

const width = 800, height = 800,
    margin = {left: 20, top: 20, right: 20, bottom: 20},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

const svg = d3.select("#theGraph")
            .append("svg")
                .attr("width", width)
                .attr("height", height);

var legend = svg
             .append("rect")
                .attr("width", 75)
                .attr("height", 275)
                .attr("x", 0)
                .attr("y", 0)
                .style("fill", "#dae4e8");

const scatterplot = svg
                    .append("g")
                      .attr("transform", `translate(${margin.left}, ${margin.right})`)
                      .attr("id", "snodes");


// Draw a scatterplot from the given t-SNE data
function Draw_Scatterplot(tsne_data) {
    UpdateDataTSNE(tsne_data);      // Update our data with the given t-SNE data
    _Draw_Scatterplot(data_min);    // Draw the scatterplot with the updated data
}


// Update the data with the given t-SNE result
function UpdateDataTSNE(data) {
    data.forEach(function(d, i) {
        data_min[i].x = d[0];  // Add the t-SNE x result to the dataset
        data_min[i].y = d[1];  // Add the t-SNE y result to the dataset
    });
}

// Draw a scatterplot from the given data
function _Draw_Scatterplot(data){
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
                                .style("fill", function(d) {
                                    if (topGenres20.some(element => element.genre === d.genre)) {
                                        return color(d.genre);
                                    } else {
                                        return "black";
                                    }
                                })

                                .on("mouseover", function(d) {
                                    /*d3.select(this)   // Doesn't work
                                    .append("circle")
                                        .attr("cx", d => xScale(d.x))
                                        .attr("cy", d => yScale(d.y))
                                        .attr("r", radius * 2)
                                        .style("fill", "black");*/
                                    d3.select(this)     // Does work
                                        .attr("r", radius * 2);
                                    d3.select(this)
                                    .append("title")
                                        .text(function(d) {
                                            if (topGenres20.includes(d.genre)) {
                                                return "Top Genre: " + d.genre;
                                            } else {
                                                return "Other Genre: " + d.genre;
                                            }
                                        })
                                //         .attr("x", d.x)
                                //         .attr("y", d.y)
                                //         .style("font-size", "500%"); // This didn't solve the visibility issue :(
                                })
                                .on("mouseout", function(d) {
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
            .attr("cy", d => yScale(d.y)).attr("r", 3);
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
function getcluster(data){
    let clusterSet = [];
    let centroids = [];

    //give number of clusters we want
    clusters.k(10);

    //number of iterations (higher number gives more time to converge), defaults to 1000
    clusters.iterations(750);

    //data from which to identify clusters, defaults to []
    clusters.data(data);

    clusterSet = clusters.clusters();
    clusterSet.forEach(function(d){ // Save the centroids of each cluster
        return centroids.push(d.centroid)
    });

    console.log(centroids);
    return centroids;
}