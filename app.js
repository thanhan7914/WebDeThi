const express = require('express');
const app = express();
const server = require('http').Server(app);
const favicon = require('serve-favicon');
const engine = require('./engine');
const port = process.env.PORT || 80;
const utils = require('./utils');

app.use('/assets',express.static( __dirname + '/public_html')); //nginx
app.use(favicon(__dirname + '/public_html/images/favicon.ico'));
app.engine(engine.ext, engine.__engine__);
app.set('views', __dirname + '/views');
app.set('view engine', engine.ext);

server.listen(port, function(){
  console.log(`application run on port ${port}`);
});

app.use(require('./router'));
