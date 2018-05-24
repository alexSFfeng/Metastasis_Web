function generateR(geneA, geneB, arrayA, arrayB, fileName) {
  var rFile = fileName + '.R';
  var imageName = fileName + '.png';
  var file = new File(rFile);
  var xaxis = geneA + " expression value";
  var yaxis = geneB + " expression value";
  
  
  file.open("w"); //open file with write access
  file.writeln("head(cbind(" + arrayA + ", " + arrayB + "))");
  file.writeln("dev.copy(png, " + imageName + ")");
  file.writeln("plot(" + arrayA + ", " + arrayB + ", xlab=" + xaxis + ", ylab=" + yaxis + ")");
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
