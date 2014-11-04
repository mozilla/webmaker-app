var login = require('stellar-wallet-login');
var xhr = require('xhr');

function getAccountId(username, callback) {
    xhr({
        url: 'https://api.stellar.org/federation?type=federation&domain=stellar.org&destination=' + username,
        method: 'GET',
    }, function (err, resp, body) {
      if (err) {
            return callback(err);
        }

        var data = JSON.parse(body);
        return callback(null, data.federation_json.destination_address);
    });

}

function getBalance(accountId, callback) {
    var params = JSON.stringify(
        {
          method: 'account_lines',
          params: [
            {
              account: accountId
            }
          ]
        });

    xhr({
        body: params,
        url: 'https://live.stellar.org:9002',
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        }
    }, function (err, resp, body) {
        if (err) {
            return callback(err);
        }

        var balance = 0;
        var data = JSON.parse(body);

        if (data.result && data.result.lines) {
            data.result.lines.forEach(function(line) {
                if (line.currency == 'MOZ') {
                    balance = line.balance;
                }
            });
        }

        return callback(null, balance);
    });
}


module.exports = {
    className: 'stellar',
    template: require('./index.html'),
    data: {
        name: 'Stellar Payment',
        icon: '/images/blocks_stellar.png',
        attributes: {
        },
        
    },

    created: function() {
        var self = this;
        var secretKey = null;
        var user = null;
        var accountId = null;

        self.$data.onLogin = function(e) {
            user = e.target.querySelector('input[name="username"]').value;
            var pass = e.target.querySelector('input[name="password"]').value;
            e.preventDefault();
            login({
                user: user,
                pass: pass
            }, function(err, token, raw) {
                if (err) {
                    self.$el.querySelector('.loginError').classList.remove('hidden');
                    return;
                }

                secretKey = token;

                getAccountId(user, function (err, id) {
                    if (err) {
                        self.$el.querySelector('.loginError').classList.remove('hidden');
                        return;
                    }
                    accountId = id;
                    getBalance(accountId, function (err, balance) {
                        if (err) {
                            self.$el.querySelector('.loginError').classList.remove('hidden');
                            return;
                        }
                         
                        self.$el.querySelector('.balance').innerHTML = '';
                        self.$el.querySelector('.loggedOut').classList.add('hidden');
                        self.$el.querySelector('.loggedIn').classList.remove('hidden');

                        self.$el.querySelector('.balance').innerHTML = balance + ' MozLove';
                    });
                });
           })
        };

        self.$data.onLogout = function(e) {
            secretKey = null;
            user = null;
            accountId = null;

            self.$el.querySelector('.loginError').classList.add('hidden');
            self.$el.querySelector('.loggedOut').classList.remove('hidden');
            self.$el.querySelector('.loggedIn').classList.add('hidden');

        };
    }
};
