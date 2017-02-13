var express = require('express');
var db = require('./model/db');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var customer = require('./routes/user/customer');
var vendor = require('./routes/vendor/vendor');
var drug = require('./routes/drug/drug');
var prescription = require('./routes/drug/prescription');
var orders = require('./routes/orders/orders');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"samplesession", resave: true, saveUninitialized: false}));

app.use('/', routes);

//USER ROUTES
app.get('/login', customer.login);			//Login Form
app.post('/login/:contact', customer.doLogin);		//Login action
	
//CUSTOMER Services
app.post('/customer/new', customer.create);	//Register new customer
app.get('/customer/:contact', customer.profile);	//Get customer profile
app.post('/customer/update/:contact', customer.udpate);		//Update customer profile
app.post('/customer/login/:contact', customer.doLogin);		//Login action


//VENDORServices
app.post('/vendor/new', vendor.create);	//Register new vendor
app.get('/vendor/:contact', vendor.profile);	//Get vendor profile
app.post('/vendor/update/:contact', vendor.udpate);		//Update vendor profile
//app.post('/vendor/login/:contact', vendor.doLogin);		//Login action

//USER DRUG PRESCRIPTION ROUTES
app.get('/prescription/new', prescription.create);
app.post('/prescription/new', prescription.doCreate);
app.get('/prescription/byuser/:contact', prescription.byUser);

//DRUG ROUTES
app.get('/drug/new', drug.create);
app.post('/drug/new', drug.doCreate);

// ORDER ROUTES - DONE & TESTED
app.post('/orders/new', orders.create);
app.post('/orders/update/:orderId', orders.update);
app.get('/orders/customer/:customerContact', orders.byUser);
app.get('/orders/order/:orderId', orders.byOrderId);
app.get('/orders/customer/:contact/:status', orders.byContact);
app.get('/orders/vendor/:contact/:status', orders.byContact);
app.get('/orders/customer/:contact', orders.byContact);
app.get('/orders/vendor/:contact', orders.byContact);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
