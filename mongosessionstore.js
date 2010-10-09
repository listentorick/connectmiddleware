var sys =require('sys');
var DataProvider = require("./lib/mongodataprovider/dataprovider").DataProvider;


//not sure what to do here....
//so far accompany only includes bear.. should I be referencing a bear dependency - NO
//should this be part of bear?
var Store = require('./lib/connect/lib/connect/middleware/session/store');

/**
 * Initialize MongoSessionStore with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

var MongoSessionStore = module.exports = function MongoSessionStore(options) {
    options = options || {};
    Store.call(this, options);
    var self = this;
	this._provider = new DataProvider(options.databaseHost,options.databasePort,options.databaseName, "session");
	
	
    //var connection = new DB(options.databaseName, new Server(options.databaseHost, options.databasePort, {}), {});
    //connection.open(function(err, db){
     //   db.collection(options.collection || 'Session', function(err, collection){
      //      self.client = collection;
       // });
    //});
};

sys.inherits(MongoSessionStore, Store);

/**
 * Attempt to fetch session by the given `hash`.
 *
 * @param {String} hash
 * @param {Function} fn
 * @api public
 */

MongoSessionStore.prototype.get = function(hash, fn){
    this._provider.findOne({_id: hash}, function(err, data){
        try {
            if (data) delete data._id;
            // TODO: fail if expired
            fn(null, data);
        } catch (err) {
            fn(err);
        }
    });
};

/**
 * Commit the given `sess` object associated with the given `hash`.
 *
 * @param {String} hash
 * @param {Session} sess
 * @param {Function} fn
 * @api public
 */

MongoSessionStore.prototype.set = function(hash, sess, fn){
    var self = this;
    try {
		sess._id = hash;
        this._provider.update({_id: hash}, sess, function(err, data){
            if (data) delete data._id;
            fn && fn.apply(this, arguments);
        });
    } catch (err) {
        fn && fn(err);
    }
};

/**
 * Destroy the session associated with the given `hash`.
 *
 * @param {String} hash
 * @api public
 */

MongoSessionStore.prototype.destroy = function(hash, fn){
    this._provider.remove({_id: hash}, fn);
};

/**
 * Fetch number of sessions.
 *
 * @param {Function} fn
 * @api public
 */

MongoSessionStore.prototype.length = function(fn){
    this._provider.count({}, fn);
};

/**
 * Clear all sessions.
 *
 * @param {Function} fn
 * @api public
 */

MongoSessionStore.prototype.clear = function(fn){
    this._provider.drop(fn);
};
