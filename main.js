//****************************
//*** Dig Vargas
//*** Web Project
//*** Mar 5, 2018 (using 1 bonus day)
//****************************

var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main', extname: '.hbs'});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/slick', express.static(__dirname + '/node_modules/slick-carousel/slick/'));
app.use(express.static('public'))

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
// app.set('port', 3000);
var port = process.env.PORT || 3000;
app.listen(port);

app.get('/',function(req,res){
  var qps = mapObjectToKVPairs(req.query);
  res.render('home', { get: true, method: req.method, qps: qps });
});

app.get('/fiveday',function(req,res){
  var context = {};
  res.render('fiveday');
});

app.get('/16day',function(req,res){
  var context = {};
  res.render('16day');
});

app.get('/activities',function(req,res){
  var context = {};
  res.render('activities');
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
