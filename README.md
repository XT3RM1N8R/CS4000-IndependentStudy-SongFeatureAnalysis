# CS5331-Project-2: SONG GENRE VISUALIZATION

![Demo Gif](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/demo-gif.gif)

Demo Link: https://xt3rm1n8r.github.io/CS4000-IndependentStudy-SongFeatureAnalysis/

## Overview:
This repository is the result of part of an independent study by myself, Darien Sokolov, at Texas Tech University under Dr. Tommy Dang in the Department of Computer Science. This repository came from a fork of a related group project in Data Visualization/Analysis. It has since been modified to meet the needs of my study at the time.

This project takes metadata and temporal audio features for a collection of tracks and applies T-SNE dimensionality reduction to the dataset in the attempt to display clusters of tracks associated by genre in a 2D Scatterplot diagram and a Parallel Coordinate diagram. 

The dataset used is the [FMA Music Dataset](https://github.com/mdeff/fma). The main Javascript library that serves as the foundation for the visual elements in this project is [D3](https://d3js.org/). The Javascript library that powers the T-SNE calculation in realtime is [tSNEJS](https://github.com/karpathy/tsnejs).

This report will explain some of the details of implementation with regards to what I've learned while working on this project.

## Application Use
The web application starts out by prompting users for the data test size. This is the number of tracks that will be analyzed by the T-SNE and ultimately represented visually. If, for some reason, you do not see an alert for this, try refreshing the page. Test Sizes:
- 200-500 tracks will run very quickly; too fast for the live T-SNE calculation to be observed
- 1000 tracks should be slow enough to see the T-SNE calculation run live
- 2000 tracks will be much slower and might take a few minutes
- 8000 tracks could take half an hour or more, and is not recommended for quick viewing
- Anything more than this (up to the 13127 total tracks currently available for complete analysis) can take significantly longer and may crash the application after a long time

![alert-size-prompt.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/alert-size-prompt.png)

Afterwards, there will be two more alerts prompting for the number of features per set and the number of the set that you wish to analyze. These are simply for dividing up the 224 temporal audio features into sets of the specified number, then accessing the subset with the given set index. For example, the default is 224 (all features) and 0, which would result in only 1 set starting at 0 (the only possible set index in this case). Alternatively, 112 would yield a possible set number of 0 and 1, each yielding the first and last 112 features, respectively. It is recommended to simply use the default configuration.

![alert-features-per-set.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/alert-features-per-set.png)
![alert-set-number.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/alert-set-number.png)

The next part proceeds to run the selected features of the selected tracks through the T-SNE. Depending on the amount of tracks selected, it may take a few minutes to see any initial progress for the T-SNE on the Scatterplot, or it may complete immediately.


## Dataset:
- The FMA dataset provides audio from 106,574 tracks from 16,341 artists and 14,854 albums, arranged in a hierarchical taxonomy of 161 genres. It provides full-length and high-quality audio, pre-computed features, together with track- and user-level metadata, tags, and free-form text such as biographies.

- Most of the data used in this project came from the "tracks.csv" and "echonest.csv" files from the FMA dataset.

- In this project, 224 temporal audio features were used instead of the 8 high-level features used in the [ancestor project](https://github.com/Nhatmusic/CS5331-Project-2).

- These features come in notable sets of 12. Their properties and exact meanings were not supplied with the origin dataset collection, but the use of these features was encouraged regardless.

- The values for these features ranged wildly from negative numbers such as -60 to floating point numbers in the high positive hundreds. Some sets had extremely minimal data variance while others were very broad.


## Data-processing:
- Microsoft excel was used to join the data into a single CSV, filter out entries with missing critical data, remove unneeded fields, etc.

- During the application, the data can be dynamically filtered by time, genre, or brushed value range (drag over one of the parallel coordinate graph axes)

- At the beginning of the application, the selected temporal feature data is normalized from 0 to 1 to maintain equal weighting in the T-SNE

## Results
Unfortunately, the temporal audio data extracted from "echonest.csv" proved to be rather disappointing. Strong correlations amongst tracks in the same genre could not be easily identified on the Scatterplot and the Parallel Coordinate diagram. An alternative source of temporal features, "features.csv" was noted, but there was not enough time to process and test this collection. 

## Main Take-Aways:
This part of my independent study strengthened my understanding in a few areas:

### T-SNE Dimensionality Reduction & Live Application
I learned how to apply T-SNE to datasets with variable width and length. I also learned how to display a live T-SNE calculation using a Javascript Webworker and the D3 library.

![webworker-sample.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/webworker-sample.png)

### Data Cleaning and Normalization
I learned the importance of data cleaning to reduce noise in the data, select the most useful information, and prevent undefined behavior. I also learned the importance of normalization in maintaining equal value weighting when performing dimensionality reduction and in regards to optimization of data visualization, with a focus on proper data representation.

![data-normalization-method.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/data-normalization-method.png)

### Layout and Modification of CSS with D3
I maintained a basic understanding of HTML and CSS beforehand, but this project strengthened my understanding of these concepts in regards to dynamic modification of these values using D3, such as filtering the datapoints in realtime by hovering the genre legend during T-SNE calculation.

![tsne-legend-hover.png](https://github.com/XT3RM1N8R/CS4000-IndependentStudy-SongFeatureAnalysis/blob/master/images/tsne-legend-hover.gif)
