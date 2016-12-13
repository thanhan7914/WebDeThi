const express = require('express');
const app = express();
const server = require('http').Server(app);
const favicon = require('serve-favicon');
const engine = require('./engine');
const port = process.env.PORT || 80;
const utils = require('./utils');
const session = require('cookie-session')({//express-session
  secret: 'chuoi gi do o day',
  resave: true,
  saveUninitialized: true
});
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session);
app.use('/assets',express.static( __dirname + '/public_html')); //nginx
app.use(favicon(__dirname + '/public_html/images/favicon.ico'));
app.engine(engine.ext, engine.__engine__);
app.set('views', __dirname + '/views');
app.set('view engine', engine.ext);

const counter = require('./counter');

app.use(function(req, res, next) {
  counter(req, res);
  next();
});
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error/500');
});

app.use(require('./router'));
app.use('/dashboard', require('./router/dashboard'));
app.use('/403', function(req, res) {
  res.status(403);
  res.render('error/403');
});

app.use(function(req, res, next) {
  res.status(404);
  res.render('error/404');
});

server.listen(port, function(){
  console.log(`application run on port ${port}`);
});
