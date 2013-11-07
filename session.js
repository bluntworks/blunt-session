var log      = require('blunt-log')
var connect  = require('connect')
var Store    = module.exports.store = require('./store.js')
var cookies  = module.exports.cookie = connect.middleware.cookieParser
var session  = module.exports.session = connect.middleware.session
var body     = module.exports.body = connect.middleware.bodyParser
var stack     = require('blunt-stack')

module.exports = function(o) {
  var stak =  stack.compose(
    cookies(),
    session({
      store: Store(o.db),
      secret: o.secret || '53cR3t',
      cookie: o.cookie || false 
    }),
    body()
  )

  return function(req, res, next) {
    stak(req, res, next)
  }
}

