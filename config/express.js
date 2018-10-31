const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const httpStatus = require('http-status');
const expressWinston = require('express-winston');
const expressValidation = require('express-validation');
const helmet = require('helmet');
const session = require('express-session');

const winstonInstance = require('./winston');
const routes = require('../index.route');
const config = require('./config');
const passport = require('./passport');
const { setViewEngine } = require('./viewEngine');
const APIError = require('../server/helpers/APIError');

const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(config.cookieSecret));
app.use(compress());
app.use(methodOverride());

setViewEngine(app);
const publicPath = path.resolve(__dirname, '../server/public');
app.use(express.static(publicPath));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.use(session({ secret: config.cookieSecret, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      winstonInstance,
      meta: false, // optional: log meta data about request (defaults to true)
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
      colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    })
  );
}
/**
 * Basic routing for the view layer
 * there should be somewhere nicer for things like this
 */
app.get('/', (req, res) => {
  if (req.user) {
    const { username } = req.user;
    return res.render('welcome', { username });
  }
  return res.render('home', { githubClientId: config.github.id });
});

app.get('/signout', (req, res) => res.redirect('/api/auth/signout'));

// mount all routes on /api path
app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    const error = new APIError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

const isAPIRoute = /^\/api/;
// catch 404 and forward to error handler
app.use((req, res, next) => {
  if (isAPIRoute.test(req.path)) {
    const err = new APIError('API not found', httpStatus.NOT_FOUND);
    return next(err);
  }
  return next();
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(
    expressWinston.errorLogger({
      winstonInstance
    })
  );
}

// error handler, send stacktrace only during development
app.use((
  err,
  req,
  res,
  next // eslint-disable-line no-unused-vars
) =>
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {}
  })
);

module.exports = app;
