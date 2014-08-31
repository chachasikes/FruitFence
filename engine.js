// mongo
var MongoDB = require('./mongo').MongoDB;

function enginecallback() {
  console.log("engine::authed");
}

EngineProvider = function() {
  this.db = new MongoDB('127.0.0.1',27017); //localhost
  //this.db = new MongoDB('127.2.150.1',27017); //production
  console.log("server::engine database is " + this.db );

};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// querys for low level
// TODO - we may want to not send all fields for security reasons
// TODO - make this work - restrict to admins
/////////////////////////////////////////////////////////////////////////////////////////////////////

EngineProvider.prototype.count_all_by = function(hash,callback) {
  return this.db.count_all_by(hash,callback);
}

EngineProvider.prototype.find_one_by_id = function(id,handler) {
  this.db.find_one_by_id(id,handler);
};

EngineProvider.prototype.findAll = function(handler) {
  this.db.find(handler);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// query
/////////////////////////////////////////////////////////////////////////////////////////////////////

EngineProvider.prototype.find_many_by = function(blob,handler) {
  this.db.find_many_by(blob,handler);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// destroy
/////////////////////////////////////////////////////////////////////////////////////////////////////

EngineProvider.prototype.destroy = function(blob,handler) {
  this.db.destroy(blob,handler);
};

/////////////////////////////////////////////////////////////////////////////////////////////////////
// data api - generic save handler - also handles unique facebook id storage
// 
// Save a change to an agent or a new agent
// TODO parameter sanitization???
// https://groups.google.com/forum/#!topic/nodejs/URqPpvhgVs8
//
/////////////////////////////////////////////////////////////////////////////////////////////////////

EngineProvider.prototype.save = function(blob,handler) {

  var _id =           blob["_id"];
  var fbid =          blob["fbid"];
  var kind =          blob["kind"];
  var email =         blob["email"];  // i read these to verify them but i save the entire blob...
  var title =         blob["title"];
  var description =   blob["description"];
  var art =           blob["art"];
  var lat =           blob["lat"];
  var lon =           blob["lon"];
  var sponsor =       blob["sponsor"];
  var created_at =    blob["created_at"];
  var updated_at =    blob["updated_at"];

  if(!created_at)     blob["created_at"] = new Date();
  blob["updated_at"] = new Date();

  // debug

  console.log("Server::agent::save got a request to save object id " + _id + " named " + title + " kind " + kind );
  for(var property in blob) {
    console.log("..Saving property " + property + " " + blob[property] );
  }

  // Search for existing by ID or FBID

  var search = 0;
  if(_id) search = {_id: _id};
  if(fbid) search = {fbid:fbid}; // overrides

  // If no ID yet then save as a new object and return it

  if(!search) {
    console.log("Server::save got a request to save object id " + _id + " named " + title + " kind " + kind );
    this.db.save(blob,handler);
    return;
  } else {
    console.log("Server::saving by existing key " + _id + " " + fbid );
  }

  // If an ID does exist then recycle it or fail

  console.log("server::engine db is " + this.db );

  var mydatabase = this.db;
  this.db.find_one_by(search, function(error, agent) {
    console.log("server::engine got some mongo result " + error );
    if(error) {
       for(var i in error) {
         console.log("server::engine::error " + i + " " + error[i]);
       }
    }
    if(error) { console.log("server::engine got access error = " + error.name ); handler(error,0); return; }
    if(agent) {
      _id = agent._id;
      console.log("Server::engine::save got a request to update object id " + _id + " named " + title + " kind " + kind );
      for(var property in blob) {
        if(blob.hasOwnProperty(property) && blob[property]) {
          agent[property] = blob[property];
        }
      }
      mydatabase.update(agent,handler);
      return;
    }
    if(_id) {
      handler("Could not find specified by id " + _id,0);
      return;
    }
    // FBID's can be saved as new objects - this is an exception to the general rule
    console.log("server::engine saving by fbid");
    mydatabase.save( blob, handler );
  });

};

////////////////////////////////////////////////////////////////////////////////////////////
// run the game forward a round
////////////////////////////////////////////////////////////////////////////////////////////

//
// this is our generic handler for updating all agents based on attributes of each agent
//
// - update all agents each for their type
// - transfer ownerships and leave on map
// - a bird that follows markers
// - a layer
// - an emitter
// - objects decaying

EngineProvider.prototype.refresh = function() {
  var mydatabase = this.db;
  this.db.getCollection(function(error, c) {
    if(error) { return; }
    collection.find().stream().on('data', function(agent) {
  
      var _id = agent["_id"];

      var decay = agent["decay"];
      if(decay) {
      }

      var emitter = agent["emitter"];
      if(emitter) {
      }

      var target = agent["target"];
      if(target) {
        // targets specify next target i guess
      }

      var collects = agent["collects"];
      if(collects) {
        res.send("agent " + _id + " collects");
       // only at a certain rate...
      }
        
    });
  });
};

exports.EngineProvider = EngineProvider;

