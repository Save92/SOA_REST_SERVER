var express = require('express');
var app = express();
var jwt = require('jsonwebtoken');
var config = require('../config');
app.set('superSecret', config.secret);
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET hello wolrd page */
router.get('/helloworld', function(re, res) {
  res.render('helloworld', {title : 'Hello, Wolrd'});
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userLogin = req.body.login;
    var userPassword = req.body.password;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "login" : userLogin,
        "password" : userPassword
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.sendStatus("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist").json({success:true});
        }
    });
});

/* POST to Authent User Service */
router.post('/authent', function(req, res) {

    // Set our internal DB variable
    var db = req.db;
    console.log(req.body);
    // Get our form values. These rely on the "name" attributes
    var loginParam = req.body.login;
    var passwordParam = req.body.password;
    // Set our collection
    var collection = db.get('usercollection');
    /**collection.find({"login": loginParam},{}, function(err, docs) {
        console.log(docs)
        for(var i = 0; i < docs.length; i++) {
          if(docs[i].password == passwordParam) {
            res.sendStatus(200);
          } else {
            res.sendStatus(403);
          }
        }
      });**/
    collection.findOne({
    login: loginParam
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 18000
        });
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });

  });

module.exports = router;
