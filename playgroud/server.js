var express = require('express');
var hbs = require('hbs');
var fs = require('fs');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var url = 'mongodb://localhost:27017/quiz2';
var bodyParser = require('body-parser');
var app = express();
var mail = "jirayu_ch01@hormail.com";

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
hbs.registerPartials(__dirname + '/views/partials')
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
  return new Date().getFullYear()
});
hbs.registerHelper('screamIt', (text) => {
  return text.toUpperCase();
});

app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home Page',
    welcomeMessage: 'Welcome to my website',
  });
});

app.get('/about', (req, res) => {
  res.render('about.hbs', {
    pageTitle: 'About Page',
    firstname: "Jirayu Chinnawong",
    tel: "0950193878",
    mail: mail,
    face: "Jirayu Chinnawong",
  });
});

app.get('/add', (req, res) => {
  res.render('add.hbs');
});

app.post('/save', (req, res) => {
  var item = {
    studentID: req.body.studentID,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    age: req.body.age,
    sex: req.body.sex,
    major: req.body.major,
    faculty: req.body.faculty,
    role: req.body.role,
  };
  mongo.connect(url, function (err, db) {
    assert.equal(null, err);
    db.collection('users').insertOne(item, function (err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });
  res.redirect('/');
});

app.get('/users', (req, res) => {
  var resultArray = [];
  mongo.connect(url, function (err, db) {
    assert.equal(null, err);
    var cursor = db.collection('users').find();
    cursor.forEach(function (doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function () {
      db.close();
      res.render('view', {
        items: resultArray
      });
    });
  });
});

app.get('/update', (req, res) => {
  res.render('update.hbs');
});

app.post('/updates', (req, res) => {
  var item = {
    studentID: req.body.studentID,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    age: req.body.age,
    sex: req.body.sex,
    major: req.body.major,
    faculty: req.body.faculty,
  };
  var id = req.body.id;
  mongo.connect(url, function (err, db) {
    assert.equal(null, err);
    db.collection('users').updateOne({
      studentID: req.body.studentID
      //"_id": objectId(id) 
    }, {
        $set: item
      }, function (err, result) {
        assert.equal(null, err);
        console.log('Item updated');
        db.close();
        res.render('home');
      });
  });
});

app.get('/delete', (req, res) => {
  res.render('delete.hbs');
});

app.post('/deletes', (req, res) => {
  var id = req.body.id;
  mongo.connect(url, function (err, db) {
    assert.equal(null, err);
    db.collection('users').deleteOne({
      studentID: req.body.id
    }, function (err, result) {
      assert.equal(null, err);
      console.log('Item deleted');
      db.close();
      res.render('home');
    });
  });
});

app.get('/users/search', (req, res) => {
  var fname = req.query.fname;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var query = { firstname: new RegExp('.*' + fname + '.*') };
    db.collection("users").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.render('search', {
        items: result
      });
    });
  });
});

app.get('/users/role/:role', (req, res) => {
  var role = req.params.role;
  mongo.connect(url, function (err, db) {
    if (err) throw err;
    var query = { role: new RegExp('.*' + role + '.*') };
    db.collection("users").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      res.render('search', {
        items: result
      });
    });
  });
});

app.listen(3001, () => {
  console.log('Server is up on port 3001');
});
