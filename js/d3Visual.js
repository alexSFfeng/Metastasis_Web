var boxesChecked = 0;

const X_OFFSET = 100;
const Y_OFFSET = 15;
const Y_OFFSET_TOP = 50;
const MAX_EXPR_VALUE = 50;

// increment the number of checkboxes checked
function incChecked (event){

  // keep track of the data rows checked
  if(event.checked){
    boxesChecked ++;
  }
  else{
    boxesChecked --;
  }

  /* only allow selecting two data rows at a time and only display then
  generate graph button if two rows are selected */
  if(boxesChecked == 2){
    $("input[type='checkbox']:not(:checked)").attr('disabled', true)
    d3.select("#graphBttn").style("display","table-row");
  }
  else{
    $("input[type='checkbox']").attr('disabled',false);
    d3.select("#graphBttn").style("display","none");
  }
}

/* popup modal box reaction */
var popup;

// read the element on load
window.onload = function(){
  popup = document.getElementById("modal");
}

/*
function requestForGraphData(geneA,geneB){
$.ajax({
url : [enter dbconnect target here],
method : "post",
data : {
targetGenes : [geneA, geneB]
}
success : function(res){
generateGraph(res);
alert("graph generated");
},
error : function(res){
alert("failed to generate graph");
}
});
}
*/

// generating the graph
function generateGraph(dataArr){

  // graph traits
  var data = [ {geneA: 10, geneB: 23},
    {geneA: 50, geneB: 9},
    {geneA: 14, geneB: 33},
    {geneA: 12, geneB: 24},
    {geneA: 28, geneB: 5},
    {geneA: 23, geneB: 12},
    {geneA: 40, geneB: 16},
    {geneA: 30, geneB: 20} ];
    var height = 600;
    var width = 600;

    for(var i = 0; i < 100000; i++){
      var aValue = Math.floor(Math.random() * 30)+8;
      var bValue = Math.floor(Math.random() * 20)+20;
      var dataPt = {geneA : aValue, geneB : bValue};
      data.push(dataPt);
    }

    // setup x
    var xValue = function(d) { return d.geneA;}, // data -> value
    xScale = d3.scaleLinear().domain([0,MAX_EXPR_VALUE])
    .range([0, width-X_OFFSET]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom(xScale).ticks(10);

    // setup y
    var yValue = function(d) { return d.geneB;}, // data -> value
    yScale = d3.scaleLinear().domain([0,MAX_EXPR_VALUE])
    .range([height-Y_OFFSET, Y_OFFSET_TOP]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft(yScale).ticks(10);

    // creating the canvas
    var canvas = d3.select(".graphContainer").append("svg")
    .attr("width",width).attr("height",height)
    .style("border", "1px black solid")
    .append("g")
    .attr("transform","translate(50,-20)");

    // x-axis
    canvas.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (height-Y_OFFSET) + ")")
    .call(xAxis);

    // x label
    canvas.append("text")
    .attr("transform", "translate(" + ((width-200)/2) + " ,"+(height+Y_OFFSET) +")")
    .attr("class", "x label")
    .style("text-align", "center")
    .text("Gene A Expr Lv");

    // y-axis
    canvas.append("g")
    .attr("class", "axis")
    .call(yAxis);


    var transformStr = "translate(" + -30 + "," + (height+150)/2 +")"
    + "rotate(" + -90 + ")";
    // y label
    canvas.append("text")
    .attr("transform",transformStr)
    .style("text-align", "center")
    .text("Gene B Expr Lv");

    // add data points
    canvas.selectAll(".dot").data(data).enter().append("circle")
    .attr("class","dot").attr("r",2.5).attr("cx",xMap)
    .attr("cy",yMap);

    popup.style.display="block";
  }

  // close the pop up login modal box
  function closeModal(){
    popup.style.display="none";
  }
