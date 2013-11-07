var log      = require('blunt-log')
var Store    = require('./node_modules/connect/lib/middleware/session/store.js')
var delRange = require('level-delete-range')

var LSS = module.exports = function LSS(db) {
  if(!(this instanceof LSS)) return new LSS(db)
  this.db = db
}

LSS.prototype.__proto__ = Store.prototype

LSS.prototype.get = function(sid, fn) {
  var self = this
  var db = self.db
  var expires
  db.get(sid, function(err, sess) {
    if(err || !sess) return fn()
    expires = 'string' == typeof sess.cookie.expires
      ? new Date(sess.cookie.expires)
      : sess.cookie.expires;
    if(!expires || new Date < expires) {
      fn(null, sess)
    } else { self.destroy(sid, fn) }
  })
}

LSS.prototype.set = function(sid, sess, fn) {
  var self = this
  self.db.put(sid, sess, { valueEncoding: 'json' }, function(err) {
    if(err) return fn && fn(err)
    fn && fn()
  })
}

LSS.prototype.destroy = function(sid, fn) {
  var self = this
  self.db.del(sid, function(err) {
    if(err) return fn && fn(err)
    fn && fn()
  })
}

LSS.prototype.all = function(fn) {
  var self = this
  var rs = self.db.readStream()
  var all = []
  rs.on('data', function(sess) {
    all.push(sess)
  })
  .on('error', function(err) {
    fn && fn(err)
  })
  .on('end', function() {
    fn && fn(null, all)
  })
}

LSS.prototype.clear = function(fn) {
  var self = this
  var prfx = self.db.prefix()
  delRange(self.db, { start: prfx, end: prfx + '\xff'}, function(err) {
    if(err) return fn && fn(err)
    fn && fn(err)
  })
}

LSS.prototype.length = function(fn) {
  var self = this
  self.all(function(err, all) {
    if(err) return fn && fn(err)
    fn && fn(null, all && all.length)
  })
}
