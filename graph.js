function generateR(arrayA, arrayB, imageName) {
  var rFile = "graph.R";
  var file = new File(rFile);
  var array1 = arrayA;
  var array2 = arrayB;
  
  file.open("w"); //open file with write access
  file.writeln("head(cbind(" + array1 + ", " + arrayB + "))");
  file.writeln("dev.copy(png, 'scatterplot.png')");
  file.writeln("plot(" + array1 + ", " + array2 + ", xlab="Gene A expression value", ylab="Gene B expression value")");
  file.writeln("dev.off()");
  file.close();
  
  //child.process
  var execFile = require('child_process').execFile;
  var child = execFile('R', ['graph.R'], (error, stdout, stderr) {
    if(error) {
      throw error;
    } 
    console.log(stdout);
  });
});
