/* Get the installed modules */
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var config = require('../config/DB_Connect.js');
//const num_genes = 54675;
const num_genes = 25;
const url = 'mongodb://localhost:27017';
const MongoClient = require('mongodb').MongoClient;
const userDB = "smallerdata";
//const userDB = "data";
//const userDB = "test";

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
    var db = client.db("test");

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
  console.log("generating plot points...");
  console.log("xgene: " + xgene + ", ygene: " + ygene);
  //console.log("prev ids: " + prev_ids);
  MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    var db = client.db(userDB);

    if (1) {
    //if (prev_ids.length > 0) {
      // only get selected genes
      var q = {}
      q["$or"] = [];
      q["$or"].push({"ProbeId" : xgene});
      q["$or"].push({"ProbeId" : ygene});
      console.log(q);

      db.collection("geneExpr").find(q).toArray(function(err, genes) {
        if (err) throw err;

        if (genes.length > 0) {
          var points_x = [];
          var points_y = [];

          for (var i = 0; i < prev_ids.length; i++) {
            points_x.push(genes[0][prev_ids[i]["Array ID"]]);
            points_y.push(genes[1][prev_ids[i]["Array ID"]]);
          }
          console.log("points generated")
          res.send([points_x, points_y]);
        } else {
          console.log("error, no genes found");
          throw err;
        }
      })
    } else {
      console.log("no previous search saved"); // shouldn't happen
    }
  });
})

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
  //console.log("query: " + target_id + ", " + target_age_start + ", " + target_age_end + ", " + target_gender + ", " + target_race + ", " + target_cancer);
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

    //prev_ids = [];
    var i = 1;
    db.collection("geneAnnotation").find(q).toArray(function(err, result) {
      if (err) throw err;
      if (result.length > 0) {
        console.log("valid query: " + result.length);
        console.log("gathering expression table data:");
        prev_ids = result;
        var expr = db.collection("geneExpr");
        var sdarr = [];
        //var i = 1;

        // if end was reached, return standard deviation array
        function sd() {
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          console.log("standard deviation found: " + sdarr.length);
          res.send(sdarr);
        }

        // iterate through each gene
        expr.find().forEach(function(gene) {
          console.log(i)

          var avg = 0;
          for (var j = 0; j < result.length; j++) { // loop through each relevant id in the gene
            if (gene[result[j]["Array ID"]] != undefined)
              avg += Number(gene[result[j]["Array ID"]]);
            //console.log(avg);
          }
          avg /= result.length;
          console.log(avg);
          // calculate standard deviation
          var sumsq = 0;
          for(var k = 0; k < result.length; k++) {
            //console.log(gene[result[k]["Array ID"]]);
            if (gene[result[k]["Array ID"]] != undefined) {
              //console.log("before: " + sumsq);
              sumsq = sumsq + Math.pow(Number(gene[result[k]["Array ID"]]) - avg, 2);
              //console.log(avg);
            }
          }
          console.log("sumsq: " + sumsq + ", sqrt: " + Math.sqrt(sumsq));
          var sd = 1 / result.length * Math.sqrt(sumsq);
          sdarr.push({gene: gene["ProbeId"], SD: sd});

          // counting until parsed all genes
          i++;
          if (i > num_genes) {
            sdarr.sort(function(a, b) {
                return b.SD - a.SD;
            });
            console.log("standard deviation found: " + sdarr.length);
            res.send(sdarr);
          }
        }, function(err) {
          if (err) throw err;
        });

        // defining callback
        /*function sd(callback) {
          callback();
        }*/

        // defining promise
        /*const promise = new Promise(function(resolve, reject) {
          sd(function() {
            expr.find().forEach(function(gene) {
              console.log(i)
              if (i == num_genes) {
                sdarr.sort(function(a, b) {
                    return b.SD - a.SD;
                });
                console.log("standard deviation found: " + sdarr.length);
                res.send(sdarr);
                break;
              }
              var avg = 0;
              for (var j = 0; j < result.length; j++) { // loop through each relevant id in the gene
                avg += gene[result[j]["Array ID"]];
              }
              avg /= result.length;
              // calculate standard deviation
              var sumsq = 0;
              for(var k = 0; k < result.length; k++) {
                sumsq = sumsq + Math.pow(gene[result[k]["Array ID"]] - avg, 2);
              }
              var sd = 1 / result.length * Math.sqrt(sumsq);
              sdarr.push({gene: gene["Probe ID"], SD: sd});
              i++;
            }, function(err) {
              if (err) throw err;
            });
          });

          if (sdarr.length > 0) resolve(sdarr);
          else reject("failure");
        });

        /*promise.then(function resolve(sdarr) {
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          console.log("standard deviation found: " + sdarr.length);
          res.send(sdarr);
        }, function reject(err) {
          console.log("promise failed");
        });



        /*sd(function() {
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          console.log("standard deviation found: " + sdarr.length);
          res.send(sdarr);
        });*/

        // old
        /*db.collection("geneExpr").find().toArray(function(err_2, genes) {
          if (err_2) throw err_2;
          prev_ids = result;
          var sdarr = [];
          console.log("genes: " + genes.length);
          // ------ trying priority queue
          /*var sdarr = pq({comparator: function(a, b) {
            return b.SD - a.SD;
          }});*/
          // end attempt
          /*console.log("finding sd");
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
            //sdarr.queue({gene: genes[i]["expr"]["txt"], SD: sd});
          }
          sdarr.sort(function(a, b) {
              return b.SD - a.SD;
          });
          //sdarr = [{gene: "gene1", SD: 1}, {gene: "gene2", SD: 2}]
          //console.log(sdarr);
          console.log("standard deviation found: " + sdarr.length);
          res.send(sdarr);
        });*/
      } else {
        console.log("invalid, zero entries matched.");
        throw err;
      }
    });
  });
})

// listening to port
app.listen(config.port,function(){
  console.log(`Node started on port ${config.port} Successfully`);
});
// Use connect method to connect to the server
