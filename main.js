// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 320;
let graph_3_width = (MAX_WIDTH / 2) +5, graph_3_height = 320;

//<--------------------------------------------- GRAPH 1 ----------------------------------------------------->
let svg = d3.select("#barplot")
    .append("svg")
    .attr("width", graph_1_width)   
    .attr("height", graph_1_height)  
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);  

let countRef = svg.append("g");

d3.csv("../data/video_games.csv").then(function(data) {
    // Clean and strip desired amount of data for barplot
    data = cleanData(data, function(a, b) { return b.count - a.count }, 10);
    // Create a linear scale for the x axis (number of occurrences)
    let x = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d["Global_Sales"]; })])
        .range([0, graph_1_width - margin.left - margin.right]);

    let y = d3.scaleBand()
        .domain(data.map(function(d) { return d["Name"] }))
        .range([0, graph_1_height - margin.top - margin.bottom])
        .padding(0.2);
    
    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    let color = d3.scaleOrdinal()
        .domain(data.map(function(d) { return d["Name"] }))
        .range(d3.quantize(d3.interpolateHcl("#81c2c3", "#66a0e2"), 10));
    
    let bars = svg.selectAll("rect").data(data);

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d["Name"]) })
        .attr("x", x(0))
        .attr("y", function(d) { return y(d["Name"]); })          
        .attr("width", function(d) { return x(d["Global_Sales"]); })
        .attr("height",  y.bandwidth());       

    let counts = countRef.selectAll("text").data(data);

    counts.enter()
        .append("text")
        .merge(counts)
        .attr("x", function(d) { return x(d["Global_Sales"]) + 10; })    
        .attr("y", function(d) { return y(d["Name"]) + 10})       
        .style("text-anchor", "start")
        .text(function(d) { return d["Global_Sales"]});      

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) -220},
                                        ${(graph_1_height - margin.top - margin.bottom) + 20})`) 
        .style("text-anchor", "middle")
        .text("Global Sales (in millions)");

    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(-120, ${(graph_1_height - margin.top - margin.bottom) -330 / 2})`)   
        .style("text-anchor", "middle")
        .text("Name");

    // Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width - margin.left - margin.right -30) / 2}, ${-13})`)   
        .style("text-anchor", "middle")
        .style("font-size", "medium")
        .text("Top 10 Video Games of All Time");
});


//<--------------------------------------------- GRAPH 2 ----------------------------------------------------->
let svg2 = d3.select("#pie")
    .append("svg")
    .attr("width", graph_2_width)   
    .attr("height", graph_2_height)  
    .append("g")
    .attr("transform", `translate(${margin.left +75}, ${margin.top +120})`)

let tooltip = d3.select("#pie")
    .append("div")
    .attr("class", "tooltip")

tooltip.append("div")
    .attr("class", "label");
    
tooltip.append("div")
    .attr("class", "count");

tooltip.append("div")
    .attr("class", "percent");

let title2 = svg2.append("text")
    .attr("transform", `translate(${(graph_1_width - 580 - margin.right) / 2}, ${-143})`)   
    .style("text-anchor", "middle")
    .style("font-size", "medium")

let radius = Math.min(graph_2_width, graph_2_height) /2 -25 

function setData(region) {
    d3.csv("../data/video_games.csv").then(function(data) {
        var genre = {}
        var total = 0
        var percentage = {}

        for (i = 0; i < data.length; i++) {
            if (data[i]["Genre"] in genre) {
                genre[data[i]["Genre"]] += parseInt(data[i][region]);
            } else {
                genre[data[i]["Genre"]] = parseInt(data[i][region]);
            }
            total += parseInt(data[i][region]);
        }
        keys = Object.keys(genre)
        for (i = 0; i < keys.length; i++) {
            percentage[keys[i]] = String(parseInt(genre[keys[i]] / total * 100))+"%"
        }

        let color = d3.scaleOrdinal()
            .domain(Object.values(genre))
            .range(["#C9E561", "#72EFDD", "#52B69A", "#168AAD", "#9BF6FF", "#3dccc7", "#1A759F", "#34A0A4","#76C893", "#B5E48B", "#48BFE3", "#e9ff70"]);

        let pie = d3.pie()
            .value(function(d) {return d.value;})
        
        let final_data = pie(d3.entries(genre)) 

        let arcMaker = d3.arc().innerRadius(0).outerRadius(radius)

        let selection = svg2.selectAll("path")
            .data(final_data)
        
        selection.enter()
            .append("path")
            .merge(selection)
            .transition()
            .duration(1000)
            .attr("d", arcMaker)
            .attr("fill", function(d){return color(d.data.key)}) 
            .attr("stroke", "white")
            .style("stroke-width", "2.5px")
        
        selection.on("mouseover", function(d){
            tooltip.select(".label").html(d.data.key).style("color", "black").style("font-size", "15px");
            tooltip.select(".count").html(d.data.value);
            tooltip.select(".percent").html(percentage[d.data.key])
            tooltip.style("display", "block");
            tooltip.style("opacity", 1);
            tooltip.style("background-color", "#f8f9fa")
            });
        
        selection.on("mousemove", function(d){
            tooltip.style("top", (d3.event.layerY +230) + "px")
                .style("left", (d3.event.layerX -10) + "px");
            });

        selection.on("mouseout", function(d){
            tooltip.style("display", "none");
            tooltip.style("opacity", 0);
            });
        var r = ""
        if (region == "NA_Sales"){
            r = "North America"
        } else if (region == "JP_Sales"){
            r = "Japan"
        } else {
            r = "Europe"
        }
        var s = "Top Genre Sales in " 
        s = s.concat(r)
        title2.text(s); 
            
        selection.exit().remove()

    })

}

//<--------------------------------------------- GRAPH 3 ----------------------------------------------------->
let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width)   
    .attr("height", graph_3_height)  
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);  

let countRef3 = svg3.append("g");

let y_axis_label = svg3.append("g");

let title3 = svg3.append("text")
            .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-10})`)   
            .style("text-anchor", "middle")
            .style("font-size", "medium")

svg3.append("text")
    .attr("transform", `translate(${(graph_3_width - margin.left - margin.right) - 200},
                                    ${(graph_3_height - margin.top - margin.bottom) + 20})`) 
    .style("text-anchor", "middle")
    .text("Number of Games Published");

svg3.append("text")
    .attr("transform", `translate(-120, ${(graph_3_height - margin.top - margin.bottom) -330 / 2})`)   
    .style("text-anchor", "middle")
    .text("Publisher");

function setGraph(genre) {
    d3.csv("../data/video_games.csv").then(function(data) {
        var publisher = {}

        for (i = 0; i < data.length; i++) {
            
            if (data[i]["Genre"] == genre) {

                if (data[i]["Publisher"] in publisher) {
                    publisher[data[i]["Publisher"]] += 1  
                } else {
                    publisher[data[i]["Publisher"]] = 1
                }

            }
        }

        var new_data = Object.keys(publisher).map(function(k) {
            return [k, publisher[k]];
        })
        new_data = new_data.sort(function(a,b) {return b[1]-a[1]}).slice(0,10);

        final_data = {}

        for (i = 0; i < new_data.length; i++) {
            final_data[new_data[i][0]] = new_data[i][1]
        }

        let x = d3.scaleLinear()
                .domain([0, d3.max(new_data, function(d) { return d[1]; })])
                .range([0, graph_3_width - margin.left - margin.right]);

        let y = d3.scaleBand()
                .domain(new_data.map(function(d) { return d[0] }))
                .range([0, graph_3_height - margin.top - margin.bottom])
                .padding(0.2);
        
        let color = d3.scaleOrdinal()
                    .domain(new_data.map(function(d) {return d[0]}))
                    .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

  
        let bars2 = svg3.selectAll("rect").data(d3.entries(final_data));

        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));
   
        bars2.enter()
            .append("rect")
            .merge(bars2)
            .transition()
            .duration(1000)
           .attr("fill", function(d) {return color(d.key)})
           .attr("x", x(0))
            .attr("y", function(d) { return y(d.key); })
            .attr("width", function(d) { return x(d.value); })
            .attr("height",  y.bandwidth());

        let counts3 = countRef3.selectAll("text").data(d3.entries(final_data));
        //Render the text elements on the DOM
        counts3.enter()
            .append("text")
            .merge(counts3)
            .transition()
            .duration(1000)
            .attr("x", function(d) { return x(d.value)+ 10; })    
            .attr("y", function(d) { return y(d.key) + 12})       
            .style("text-anchor", "start")
            .text(function(d) { return d.value; });           
        
        var s = "Top 10 Publishers of " 
        s = s.concat(genre)
        s = s.concat(" Games")
        title3.text(s);

        bars2.exit().remove();
        counts3.exit().remove();
        
    })
}


function cleanData(data, comparator, numExamples) {
    return data.sort(comparator).slice(0, numExamples);
}


setData("NA_Sales")
setData("NA_Sales")
setGraph("Action")