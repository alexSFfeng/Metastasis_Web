/* popup modal box reaction */
var popup;
const X_OFFSET = 100;
const Y_OFFSET = 15;
const Y_OFFSET_TOP = 50;
const MAX_EXPR_VALUE = 50;

// read the element on load
window.onload = function(){
  popup = document.getElementById("modal");
}

function requestForPlot(){
  $.ajax({
    url : "/graph?geneA=" + selectedGenes[0] + "&geneB=" + selectedGenes[1],
    method : "get",
    success: function(res) {
      console.log("returned points");
      generateGraph(res);
      alert("graph generated");
    },
    error: function(res) {
      alert("failed to generate graph");
    }
  });
}

function requestForPlot1(){
  //generateGraph();

  var geneA = selectedGenes[0];
  var geneB = selectedGenes[1];

  var graphBox = document.getElementById("graphBox");
  var img = new Image();
  img.setAttribute("height", "600");
  img.setAttribute("width", "650");
  img.src = "/generatePlot?geneA=" + geneA + "&geneB=" + geneB;
  graphBox.appendChild(img);
  popup.style.display="block";


  // ajax call for generating plot
  $.ajax({
    url : 'getPlot',
    method : "post",
    data : {
      targetGenes : selectedGenes
    },
    success : function(res){
      console.log(res);
      //res = btoa(res);
      //generateGraph(res);
      var graphBox = document.getElementById("graphBox");
      var img = new Image();
      img.setAttribute("height", "600");
      img.setAttribute("width", "650");

      //res = new Buffer(res.toString(), "binary").toString("base64");
      //res.split("#").join("%23");
      //img.src =  res;
      graphBox.appendChild(img);
      popup.style.display="block";
      alert("graph generated");
    },
    error : function(res){
      alert("failed to generate graph");
    }
  });
}

// close the pop up login modal box
function closeModal(){
  popup.style.display="none";
}


// generating the graph takes image from server
function generateGraph(dataArr){

  console.log(" in generate graph");
  // FRONT END GENERATE GRAPH --------------------------------------------
  // graph traits
  var data = dataArr;
  console.log(data.length)
  var height = 300;
  var width = 650;

  if (data.length == 0) {
    alert("No such patients fit the specified filters.");
    return;
  }

  var max = data[0];
  for (var n = 1; n < data.length; n++) {
    if (data[n] > max)
      max = data[n];
  }
  /*var data = [];
  var height = 300;
  var width = 650;

  for(var i = 0; i < 70; i++){
    var aValue = Math.floor(Math.random() * 27)+1;
    var bValue = Math.floor(Math.random() * 24)+1;
    var dataPt = {geneA : aValue, geneB : bValue};
    data.push(dataPt);
  }

  for(var i = 0; i < 70; i++){
    var aValue = Math.floor(Math.random() * 24)+25;
    var bValue = Math.floor(Math.random() * 29)+25;
    var dataPt = {geneA : aValue, geneB : bValue};
    data.push(dataPt);
  }

  for(var i = 0; i < 10; i++){
    var aValue = Math.floor(Math.random() * 25)+4;
    var bValue = Math.floor(Math.random() * 25)+25;
    var dataPt = {geneA : aValue, geneB : bValue};
    data.push(dataPt);
  }

  for(var i = 0; i < 10; i++){
    var aValue = Math.floor(Math.random() * 24)+20;
    var bValue = Math.floor(Math.random() * 24)+2;
    var dataPt = {geneA : aValue, geneB : bValue};
    data.push(dataPt);
  }
  */

  // setup x
  var xValue = function(d) { return d.geneA;}, // data -> value
  xScale = d3.scaleLinear().domain([0, max + 0.1])
  .range([0, width-X_OFFSET]), // value -> display
  xMap = function(d) { return xScale(xValue(d));}, // data -> display
  xAxis = d3.axisBottom(xScale).ticks(10);

  // setup y
  var yValue = function(d) { return d.geneB;}, // data -> value
  yScale = d3.scaleLinear().domain([0, max + 0.1])
  .range([height-Y_OFFSET, Y_OFFSET_TOP]), // value -> display
  yMap = function(d) { return yScale(yValue(d));}, // data -> display
  yAxis = d3.axisLeft(yScale).ticks(5);

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
  .text("Gene X Expr Lv");

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
  //-------------------------------------------End of Generate graph------*/
  popup.style.display="block";
}
