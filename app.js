var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const wikiRouter = require('./routes/wiki')
const catalogRouter = require('./routes/catalog')
const Mongo_URL = require('./Mongo_URL')

const compression = require('compression')
const helmet = require('helmet')

var app = express();

app.use(helmet())

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

main().catch(err => console.log(err))
async function main(){
  await mongoose.connect(Mongo_URL)
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression())

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/wiki', wikiRouter)
app.use('/catalog', catalogRouter)

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
