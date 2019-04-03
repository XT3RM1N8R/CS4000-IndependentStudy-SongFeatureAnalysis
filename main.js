database=[];
d3.csv("./Dataset/dataset.csv")
    .row(function(d) { return database.push([+d.acousticness, +d.danceability,
        +d.energy, +d.instrumentalness, +d.liveness, +d.speechiness, +d.tempo, +d.valence]); })
    .get(function(error, rows) {
        console.log(database) //we can get the data in csv file really quick
        data_min=database.slice(0,1000) //i try to test with 1000 data point first.
        startWorker(data_min);

    });



