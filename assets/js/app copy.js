// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Global Variables & Main Script to plot the chart(s):
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //

// Delay milli-seconds (2000 = 2 seconds animation delay)
var axisDelay = 2000;
var circleDelay = 2000;

// SVG dimensions:
var svgWidth = 900;
var svgHeight = 600;
// Set the chart margins (within svg):
// top margin = 20
// bottom margin = 80 (need more space to put x-axis labels)
// right margin = 40
// left margin = 100 (need more space to put y-axis labels)
var margin = { top: 20, right: 40, bottom: 80, left: 100 };

// Marging between X-Axis labels
var xLabelMargin = 20;
// Marging between X-Axis labels
var yLabelMargin = 20;

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

// Define the description corresponding to key elements for the CSV data & use to refer to the columns instead of hard coded names
// if the CSV chnages then only this object values need to be changed 
// This is used for tooltip labels xTTLabel & yTTLabel  
var chartKeysDesc = {
    id: "ID",
    state:"State",
    stateCode : "State Code",
    poverty: "Poverty",
    age: "Age",
    income:"Income",
    healthcare:"Healthcare",
    obesity:"Obesity",
    smokes: "Smokes"
};

// Define the extended description corresponding to key elements for the CSV data & use to refer to the columns instead of hard coded names
// if the CSV chnages then only this object values need to be changed 
// This is used for X & Y Axis labels   
var chartKeysLabelDesc = {
    id: "ID",
    state:"State",
    stateCode : "State Code",
    poverty: "In Poverty (%)",
    age: "Age (Median)",
    income:"Household Income (Median)",
    healthcare:"Lacks Healthcare (%)",
    obesity:"Obese (%)",
    smokes: "Smokes (%)"
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
    currentChartInfo = setCurrentChartXYInfo("", "", currentChartInfo);
    
    // Set the X-Axis & Y-Axis to currentChartInfo object:
    currentChartInfo = setAxis(currentChartInfo);
    // Plot the X-Axis & Y-Axis 
    createAxis(currentChartInfo);
    
    // Plot the scatter plot circles based on Current X-Axis & Y-Axis  
    createCircles(currentChartInfo);

    // Plot the Tool tip text 
    createToolTip(currentChartInfo);
    
    // Plot the X-Axis & Y-Axis labels for the Chart
    createlabels(currentChartInfo);

    // D3 select the X-Axis & Y-Axis click event (class = .aText): 
    // Pass this(label clicked) & currentChartInfo to the handling function: 
    d3.selectAll(".aText").on("click", function () {
        handleClick(d3.select(this), currentChartInfo)
    })

    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Hanlde Click (X-Axis or Y-Axis (class = .aText))
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function handleClick(labelClicked, currentChartInfo) {
// Hanlde Click (X-Axis or Y-Axis (class = .aText))

    // labelClassActive (class of the label clicked)
    labelClassActive = labelClicked.classed("active");

    // If the clicked axis is active - Do Nothing (already active) 
    // Else - Reset the chart
    if (labelClassActive == true) {
        // Do Nothing & return 
        return; 
    }
    else {
        resetChart(labelClicked, currentChartInfo);
    }
    
    // Return
    return;
}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the Default X & Y Axis for the Chart/Plot
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setCurrentChartXYInfo(selectedX, selectedY, currentChartInfo) {
// Set the Default X & Y Axis for the Chart/Plot

// "" is passed to set Default 
// "*NoChange" is passed if no change in that axis 
// Value is passed to change current X or Y Axis 

    if (selectedX == '*NoChange') {
        // Skip - No change 
    }
    else 
    {
        // Poverty
        // Set default X-Axis to Poverty
        if ((selectedX == "") || (selectedX == chartKeys.poverty)) {
            currentChartInfo.currentX = chartKeys.poverty;
        }
        // Age
        if (selectedX == chartKeys.age) {
            currentChartInfo.currentX = chartKeys.age;
        }
        // Income
        if (selectedX == chartKeys.income) {
            currentChartInfo.currentX = chartKeys.income;
        }
    }

    if (selectedY == '*NoChange') {
        // Skip - No change 
    }
    else 
    {
        // Healthcare 
        // Set default Y-Axis to Healthcare
        if ((selectedY == "") || (selectedY == chartKeys.healthcare)) {
            currentChartInfo.currentY = chartKeys.healthcare;
        }
        // Income
        if (selectedY == chartKeys.obesity) {
            currentChartInfo.currentY = chartKeys.obesity;
        }
        // Smokes
        if (selectedY == chartKeys.smokes) {
            currentChartInfo.currentY = chartKeys.smokes;
        }
        
    }
    
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
    // Note: Used 0 so that Y-Axis always starts from 0
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

    // Return
    return;

}


// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Plot the Scatter Circles 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createCircles(currentChartInfo) {
// Plot the Scatter Plot Circles

    // Plot the circles 
    chartGroup.selectAll("circle")
              .data(currentChartInfo.data)
              .enter()
              .remove();
    
    chartGroup.selectAll("circle")
              .data(currentChartInfo.data)
              .enter()
              .append("circle")
              .attr("cx", d => currentChartInfo.xScale(d[currentChartInfo.currentX]))
              .attr("cy", d => currentChartInfo.yScale(d[currentChartInfo.currentY]))
              .attr("r", 10)
              .attr("fill", "#80bfff")
              .attr("opacity", ".75");
    
    // Return
    return;

}

// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Plot the Tool Tip Text 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createToolTip(currentChartInfo){
// Create the tool tip - Display data on mouseover event 
    
    // xTTLabel & yTTLabel will hold the label for tool tip text based on currentX & currentY selected
    var xTTLabel = "";
    xTTLabel = setXTTLabel(currentChartInfo);
    var yTTLabel = "";
    yTTLabel = setYTTLabel(currentChartInfo);
    // Prefix & Suffix for tool tip values (Like $ for income, Yrs for Age and % for Poverty)
    var xTTLabelPrefix = "";
    var xTTLabelSuffix = "";
    var yTTLabelPrefix = "";
    var yTTLabelSuffix = "";
    xTTLabelPrefixSuffix = setXTTLabelPrefixSuffix(currentChartInfo);
    yTTLabelPrefixSuffix = setYTTLabelPrefixSuffix(currentChartInfo);
    var xTTLabelPrefix = xTTLabelPrefixSuffix[0];
    var xTTLabelSuffix = xTTLabelPrefixSuffix[1];
    var yTTLabelPrefix = yTTLabelPrefixSuffix[0];
    var yTTLabelSuffix = yTTLabelPrefixSuffix[1];

    // Set the HTML for D3 Tip Text 
    var toolTip = d3.tip()
                    .attr("class", "tooltip")
                    .offset([80, -60])
                    .html(function (d) {
                        var html = d.state
                        + "<br> " + xTTLabel + ": "
                        + xTTLabelPrefix
                        + d[currentChartInfo.currentX]
                        + xTTLabelSuffix
                        // + "%"
                        + "<br> " + yTTLabel + ": "
                        + yTTLabelPrefix
                        + d[currentChartInfo.currentY]
                        + yTTLabelSuffix
                        // + "%"
                        return html;
                    });

    // Call D3 Tool Tip                
    chartGroup.call(toolTip);

    // Display the tool tip text on mouseover event 
    var circles = d3.selectAll("circle");
    circles.on("mouseover", function (data) {
    toolTip.show(data);
    })

    // Hide the tool tip text on mouseout event
    circles.on("mouseout", function (data, index) {
    toolTip.hide(data);
    });

    // Return
    return;

}

// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the label for X-Axis Tool Tip Text 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setXTTLabel(currentChartInfo){
// Set the label for X-Axis Tool Tip Text

    // Default the X-Axis Tool Tip Label 
    var xTTLabel = "";
    
    // Set the X-Axis Tool Tip Label based on currentX 
    switch(currentChartInfo.currentX) {
        case chartKeys.poverty:
            xTTLabel = chartKeysDesc.poverty;
            break; 
        case chartKeys.age:
            xTTLabel = chartKeysDesc.age;
            break;
        case chartKeys.income:
            xTTLabel = chartKeysDesc.income;
            break;
        default:
            xTTLabel = "Error (Unidentified X-Axis)"
    };
    
    // Return the X-Axis Tool Tip Label 
    return xTTLabel;
    
}
// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the label for X-Axis Tool Tip Text
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setYTTLabel(currentChartInfo){
// Set the label for Y-Axis Tool Tip Text

    // Default the X-Axis Tool Tip Label 
    var yTTLabel = "";
    
    // Set the Y-Axis Tool Tip Label based on currentY 

    // Set the xTTLabel (based on currentX)
    switch(currentChartInfo.currentY) {
        case chartKeys.healthcare:
            yTTLabel = chartKeysDesc.healthcare;
            break; 
        case chartKeys.obesity:
            yTTLabel = chartKeysDesc.obesity;
            break;
        case chartKeys.smokes:
            yTTLabel = chartKeysDesc.smokes;
            break;
        default:    
            yTTLabel = "Error (Unidentified Y-Axis)"
    };

    // Return the Y-Axis Tool Tip Label
    return yTTLabel;
}

// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the label Prefix & Suffix for for X-Axis Tool Tip Text 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setXTTLabelPrefixSuffix(currentChartInfo){
// Set the label value for X-Axis Tool Tip Text

    // Default the X-Axis Tool Tip Label Suffix & Prefix 
    var xTTLabelPrefix = "";
    var xTTLabelSuffix = "";
    var xTTLabelPrefixSuffix = [];
    
    // Set based on currentX 
    switch(currentChartInfo.currentX) {
        case chartKeys.poverty:
            xTTLabelPrefix = "";
            xTTLabelSuffix = "%";
            break; 
        case chartKeys.age:
            xTTLabelPrefix = "";
            xTTLabelSuffix = " Yrs";
            break;
        case chartKeys.income:
            xTTLabelPrefix = "$ ";
            xTTLabelSuffix = "";
            break;
        default:
            xTTLabelPrefix = "Error (Unidentified X-Axis)"
            xTTLabelSuffix = "Error (Unidentified X-Axis)"

    };

    // Set the list for return 
    xTTLabelPrefixSuffix = [xTTLabelPrefix, xTTLabelSuffix];

    // Return the X-Axis Tool Tip Label 
    return xTTLabelPrefixSuffix;
    
}
// ************************************************************************************************************************************************ //    
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Set the label Prefix & Suffix for for Y-Axis Tool Tip Text 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setYTTLabelPrefixSuffix(currentChartInfo){
// Set the label value for Y-Axis Tool Tip Text

    // Default the X-Axis Tool Tip Label Suffix & Prefix 
    var yTTLabelPrefix = "";
    var yTTLabelSuffix = "";
    var yTTLabelPrefixSuffix = [];
    
    // Set based on currentY 

    // Set the xTTLabel (based on currentX)
    switch(currentChartInfo.currentY) {
        case chartKeys.healthcare:
            yTTLabelPrefix = "";
            yTTLabelSuffix = "%";
            break; 
        case chartKeys.obesity:
            yTTLabelPrefix = "";
            yTTLabelSuffix = "%";
            break;
        case chartKeys.smokes:
            yTTLabelPrefix = "";
            yTTLabelSuffix = "%";
            break;
        default:    
            yTTLabelPrefix = "Error (Unidentified Y-Axis)"
            yTTLabelSuffix = "Error (Unidentified Y-Axis)"

    };

    // Set the list for return 
    yTTLabelPrefixSuffix = [yTTLabelPrefix, yTTLabelSuffix];

    // Return the Y-Axis Tool Tip Label
    return yTTLabelPrefixSuffix;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Create X-Axis & Y-Axis Labels
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function createlabels(currentChartInfo) {
// Create X-Axis & Y-Axis Labels

    // X-Axis:
    // Dictionary for Xlabels 
    xLabelClass = {};
    // Create a group for XLabels within chartGroup and append the label text to it
    // x = chartWidth/2
    // y = chartHeight + 20 
    var xlabelsGroup = chartGroup.append("g")
                                 .attr("class", "xText")
                                 .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
    // Get the label data-name element, label class & label text  
    // This gived the data elements name per X-Axis label and sets the class to inactive or active based on currentX
    xLabelClass = setXLabelsAttr(currentChartInfo);
    // Plot the X-Axis Labels to xlabelsGroup using attributes from xLabelClass 
    addXLabels(xlabelsGroup, xLabelClass);    

    // Y-Axis:
    // Dictionary for Ylabels 
    yLabelClass = {};
    // Create a group for YLabels within chartGroup and append the label text to it
    // Tranform to rotate it left 90 degrees - So the text appears vertical    
    var ylabelsGroup = chartGroup.append("g")
                                 .attr("class", "yText")
                                 .attr("transform", " rotate(-90)")
    // Get the label data-name element, label class & label text  
    // This gives the data elements name per Y-Axis label and sets the class to inactive or active based on currentY
    yLabelClass = setYLabelsAttr(currentChartInfo);
    // Plot the Y-Axis Labels to ylabelsGroup using attributes from yLabelClass 
    addYLabels(ylabelsGroup, yLabelClass);    

    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: X-Axis labels attributes 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setXLabelsAttr(currentChartInfo) {
// Set X-Axis Label attributes

    // Dictionary for storing label data name, label class & label text  
    xLabelClass = {};

    // x position 
    xLabelClass.povertyX = 0;
    xLabelClass.ageX = 0;
    xLabelClass.incomeX = 0;
    // y position 
    xLabelClass.povertyY = 20;
    xLabelClass.ageY = xLabelClass.povertyY + xLabelMargin;
    xLabelClass.incomeY = xLabelClass.ageY + xLabelMargin;

    // Label data names 
    xLabelClass.povertyDataName = chartKeys.poverty;
    xLabelClass.ageDataName = chartKeys.age;
    xLabelClass.incomeDataName = chartKeys.income;

    // data-axis
    xLabelClass.povertyDataAxis = "x";
    xLabelClass.ageDataAxis = "x";
    xLabelClass.incomeDataAxis = "x";

    // Label Class
    //  Active X-Axis = "aText active x" & Inactive X-Axis = "aText inactive x"
    // CSS sets the active to bold & inactive to gray 
    // Poverty:
    if (currentChartInfo.currentX === chartKeys.poverty) {
        xLabelClass.povertyLabelClass = "aText active x"
    }
    else (
        xLabelClass.povertyLabelClass = "aText inactive x"
    )
    // Age
    if (currentChartInfo.currentX === chartKeys.age) {
        xLabelClass.ageLabelClass = "aText active x"
    }
    else (
        xLabelClass.ageLabelClass = "aText inactive x"
    )
    // Income
    if (currentChartInfo.currentX === chartKeys.income) {
        xLabelClass.incomeLabelClass = "aText active x"
    }
    else (
        xLabelClass.incomeLabelClass = "aText inactive x"
    )
    
    // Label Text 
    xLabelClass.povertyLabelText = chartKeysLabelDesc.poverty;
    xLabelClass.ageLabelText = chartKeysLabelDesc.age;
    xLabelClass.incomeLabelText = chartKeysLabelDesc.income;

    // Return the X-Axis label attributes 
    return xLabelClass;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Create X-Axis Labels
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function addXLabels(xlabelsGroup, xLabelClass) {
// Create X-Axis &Labels

    // xlabelsGroup has the group in chartGroup where the X-Axis labels are to be appended
    // xLabelClass has the attributes needed to define the labels per X-Axis options 

    // Append Poverty X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", xLabelClass.povertyX)
                .attr("y", xLabelClass.povertyY)
                .attr("data-name", xLabelClass.povertyDataName)
                .attr("data-axis", xLabelClass.povertyDataAxis)
                .attr("class", xLabelClass.povertyLabelClass)
                .text(xLabelClass.povertyLabelText);

    // Append Age X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", xLabelClass.ageX)
                .attr("y", xLabelClass.ageY)
                .attr("data-name", xLabelClass.ageDataName)
                .attr("data-axis", xLabelClass.ageDataAxis)
                .attr("class", xLabelClass.ageLabelClass)
                .text(xLabelClass.ageLabelText);

    // Append Income X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", xLabelClass.incomeX)
                .attr("y", xLabelClass.incomeY)
                .attr("data-name", xLabelClass.incomeDataName)
                .attr("data-axis", xLabelClass.incomeDataAxis)
                .attr("class", xLabelClass.incomeLabelClass)
                .text(xLabelClass.incomeLabelText);

    // Return
    return;
}


// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Y-Axis labels attributes 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function setYLabelsAttr(currentChartInfo) {
// Set Y-Axis Label attributes

    // Dictionary for storing label data name, label class & label text  
    yLabelClass = {};

    // x position 
    // Note: multiply by -1 (to go left of chart axis)
    yLabelClass.healthcareX = (chartHeight / 2)* -1;
    yLabelClass.obesityX = (chartHeight / 2)* -1;
    yLabelClass.smokesX = (chartHeight / 2)* -1;

    // y position 
    // Note: negative value to go down from left corner 
    yLabelClass.healthcareY = -20;
    yLabelClass.obesityY = yLabelClass.healthcareY - yLabelMargin;
    yLabelClass.smokesY = yLabelClass.obesityY - yLabelMargin;

    // Label data names 
    yLabelClass.healthcareDataName = chartKeys.healthcare;
    yLabelClass.obesityDataName = chartKeys.obesity;
    yLabelClass.smokesDataName = chartKeys.smokes;

    // data-axis
    yLabelClass.healthcareDataAxis = "y";
    yLabelClass.obesityDataAxis = "y";
    yLabelClass.smokesDataAxis = "y";

    // Label Class
    //  Active X-Axis = "aText active x" & Inactive X-Axis = "aText inactive x"
    // CSS sets the active to bold & inactive to gray 
    // healthcare:
    if (currentChartInfo.currentY === chartKeys.healthcare) {
        yLabelClass.healthcareLabelClass = "aText active y"
    }
    else (
        yLabelClass.healthcareLabelClass = "aText inactive y"
    )
    // obesity
    if (currentChartInfo.currentY === chartKeys.obesity) {
        yLabelClass.obesityLabelClass = "aText active y"
    }
    else (
        yLabelClass.obesityLabelClass = "aText inactive y"
    )
    // smokes
    if (currentChartInfo.currentY === chartKeys.smokes) {
        yLabelClass.smokesLabelClass = "aText active y"
    }
    else (
        yLabelClass.smokesLabelClass = "aText inactive y"
    )
    
    // Label Text 
    yLabelClass.healthcareLabelText = chartKeysLabelDesc.healthcare;
    yLabelClass.obesityLabelText = chartKeysLabelDesc.obesity;
    yLabelClass.smokesLabelText = chartKeysLabelDesc.smokes;

    // Return the X-Axis label attributes 
    return yLabelClass;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Create Y-Axis Labels
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function addYLabels(xlabelsGroup, yLabelClass) {
// Create X-Axis &Labels

// xlabelsGroup has the group in chartGroup where the X-Axis labels are to be appended
// yLabelClass has the attributes needed to define the labels per X-Axis options 
    // Append healthcare X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", yLabelClass.healthcareX)
                .attr("y", yLabelClass.healthcareY)
                .attr("data-name", yLabelClass.healthcareDataName)
                .attr("data-axis", yLabelClass.healthcareDataAxis)
                .attr("class", yLabelClass.healthcareLabelClass)
                .text(yLabelClass.healthcareLabelText);

    // Append obesity X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", yLabelClass.obesityX)
                .attr("y", yLabelClass.obesityY)
                .attr("data-name", yLabelClass.obesityDataName)
                .attr("data-axis", yLabelClass.obesityDataAxis)
                .attr("class", yLabelClass.obesityLabelClass)
                .text(yLabelClass.obesityLabelText);

    // Append smokes X-Axis Label (as text): 
    xlabelsGroup.append("text")
                .attr("x", yLabelClass.smokesX)
                .attr("y", yLabelClass.smokesY)
                .attr("data-name", yLabelClass.smokesDataName)
                .attr("data-axis", yLabelClass.smokesDataAxis)
                .attr("class", yLabelClass.smokesLabelClass)
                .text(yLabelClass.smokesLabelText);
    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Reset X & Y Axis for the Chart/Plot (click event)
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function resetChart(labelClicked, currentChartInfo) {
// Recreate the Chart/Plot based in Axis selection
// This function is called when an axis is clicked (which is different from current active selection)
 
    // name and axis clicked 
    var axisClicked = labelClicked.attr("data-axis");
    var nameClicked = labelClicked.attr("data-name");
 
    // X-Axis was clicked
    if (axisClicked == "x") {
        // update currentX
        currentChartInfo = setCurrentChartXYInfo(nameClicked,"*NoChange", currentChartInfo);
        // Update Axis - Active/Inactive 
        updateLabel(labelClicked, axisClicked);
        // Reset the X-Axis 
        currentChartInfo.xScale.domain(getXDomain(currentChartInfo));
        // Render X-Axis & Horizontal 
        renderXAxis(currentChartInfo);
        renderHorizontal(currentChartInfo);
    }
    // Y-Axis was clicked 
    if (axisClicked == "y") {
        // update currentY
        currentChartInfo = setCurrentChartXYInfo("*NoChange", nameClicked, currentChartInfo);
        // Update Axis - Active/Inactive 
        updateLabel(labelClicked, axisClicked);
        // Reset the Y-Axis 
        currentChartInfo.yScale.domain(getYDomain(currentChartInfo));
        // Render Y-Axis & Vertical 
        renderYAxis(currentChartInfo);
        renderVertical(currentChartInfo);
    }

    // Re-Plot the Tool tip text 
    resetToolTip(currentChartInfo);

    // Return
    return; 

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Update Label (Reverse Active & Inactive ) 
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function updateLabel(labelClicked, axisClicked) {

    // select current active and update to inactive
    d3.selectAll(".aText")
      .filter("." + axisClicked)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // updated new selected inactive to active
    labelClicked.classed("inactive", false).classed("active", true);

    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Render X-Axis
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function renderXAxis(currentChartInfo) {
  
    // Add the delay animation  
    chartGroup.select(".x-axis")
              .transition()
              .duration(axisDelay)
              .call(currentChartInfo.xAxis);

    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Render Y-Axis
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function renderYAxis(currentChartInfo) {

    chartGroup.select(".y-axis")
              .transition()
              .duration(axisDelay)
              .call(currentChartInfo.yAxis);

    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Render Horizontal (Circle's X Position)
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function renderHorizontal(currentChartInfo) {

    // Select all circles
    d3.selectAll("circle")
      .each(adjustCirclesX) 

    // Use .each & call fucntion adjustCircles to adjust x postion 
    function adjustCirclesX(){
        d3.select(this)
          .transition()
          .attr("cx", d => currentChartInfo.xScale(d[currentChartInfo.currentX]))
          .duration(circleDelay)
    }

    // Return
    return;

}

// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Render Vertical (Circle's Y Position)
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function renderVertical(currentChartInfo) {

    // Select all circles
    d3.selectAll("circle")
      .each(adjustCirclesY) 

    // Use .each & call fucntion adjustCircles to adjust x postion 
    function adjustCirclesY(){
        d3.select(this)
          .transition()
          .attr("cy", d => currentChartInfo.yScale(d[currentChartInfo.currentY]))
          .duration(circleDelay)
    }

    // Return
    return;

}
// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// Function: Reset Tool Tip Text  
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
function resetToolTip(currentChartInfo) {
    
    // Call Create tool tip function - It is based on CurrentX & CurrentY
    createToolTip(currentChartInfo)

    // Return
    return;
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
    
// ************************************************************************************************************************************************ //
// ------------------------------------------------------------------------------------------------------------------------------------------------ //
// ************************************************************************************************************************************************ //
