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
