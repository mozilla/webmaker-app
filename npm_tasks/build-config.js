var habitat = require('habitat');
var git = require('git-rev-sync');

// Local environment in .env overwrites everything else
habitat.load('.env');

var environment = habitat.get('NODE_ENV', '').toLowerCase();

if (environment === 'production') {
  habitat.load('config/production.env');
}

habitat.load('config/defaults.env');

var config = {
  CLIENT_ID: habitat.get('CLIENT_ID'),
  API_URI: habitat.get('API_URI'),
  LOGIN_URI: habitat.get('LOGIN_URI'),
  GIT_REVISION: git.short()
};

process.stdout.write(
  '// THIS IS A GENERATED FILE. EDIT npm_tasks/build-config.js INSTEAD\n' +
  'module.exports = ' + JSON.stringify(config) + ';\n'
);
