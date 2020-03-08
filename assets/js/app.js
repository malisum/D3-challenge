// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Global Variables & Main Script to plot the chart(s):
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //


// Delay milli-seconds (2000 = 2 seconds animation delay)
var axisDelay = 2000;
var circleDely = 2000;

// SVG dimensions:
var svgWidth = 900;
var svgHeight = 600;
// Set the chart margins (within svg):
// top margin = 20
// bottom margin = 80 (need more space to put x-axis labels)
// right margin = 40
// left margin = 100 (need more space to put y-axis labels)
var margin = { top: 20, right: 40, bottom: 80, left: 100 };

// Define the key elements for the CSV data & use to refer to the columns instead of hard coded names
// if the CSV chnages then only this object values need to be changed  
var chartKeys = {
    id: "id",
    state:"state",
    stateCode : "abbr",
    poverty: "poverty",
    age: "age",
    income:"income",
    healthcare:"healthcare",
    obesity:"obesity",
    smokes: "smokes"
};

// Define X-Axis Domain Convesion Scale
// Any change to Scaling while getting Doamin Min & Max just need to be made here 
var xDomainScale = {
    minConverter : 0.9,
    maxConverter : 1.1
} 

// Define Y-Axis Domain Convesion Scale
// Any change to Scaling while getting Doamin Min & Max just need to be made here 
var yDomainScale = {
    minConverter : 0.9,
    maxConverter : 1.1
} 

// Calculate the chart dimensions (by adjusting the margins)
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;


// Define the chart grouper & d3 selection:
// The chart has to be placed under: <body> -> <div class="container"> -> <div class="row"> -> <div class="col-xs-12  col-md-9"> -> <div id="scatter">
// Select id="scatter" and append svg
// Define the SVG wrapper 
var scatter = d3.select("#scatter");
var svg = scatter.append("svg")
                 .attr("width", svgWidth)
                 .attr("height", svgHeight);

// Create group as "chartGroup" - This will be the highest level grouper for all the elements that go on the chart
// Use tranform attribute translate to specify the dimensions 
var chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Fetch & chart the data:
// Get the date from CSV (assets/data/data.csv)
// Call rowTransformation function to tranform data read from csv 
// Use createChart to plot the chart (then function is called after data is fetched)
// Catch error while reading the csv file - display "Data error on HTML & Console"
d3.csv("assets/data/data.csv", rowTransformation)
  .then(createChart)
  .catch(function (error) {chartError(error);});


// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Create the Chart/Plot
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createChart(data) {
// Chart the Scatter Plot based on data:

    // Define a Object (Dictionary) to store the data & current chart axis active information 
    var currentChartInfo = {
        data: data,
        currentX: "",
        currentY: "",
        };
        
    // Set default for currentX & currentY to currentChartInfo object 
    currentChartInfo = setDefaultcurrentChartInfo(currentChartInfo);
    
    // Set the X-Axis & Y-Axis to currentChartInfo object:
    currentChartInfo = setAxis(currentChartInfo);
    // Plot the X-Axis & Y-Axis 
    createAxis(currentChartInfo);
    
    // Plot the scatter plot circles based on Current X-Axis & Y-Axis  
    createCircles(currentChartInfo);

    // Plot the Tool tip text 
    createToolTip(currentChartInfo);
    
    // Plot the labels for the Chart
    // createLables()
    
}
// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the Default X & Y Axis for the Chart/Plot
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
// Set the Default X & Y Axis for the Chart/Plot
function setDefaultcurrentChartInfo(currentChartInfo) {

    // Set default X-Axis to Poverty
    currentChartInfo.currentX = chartKeys.poverty;
    // Set default Y-Axis to Healthcare
    currentChartInfo.currentY = chartKeys.healthcare;

    // Return the updated currentChartInfo information 
    return currentChartInfo;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the X-Axis & Y-Axis to currentChartInfo 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setAxis(currentChartInfo) {
// Set the X-Axis & Y-Axis to currentChartInfo object:

    // Set the X-Axis to currentChartInfo object:
    // Set the xScale (Function getXDomain (pass currentChartInfo as parameter)) 
    // Numerical data - Use a Linear Scale 
    // Range is 0 to chart width 
    currentChartInfo.xScale = d3.scaleLinear()
                                .domain(getXDomain(currentChartInfo))
                                .range([0, chartWidth]);
    currentChartInfo.xAxis = d3.axisBottom(currentChartInfo.xScale);
    
    // Set Y-Axis to currentChartInfo object:
    // Set the yScale (Function getYDomain (pass currentChartInfo as parameter)) 
    // Numerical data - Use a Linear Scale 
    // Range is chart height to 0 
    // Note: This is NOT 0 to chart height, it is flipped so that the conversion of values is flipped to
    // - chart the y-axis bottom-to-top instead top-to-bottom 
    currentChartInfo.yScale = d3.scaleLinear()
                                .domain(getYDomain(currentChartInfo))
                                .range([chartHeight, 0])
    currentChartInfo.yAxis = d3.axisLeft(currentChartInfo.yScale);

    // Return currentChartInfo
    return currentChartInfo;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the X-Axis Domain 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function getXDomain(currentChartInfo) {
// Set the X-Axis Domain 
// Use the currentChartInfo X-Axis data to get Min & Max - Use that to set the domain  
    
    // Get the minimum from current X-Axis 
    var min = d3.min(currentChartInfo.data, d => d[currentChartInfo.currentX]);
    // Get the maximum from current X-Axis
    var max = d3.max(currentChartInfo.data, d => d[currentChartInfo.currentX]);

    // Return the min & max in an array
    return [min*xDomainScale.minConverter, max*xDomainScale.maxConverter];
}


// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the Y-Axis Domain 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function getYDomain(currentChartInfo) {
// Set the Y-Axis Domain 
// Use the currentChartInfo Y-Axis data to get Min & Max - Use that to set the domain  

    // Get the minimum from current Y-Axis 
    var min = d3.min(currentChartInfo.data, d => d[currentChartInfo.currentY]);
    // Get the maximum from current Y-Axis
    var max = d3.max(currentChartInfo.data, d => d[currentChartInfo.currentY]);
    
    // Return the 0 & max in an array
    // NOte: Used 0 so that Y-Axis always starts from 0
    return [min*yDomainScale.minConverter, max*yDomainScale.maxConverter];

}

// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Plot the X-Axis & Y-Axis 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createAxis(currentChartInfo) {
// Plot the X-Axis & Y-Axis using the current chart information 

    // Group & Add Y-Axis to the chart (Use .call & set class as "y-axis")  
    chartGroup.append("g")
              .call(currentChartInfo.yAxis)
              .attr("class", "y-axis")

    // Group & Add Y-Axis to the chart (Use .call & set class as "y-axis")  
    // NOte: Transform the X-Axis to move it to Bottom instead of Top
    chartGroup.append("g")
    .call(currentChartInfo.xAxis)
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`)
}


// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Plot the Scatter Circles 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createCircles(currentChartInfo) {
// Plot the Scatter Plot Circles

    // Plot the circles (No circles exist - currently, number if curcles matching data in currentChartInfo will be appended)
    chartGroup.selectAll("circle")
              .data(currentChartInfo.data)
              .enter()
              .append("circle")
              .attr("cx", d => currentChartInfo.xScale(d[currentChartInfo.currentX]))
              .attr("cy", d => currentChartInfo.yScale(d[currentChartInfo.currentY]))
              .attr("r", 10)
              .attr("fill", "#80bfff")
              .attr("opacity", ".75");
}

// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Plot the Tool Tip Text 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createToolTip(currentChartInfo){
// Create the tool tip - Display data on mouseover event 
    
    var label;

    if (currentChartInfo.currentX === chartKeys.poverty) {
    label = "Poverty";
    }
    else {
    label = "TBD";
    }

    var toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([80, -60])
                    .html(function (d) {
                        var html = "X:"
                        + "<br> " + label
                        + d[currentChartInfo.currentX]
                        + "<br> Y: "
                        + d[currentChartInfo.currentY]
                        return html;
                    });

    chartGroup.call(toolTip);

    var circles = d3.selectAll("circle");
    circles.on("mouseover", function (data) {
    toolTip.show(data);
    })

    circles.on("mouseout", function (data, index) {
    toolTip.hide(data);
    });

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Row Tranformation
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function rowTransformation(csvRow) {
    // Gets each row (from data.csv read ) - Performs data transformation and returns the transformed row
    // convert string to number 
    
    // For each row in csv file (csvRow) - Convert/Transform the data 
    // String to Inmt or Float 

    // id - Convert to Int 
    csvRow.id = parseInt(csvRow.id);
    // state - No tranformation
    csvRow.state = csvRow.state; 
    // abbr
    csvRow.abbr = csvRow.abbr; 
    // poverty - Convert to Float
    csvRow.poverty = parseFloat(csvRow.poverty); 
    // povertyMoe (poverty margin of error) - Convert to Float
    csvRow.povertyMoe = parseFloat(csvRow.povertyMoe); 
    // age - Convert to Float
    csvRow.age = parseFloat(csvRow.age); 
    // ageMoe (age margin of error) - Convert to Float
    csvRow.ageMoe = parseFloat(csvRow.ageMoe); 
    // income - Convert to Int 
    csvRow.income = parseInt(csvRow.income);
    // incomeMoe (income margin of error) - Convert to Int 
    csvRow.incomeMoe = parseInt(csvRow.incomeMoe);
    // healthcare - Convert to Float
    csvRow.healthcare = parseFloat(csvRow.healthcare);
    // healthcareLow - Convert to Float
    csvRow.healthcareLow = parseFloat(csvRow.healthcareLow);
    // healthcareHigh - Convert to Float
    csvRow.healthcareHigh = parseFloat(csvRow.healthcareHigh);
    // obesity - Convert to Float
    csvRow.obesity = parseFloat(csvRow.obesity);
    // obesityLow - Convert to Float
    csvRow.obesityLow = parseFloat(csvRow.obesityLow);
    // obesityHigh - Convert to Float
    csvRow.obesityHigh = parseFloat(csvRow.obesityHigh);
    // smokes - Convert to Float
    csvRow.smokes = parseFloat(csvRow.smokes);
    // smokesLow - Convert to Float
    csvRow.smokesLow = parseFloat(csvRow.smokesLow);
    // smokesHigh - Convert to Float
    csvRow.smokesHigh = parseFloat(csvRow.smokesHigh);

    // Return transformed row (csvRow)
    return csvRow;
}
      
    
// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: chartError 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function chartError(dataError) {
    // Log the error:
    errorMsg1 = "********* An unexpected error occured *********";
    errorMsg2 = "The error is: ";
    error = dataError;
    console.log(errorMsg1);
    console.log(errorMsg2);
    console.log(error);
    // Add the error to html (display on UI):
    errorDisplay = [];
    errorDisplay = [errorMsg1, errorMsg2, error]; 
    scatter.selectAll("p")
            .data(errorDisplay)
            .enter()
            .append('p')
            .text(d => d)
            .style("color", "red");
}
    

    
// /********************************************/







// function createChart(hairData) {




//   d3.selectAll(".aText").on("click", function () {
//     handleClick(d3.select(this), currentChartInfo)
//   })

// }
// /********************************************/

// function handleClick(label, currentChartInfo) {

//   var axis = label.attr("data-axis")
//   var name = label.attr("data-name");

//   if (label.classed("active")) {
//     //no need to do anything if clicked on active axis
//     return;
//   }
//   updateLabel(label, axis)

//   // which axis was clicked
//   if (axis === "x") {
//     // set the currentX before calling getXDomain  
//     currentChartInfo.currentX = name;
//     currentChartInfo.xScale.domain(getXDomain(currentChartInfo))
//     renderXAxes(currentChartInfo)
//     renderHorizontal(currentChartInfo)
//   }
//   else //add logic to handle y axis click
//   {
//     // set the currentY before calling getYDomain  
//     currentChartInfo.currentY = name;
//     currentChartInfo.yScale.domain(getYDomain(currentChartInfo))
//     renderYAxes(currentChartInfo)
//     renderVertical(currentChartInfo)
//   }
// }

// /********************************************/

// function createLables() {

//   // create a group and append later 

//   var xlabelsGroup = chartGroup.append("g")
//     .attr("class", "xText")
//     .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

//   // adding data-name & data-axis 
//   // to track name of column  & axis (x or y)
//   // set classes (see css)
//   // see active & inactive 
//   // active - bold 
//   // inactive - gray & on hover - pointer 

//   xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 20)
//     .attr("data-name", "hair_length")
//     .attr("data-axis", "x")
//     .attr("class", "aText active x")
//     .text("Hair Metal Ban Hair Length (inches)");

//   xlabelsGroup.append("text")
//     .attr("x", 0)
//     .attr("y", 40)
//     .attr("data-name", "num_albums")
//     .attr("data-axis", "x")
//     .attr("class", "aText inactive x")
//     .text("# of Albums Released");

//   var ylabelsGroup = chartGroup.append("g")
//     .attr("class", "yText")
//     .attr("transform", " rotate(-90)")

//   ylabelsGroup.append("text")
//     .attr("y", -60)
//     .attr("x", -chartHeight / 2)
//     .attr("dy", "1em")
//     .attr("data-name", "num_hits")
//     .attr("data-axis", "y")
//     .attr("class", "aText active y")
//     .text("Number of Billboard 500 Hits");

// }
// /********************************************/


// /********************************************/
// function renderXAxes(currentChartInfo) {
//   // add the delay animation  
//   chartGroup.select(".x-axis").transition()
//     .duration(axisDelay)
//     .call(currentChartInfo.xAxis);
// }
// /********************************************/
// function renderYAxes() {
//   chartGroup.select(".y-axis").transition()
//     .duration(axisDelay)
//     .call(currentChartInfo.yAxis);
// }


// function renderHorizontal(currentChartInfo) {

//   d3.selectAll("circle")
//     .each(adjustCircles) 

//   // use .each & call fucntion adjustCircles 

//   function adjustCircles(){
//     d3.select(this)
//       .transition()
//       .attr("cx", d => currentChartInfo.xScale(d[currentChartInfo.currentX]))
//       .duration(circleDely)
//   }
// }

// /********************************************/
// function renderVertical(currentChartInfo) {
//   d3.selectAll("circle")
//     .each(function () {
//       d3.select(this)
//         .transition()
//         .attr("cy", d => currentChartInfo.yScale(d[currentChartInfo.currentY]))
//         .duration(circleDely)
//     })
// }

// /********************************************/

// function updateLabel(label, axis) {

//   d3.selectAll(".aText")
//     .filter("." + axis)
//     .filter(".active")
//     .classed("active", false)
//     .classed("inactive", true);

//   label.classed("inactive", false).classed("active", true)
// }

// /********************************************/

// /********************************************/
