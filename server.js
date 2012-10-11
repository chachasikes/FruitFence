#!/bin/env node

var _ = require('underscore')._;

var EngineProvider = require('./engine').EngineProvider;
var engine         = new EngineProvider();


var fs      = require('fs');
var express = require('express');

/////////////////////////////////////////////////////////////////////////////////////////////
// lemonopoly configuration
/////////////////////////////////////////////////////////////////////////////////////////////

var zcache = { 'index.html': '' };
zcache['index.html'] = fs.readFileSync('./public/index.html');



var twitter = require('ntwitter');
var credentials = require('./credentials.js');

var t = new twitter({
    consumer_key: credentials.consumer_key,
    consumer_secret: credentials.consumer_secret,
    access_token_key: credentials.access_token_key,
    access_token_secret: credentials.access_token_secret
});

t.stream(
    'statuses/filter',
    { 
      track: ['fruitfence']
    },
    function(stream) {
        stream.on('data', function(tweet) {
            var res = {};
            engine.save(tweet,function(error,agent) {

            });
        });
    }
);







var app = module.exports = express.createServer();

app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  },
  user_id: function(req, res) {
    if(req.session && req.session.user_id) {
      return req.session.user_id;
    }
    return null;
  },
});


app.get('/', function(req, res){
    res.send(zcache['index.html'], {'Content-Type': 'text/html'});
});

app.post('/agent/save', function(req, res) {
  console.log("server:: agent save ");
  var blob = req.body;
  // @TODO is this engine really resaving based on _id? verify plz
  engine.save(blob,function(error,agent) {
    if(error) { res.send("Server agent storage error #5",404); return; }
    if(!agent) { res.send("Server agent storage error #6",404); return; }
    res.send(agent);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////
// openshift internal routes
/////////////////////////////////////////////////////////////////////////////////////////////

app.get('/health', function(req, res){
    res.send('1');
});

// Handler for GET /asciimo
app.get('/asciimo', function(req, res){
    var link="https://a248.e.akamai.net/assets.github.com/img/d84f00f173afcf3bc81b4fad855e39838b23d8ff/687474703a2f2f696d6775722e636f6d2f6b6d626a422e706e67";
    res.send("<html><body><img src='" + link + "'></body></html>");
});


app.post("/agent/query", function(req,res) {
  var blob = req.body;
  console.log("server:: agent query for many:");
  console.log(blob);
  engine.find_many_by(blob,function(error, results) {
    if(!results || error) {
      console.log("agent query error");
      res.send("[]");
      return;
    }
    res.send(results);
  });
});


/////////////////////////////////////////////////////////////////////////////////////////////
// openshift boot up
/////////////////////////////////////////////////////////////////////////////////////////////

var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP;
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 3000;

if (typeof ipaddr === "undefined") {
   console.warn('No OPENSHIFT_INTERNAL_IP environment variable');
}

function terminator(sig) {
   if (typeof sig === "string") {
      console.log('%s: Received %s - terminating Node server ...',
                  Date(Date.now()), sig);
      process.exit(1);
   }
   console.log('%s: Node server stopped.', Date(Date.now()) );
}

process.on('exit', function() { terminator(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
});

app.listen(port, ipaddr, function() {
   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});

