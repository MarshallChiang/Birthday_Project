var createError = require('http-errors'),
  express = require('express'),
  path = require('path'),
  logger = require('morgan'),
  session = require('express-session'),
  credential = require('./public/javascripts/credential')

var indexRouter = require('./routes/index');
var ajaxRouter = require('./routes/ajax');

var app = express();

app.set('trust proxy', 1)
app.use(session({
  secret: credential.secret,
  name: 'sessionId',
  cookie : {maxAge: credential.maxAge}
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// set routes
app.use('/', indexRouter);
app.use('/ajax', ajaxRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
