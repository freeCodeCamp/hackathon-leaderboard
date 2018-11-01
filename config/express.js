const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
// const mongoose = require('mongoose');
const provideRoutes = require('../index.route');
const config = require('./config');
const passport = require('./passport');
const { setViewEngine } = require('./viewEngine');
const provideErrorMiddleware = require('../server/middlewares/error');

const publicPath = path.resolve(__dirname, '../server/public');
const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
app.use(compress());
app.use(methodOverride());
app.use(express.static(publicPath));
app.use(helmet());
app.use(cors());
/* const store = new MongoDBStore({
  mongooseConnection: mongoose.connection,
  uri: 'mongodb://localhost/session_hackathon',
  collection: 'mySessions'
});

store.on('error', (error) => {
  log(error);
}); */

app.use(
  session({
    secret: config.cookieSecret,
    resave: true,
    saveUninitialized: true
  /* , store*/
  }
));
app.use(passport.initialize());
app.use(passport.session());

setViewEngine(app);
provideRoutes(app);
provideErrorMiddleware(app);

module.exports = app;
