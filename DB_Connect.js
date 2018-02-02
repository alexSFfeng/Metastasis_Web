/* Get the installed modules */
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config/DB_Connect.js');
const url = 'mongodb://localhost:27017/usersInfo';
const MongoClient = require('mongodb').MongoClient;

// get new express instance
var app = express();

app.use(express.static(__dirname, {index:'LoginPage.html'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.post('/signup',function(req,res){
  console.log("storing data into database");
  var targetEmail = req.body.useremail;
  var targetpw = req.body.pw;
  console.log("This is the entered email: " + targetEmail)
  console.log("This is the entered password: " + targetpw);
  res.send("OK~");
  res.sendStatus(200);
});

// signing in to the web, comparing entered info with database info
app.post('/login', function(req, res) {
  console.log("Comparing user input with database data")
  var targetEmail = req.body.useremail;
  var targetpw = req.body.userpw;
  console.log("This is the entered email: " + targetEmail)
  console.log("This is the entered password: " + targetpw);
  res.send("OK~");
  //res.sendStatus(200);
});

// listening to port
app.listen(config.port,function(){
  console.log(`Node started on port ${config.port} Successfully`);
});

//const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Database Name
const dbName = 'usersInfo';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  //assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});
