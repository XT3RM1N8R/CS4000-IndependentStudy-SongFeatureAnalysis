var express = require('express')
var _tsneez = require('tsneez')
const csv=require('csvtojson')

database=[];
data=[];
const csvFilePath='dataset_full(optimal).csv'

csv()
    .fromFile(csvFilePath)
    .then((d)=>{
        database=d
        database.forEach(d=>{
            data.push([
                +d.acousticness,
                +d.danceability,
                +d.energy,
                +d.instrumentalness,
                +d.liveness,
                +d.speechiness, +d.tempo, +d.valence])
        })

        // Hyper parameters
        let opt = {}
        opt.theta = 0.5 // theta
        opt.perplexity = 30 // perplexity
        const GRADIENT_STEPS = 5000


        var tsneez = new _tsneez.TSNEEZ(opt) // create a tsneez instance

// Initialize data. We have four high dimensional pairwise dissimilar vectors

        tsneez.initData(data)

// A function that applies tsneez algorithm to reduce high dimensional vectors
        function dimensionReduce(vecs) {

            tsneez.initData(vecs)

            for(var k = 0; k < GRADIENT_STEPS ; k++) {
                tsneez.step() // gradient update
                // console.log(`Step : ${k}`)
            }

            var Y = tsneez.Y

            return Y
        }

// Execute dimensionality reduction
        let Y = dimensionReduce(data) // Y is an array of 2-dimensional vectors that you can visualize.
        console.log (Y)

    })



