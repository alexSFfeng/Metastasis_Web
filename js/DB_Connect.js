/* Get the installed modules */
var express = require('express');
const util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('../config/DB_Connect.js');
var tmp = require('tmp');
var fs = require('fs');
const exec = util.promisify(require('child_process').exec);
tmp.setGracefulCleanup();
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;
const userDB = "UserInfo";

// get new express instance
var app = express();

// change default page to be LoginPage.html
app.use(express.static(path.join(__dirname,"../"), {index:'LoginPage.html'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// sign up by enterning user information into database
app.post('/signup',function(req,res){

  // collect user data for import
  var targetEmail = req.body.useremail;
  var targetpw = req.body.pw;
  var userObj = { username : targetEmail, password : targetpw};
  console.log("This is the entered email: " + targetEmail)
  console.log("This is the entered password: " + targetpw);

  // connect to the Database and validate the password
  MongoClient.connect(url, function(err, client) {
    if(err){
      console.log("unable to connect");
      throw err;
    }

    // open up the user database
    var db = client.db(userDB);
    console.log("Importing data to database");

    // insert the user information into user collection
    db.collection('user').insertOne(userObj, function(err, res){
      if(err) throw err;
      console.log("information inserted");
    });

    client.close();
  });
  res.end();
});

// redirection to the user profile
app.get('/matched', function(req,res) {
  res.sendFile( __dirname + "/profile.html");
});

// signing in to the web, comparing entered info with database info
app.post('/login', function(req, res) {

  // getting user inputs from request body
  var targetEmail = req.body.useremail;
  var targetpw = req.body.userpw;
  console.log("This is the entered email: " + targetEmail)
  console.log("This is the entered password: " + targetpw);

  // connect to the Database and validate the password
  MongoClient.connect(url, function(err, client) {
    var db = client.db(userDB);

    // find that user and check for password
    console.log("Connected successfully to database validating user and pass");
    db.collection("user").findOne({username: targetEmail}).then(function (myDoc){

      // check for password match and redirect accordingly
      if (myDoc) {
        console.log(myDoc);
        if (myDoc.password == targetpw) {
          res.send("matched");
        } else {
          console.log("Invalid password");
          res.status(406).send("invalid password/username");
        }

      }else{
        console.log("User not found!");
        res.status(406).send("invalid password/username");
      }
    });

    client.close();
  });

});

/*-------------------- SEARCH PAGE REDIRECT --------------------------- */
app.get('/DataSearchPage',function(req,res){
  res.sendFile( __dirname + "/DataSearchPage.html");
});


// test server side image rendering
app.get('/generatePlot',async function(req, res){

  req.setTimeout(0);
  // get the selected genes to generate a graph.
  //var geneA = req.query.geneA;
  //var geneB = req.query.geneB;

  var geneA = "geneA";
  var geneB = "geneB";
  // returns object { x arr, y arr}
  //var coordinates = getCoordinates(geneA, geneB);
  var arrayA = [10,20,40,23,43,23,44,33];
  var arrayB = [14,12,54,26,39,43,56,23];


  // genearte unique temporary file : .name = the path
  var rCodeFile = tmp.fileSync({postfix : ".R"});
  var imageFile = tmp.fileSync({ postfix : ".png"});

  //console.log("Rname = " + rCodeFile.name + "\nRfile descriptor = " + rCodeFile.fd);
  //console.log("Iname = " + imageFile.name + "\nIfile descriptor = " + imageFile.fd);

  var rfileName = path.basename(rCodeFile.name);
  var imageFileName =path.basename(imageFile.name);

  // Wenyi's code to generate R code files and Exectute code generate image file
  await generateImage(geneA, geneB, arrayA, arrayB, rfileName, imageFileName);


  /*res.sendFile(path.join(__dirname,"/../" + imageFileName), function(err){
    if(err){
      console.log(err);
      console.log("IN error:" + imageFileName);
    }
    else{
      console.log("IN Success:" + imageFileName);
      //imageFile.removeCallback();
    }
  });
  */
});

async function generateImage(geneA, geneB, arrayA, arrayB, rFileName, imageFileName) {
  var xaxis = geneA + " expression value";
  var yaxis = geneB + " expression value";

  console.log("in generate image:" + imageFileName);
  var rFileContent = "geneA <- c(" + arrayA + ")\n" +
                     "geneB <- c(" + arrayB + ")\n" +
                     "head(cbind(geneA, geneB))\n" +
                     "png(filename = \"" + imageFileName + "\")\n" +
                     "plot(geneA, geneB, xlab=\"" + xaxis + "\" , ylab=\"" + yaxis + "\")\n";

  fs.writeFile(rFileName, rFileContent, function(err){
    if(err){
      return console.log(err);
    }
    console.log("File written");
  })

  console.log("Finished Writing R file, now exec:");
  //child.process
  /*exec('/usr/local/bin/Rscript ' + rFileName,
      (error, stdout, stderr)=> {
        console.log(`Successfully logged ${stdout}`);
        if(error) {
          console.log("There's an error");
          throw error;
        }    }
  );*/

/*  var spawnSync = require('child_process').spawnSync;

var result = spawnSync('node',
                       ['filename.js'],
                       {input: 'write this to stdin'});

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status);
} else {
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
}*/

await exec('find . -type f | wc -l', (err, stdout, stderr) => {
  console.log(`Number of files ${stdout}`);
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }
});


}

app.get('/testSearch',function(req,res){
  var dummy = [
    {
      gene: 10, SD:19
    },
    {
      gene: 11, SD:19
    },
    {
      gene: 12, SD:19
    },
    {
      gene: 13, SD:19
    }
  ];

  res.send(dummy);
})

app.get('/search',function(req,res){
  var target_id = req.query.gse_id;
  var target_age_start = req.query.age_start;
  var target_age_end = req.query.age_end;
  var target_gender = req.query.gender;
  var target_race = req.query.race;
  var target_cancer = req.query.cancer_type;
  console.log("query: " + target_id + ", " + target_age_start + ", " + target_age_end + ", " + target_gender + ", " + target_race + ", " + target_cancer);
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db("CancerData");

    // building query
    var q = {};
    if (Object.keys(req.query).length > 0) {
      q["$and"] = [];
      if (target_id != undefined) {
        q["$and"].push({"c GSE ID" : target_id});
      }
      if (target_age_start != undefined) {
        q["$and"].push({"c Patient Age" : {$gte : Number(target_age_start)}});
      }
      if (target_age_end != undefined) {
        q["$and"].push({"c Patient Age" : {$lte : Number(target_age_end)}});
      }
      if(target_gender != undefined) {
        q["$and"].push({"c Patient Sex" : target_gender});
      }
      if (target_race != undefined) {
        q["$and"].push({"c Patient Race" : target_race});
      }
      if (target_cancer != undefined) {
        q["$and"].push({"c Cancer Type" : target_cancer})
      }
    }
    console.log(q);

    db.collection("geneAnnotation").find(q).toArray(function(err, result) {
      if (err) throw err;
      if (result.length > 0) {
        console.log("valid query: " + result.length);
        var ids = {};
        ids["$or"] = [];
        for (var n = 0; n < result.length; n++) {
          ids["$or"].push({"Probe ID" : result[n]["Array ID"]});
        }
        console.log("query successfully returned: ");
        console.log(result);

        // using gsm ids to search other database
        console.log("gathering expression table data, ids to find:");
        console.log(ids);
        db.collection("geneExpr").find(ids).toArray(function(err_2, result_2) {
          if (err_2) throw err_2;
          var objlength = result_2.length; // ids
          var keys = Object.keys(result_2[0]);
          var keylength = keys.length; // genes
          //console.log(result_2);

          var sdarr = [];
          for(var i = 2; i < keylength; i++) {
            var avg = 0;
            for(var j = 0; j < objlength; j++) {
              avg = avg + result_2[j][keys[i]];
            }
            avg = avg / objlength;
            // calculate standard deviation
            var sumsq = 0;
            for(var k = 0; k < objlength; k++) {
              sumsq = sumsq + Math.pow(result_2[k][keys[i]] - avg, 2);
            }
            var sd = 1 / objlength * Math.sqrt(sumsq);
            sdarr.push({gene: keys[i], SD: sd});
          }
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          console.log(sdarr);
          res.send(sdarr);
        });
      } else {
        console.log("invalid, zero entries matched.");
      }
    });
  });
})


// listening to port
app.listen(config.port,function(){
  console.log(`Node started on port ${config.port} Successfully`);
});
// Use connect method to connect to the server
