var legendWidth = 1700, legendHeight = 150,
    legendMargin = {top: 10, right: 10, bottom: 10, left: 200},
    legendConntentWidth = legendWidth - legendMargin.left - legendMargin.right,
    legendContentHeight = legendHeight - legendMargin.top - legendMargin.bottom;

var legendSvg = d3.select("#legend-chart").append("svg").attr("width",legendConntentWidth).attr("height",legendContentHeight),
    legendG = legendSvg.append("g").attr("transform","translate("+legendMargin.left+","+legendMargin.top+")");

function drawLegend(genres) {

    var rectHeight = 10, rectWidth = 90;
    // var textX = rectWidth/2;

    legendG.append("g")
        .attr("class", "legend")
        .selectAll("rect")
        .data(genres)
        .enter()
        .append("rect")
        // .attr("id",d=>{return "path"+ d.track_id;})
        .attr("x", (d, i) => {
            if (i < 10) return i * rectWidth;
            else return (i-10) * rectWidth; })
        .attr("y", (d,i)=>(i<10)?0:rectHeight*2+30)
        .attr("width", rectWidth).attr("height", rectHeight)
        .style("fill", d => colorByTop20Genres(d));

    legendG.append("g")
        .attr("class", "legend")
        .selectAll("text")
        .data(genres)
        .enter()
        .append("text")
        .style("text-anchor","middle")
        .style("font","12px times")
        .attr("x",(d,i)=> {
            if (i < 10) return i * rectWidth + rectWidth/2;
            else return (i-10) * rectWidth + rectWidth/2; })
        .attr("y", (d,i)=>(i<10)?rectHeight+15:(rectHeight+30)*2)
        .text(d=>{
            if(d == "Old-Time / Historic")
                return "Old-Time";
            return d});

}