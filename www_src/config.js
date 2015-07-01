if (typeof(__WEBPACK_CONFIG) !== 'undefined') {
  // Our configuration has been included via webpack's
  // DefinePlugin, so we'll just export it.
  module.exports = __WEBPACK_CONFIG;
} else {
  // We're in node and have the ability to generate our configuration
  // information dynamically, so we'll do that.
  //
  // Note that this branch will be entirely removed from optimized
  // webpack builds thanks to webpack's DefinePlugin. Furthermore,
  // thanks to the way webpack analyzes dependencies, any dependencies
  // used in this branch won't be added to the dependency tree even
  // in unoptimized builds.
  var habitat = require('habitat');
  var git = require('git-rev-sync');

  // Local environment in .env overwrites everything else
  habitat.load('.env');

  var environment = habitat.get('NODE_ENV', '').toLowerCase();

  if (environment === 'production') {
    habitat.load('config/production.env');
  }

  habitat.load('config/defaults.env');

  module.exports = {
    'CLIENT_ID': habitat.get('CLIENT_ID'),
    'API_URI': habitat.get('API_URI'),
    'LOGIN_URI': habitat.get('LOGIN_URI'),
    'GIT_REVISION': git.short()
  };
}
