const statusController = require('./controllers/status_controller');

module.exports = (app) => {
  app.get('/', statusController.getStatus);
};
