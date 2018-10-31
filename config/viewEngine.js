const path = require('path');

const viewDir = path.resolve(__dirname, '../server/views');

exports.setViewEngine = function setViewEngine(app) {
  app.set('views', viewDir);
  app.set('view engine', 'pug');
};
