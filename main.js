//****************************
//*** Dig Vargas
//*** Web Project
//*** Mar 4, 2018
//****************************

var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main', extname: '.hbs'});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.use(express.static(__dirname + '/public'));
app.use(express.static('public'))

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('port', 3000);

app.get('/',function(req,res){
  var qps = mapObjectToKVPairs(req.query);
  res.render('home', { get: true, method: req.method, qps: qps });
});

app.get('/fiveday',function(req,res){
  var context = {};
  // context.sentData = req.query.myData;
  res.render('fiveday', context);
});

app.get('/tenday',function(req,res){
  var context = {};
  // context.sentData = req.query.myData;
  res.render('tenday', context);
});

app.get('/activities',function(req,res){
  var context = {};
  // context.sentData = req.query.myData;
  res.render('activities', context);
});




app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

// util:

function mapObjectToKVPairs(obj) {
  return Object.keys(obj).map(function(key) {
    return { key: key, val: obj[key] };
  });
}
