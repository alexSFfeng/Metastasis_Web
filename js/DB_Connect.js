/* Get the installed modules */
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('../config/DB_Connect.js');
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;
const userDB = "UserInfo";

// get new express instance
var app = express();
var prev_ids;

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
})
app.post('/deletedata', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db(userDB);
    db.collection("geneAnnotation").deleteMany(function(err, res) {
      if (err) throw err;
      console.log("deleted all annotation data")
    });
    db.collection("geneExpr").deleteMany(function(err, res) {
      if (err) throw err;
      console.log("deleted all expression data");
    })
  })
})
app.post('/insertdata', function(req, res) {
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    console.log("inserting test data");
    var db = client.db(userDB);

    db.collection("geneAnnotation").insertMany([
      { "Array ID" : "1", "Patient Age Start" : 1, "Patient Age End" : 1 },
      { "Array ID" : "2", "Patient Age Start" : 1, "Patient Age End" : 2 },
      { "Array ID" : "3", "Patient Age Start" : 2, "Patient Age End" : 2 },
      { "Array ID" : "4", "Patient Age Start" : 2, "Patient Age End" : 2 }
    ], function(err, res) {
      if (err) throw err;
      console.log("inserted annotation data");
    });

    db.collection("geneExpr").insertMany([
      { "Probe ID" : "gene1", "1" : 0.1, "2" : 0.34, "3" : 0.342, "4" : 1.45 },
      { "Probe ID" : "gene2", "1" : 1.1, "2" : 2.34, "3" : 1.342, "4" : 3.4534 },
      { "Probe ID" : "gene3", "1" : 2.1, "2" : 4.34, "3" : 5.342, "4" : 3.25 },
      { "Probe ID" : "gene4", "1" : 4.1, "2" : 7.34, "3" : 53.342, "4" : 0.542 }
    ], function(err, res) {
      if (err) throw err;
      console.log("inserted expression data");
    });
  });
})

//generate graph
app.get("/graph", function(req, res) {
  var xgene = req.query.geneA;
  var ygene = req.query.geneB;
  xgene = "gene4";
  ygene = "gene3";
  console.log("generating plot points...");
  console.log("xgene: " + xgene + ", ygene: " + ygene);
  console.log("prev ids: " + prev_ids);
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db(userDB);

    if (1) {
    //if (prev_ids.length > 0) {
      // only get selected genes
      var q = {}
      q["$or"] = [];
      q["$or"].push({"Probe ID" : xgene});
      q["$or"].push({"Probe ID" : ygene});
      console.log(q);

      db.collection("geneExpr").find(q).toArray(function(err, genes) {
        if (err) throw err;
        var points = [];
        //var keys = Object.keys(genes[0]);

        for (var i = 0; i < prev_ids.length; i++) {
          points.push({"geneA" : genes[0][prev_ids[i]["Array ID"]], "geneB" : genes[1][prev_ids[i]["Array ID"]]});
        }
        console.log("points:")
        console.log(points);
        res.send(points);
      })
    } else {
      console.log("no previous search saved"); // shouldn't happen
    }
  });
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
    var db = client.db(userDB);

    // building query
    var q = {};
    if (Object.keys(req.query).length > 0) {
      q["$and"] = [];
      if (target_id != undefined) {
        q["$and"].push({"GSE ID" : target_id});
      }
      if (target_age_start != undefined) {
        q["$and"].push({"Patient Age Start" : {$gte : Number(target_age_start)}});
      }
      if (target_age_end != undefined) {
        q["$and"].push({"Patient Age End" : {$lte : Number(target_age_end)}});
      }
      if(target_gender != undefined) {
        q["$and"].push({"Patient Sex" : target_gender});
      }
      if (target_race != undefined) {
        q["$and"].push({"Patient Race" : target_race});
      }
      if (target_cancer != undefined) {
        q["$and"].push({"Cancer Type" : target_cancer})
      }
    }
    console.log(q);

    prev_ids = [];
    db.collection("geneAnnotation").find(q).toArray(function(err, result) {
      if (err) throw err;
      if (result.length > 0) {
        console.log("valid query: " + result.length);
        console.log(result);

        // using gsm ids to search other database
        console.log("gathering expression table data:");
        db.collection("geneExpr").find().toArray(function(err_2, genes) {
          if (err_2) throw err_2;
          prev_ids = result;
          console.log("prev ids:")
          console.log(prev_ids);
          //this.prev_ids = result;
          var sdarr = [];
          console.log("finding sd");
          for (var i = 0; i < genes.length; i++) { // loop through each gene
            var avg = 0;
            for (var j = 0; j < result.length; j++) { // loop through each relevant id in the gene
              avg += genes[i][result[j]["Array ID"]];
            }
            avg /= result.length;
            // calculate standard deviation
            var sumsq = 0;
            for(var k = 0; k < result.length; k++) {
              sumsq = sumsq + Math.pow(genes[i][result[k]["Array ID"]] - avg, 2);
            }
            var sd = 1 / result.length * Math.sqrt(sumsq);
            sdarr.push({gene: genes[i]["Probe ID"], SD: sd});
          }
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          //sdarr = [{gene: "gene1", SD: 1}, {gene: "gene2", SD: 2}]
          console.log(sdarr);
          res.send(sdarr);
        });
      } else {
        console.log("invalid, zero entries matched.");
        throw err;
      }
    });
  });
})

// testing query filters
app.get('/find',function(req,res){
  res.write("<h1 style='text-align:center;'>This is data in \"" + userDB + "\"  \
            collection</h1>");

  // connect to testing database
  MongoClient.connect(url, function(err,client){
    if(err){
      console.log("unable to connect");
      throw err;
    }

    // open up the user database
    var db = client.db(userDB);
    console.log("Begin querying existing data in test db");

    /*
     * !!!!!! PUT YOUR TEST FILTER CONDITION IN THE find bracket {} !!!!!!!
     */
    db.collection("Test").find({Name: "Baby"}).toArray(function(err, result) {
      if (err) throw err;
      if(result.length > 0){
        // loop through the results found
        for(var i = 0; i < result.length; i++){

          // store the keys of each object found
          var keys = Object.keys(result[i]);

          // display each key and value to the browser
          for(var j = 1; j < keys.length; j ++){
            res.write("<p style='text-align:center'>");
            res.write("" + keys[j] + " : " + result[i][keys[j]]);
            res.write("<br></p>");
          }
          res.write("<hr>");
        }
      }
      // nothing found
      else{
        res.write("No data found");
      }
      res.end();
    });

    client.close();
  });
});

// listening to port
app.listen(config.port,function(){
  console.log(`Node started on port ${config.port} Successfully`);
});
// Use connect method to connect to the server
