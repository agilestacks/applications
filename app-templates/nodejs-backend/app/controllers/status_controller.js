const pkg = require('../../package');

module.exports = {
  getStatus(req, res) {
    res.json({
      name: pkg.name,
      version: pkg.version,
      uptime: process.uptime(),
    });
  },
};
