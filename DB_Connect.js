/* Get the installed modules */
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config/DB_Connect.js');
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;
const userDB = "UserInfo";

// get new express instance
var app = express();

// change default page to be LoginPage.html
app.use(express.static(__dirname, {index:'LoginPage.html'}));
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
        if (myDoc.password == targetpw) {
          res.send("matched");
        } else {
          res.status(500).end();
        }

      }else{
        console.log("User not found!");
      }
    });

    client.close();

  });
});

// testing query filters
app.get('/find',function(req,res){
  res.write("<h1 style='text-align:center;'>This is data in \"" + userDB + "\" collection</h1>");

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
    db.collection("Test").find({}).toArray(function(err, result) {
      if (err) throw err;
      if(result){
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
