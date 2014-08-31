#!/bin/env node

var _ = require('underscore')._;
var fs      = require('fs');
var express = require('express');

var EngineProvider = require('./engine').EngineProvider;
var engine         = new EngineProvider();


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

var ipaddr  = process.env.IPADDR || "127.0.0.1";
var port    = 4000;

if (typeof ipaddr === "undefined") {
   console.warn('No ipaddr environment variable');
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
   console.log('%s: Fruitfence server started on %s:%d ...', Date(Date.now() ),
               ipaddr, port);
});
