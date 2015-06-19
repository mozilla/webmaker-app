var owasp = require('owasp-password-strength-test');

// this removes the repeating character required test
// https://github.com/cadecairos/PassTest/blob/master/index.js
owasp.tests.required.splice(2, 1);

//https://github.com/mozilla/id.webmaker.org/blob/develop/web/server.js#L13
owasp.config({
  minLength: 8,
  maxLength: 256,
  minPhraseLength: 20,
  minOptionalTestsToPass: 2,
  allowPassphrases: true
});

module.exports = {

  // TODO: errors are added to strings.xml, but they need to be loaded here
  validators: {
    email: {
      regex: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
      message: 'Please use a valid email address.'
    },
    password: {
      test: function (input) {
        input = input || '';
        return owasp.test(input).strong;
      },
      message: 'Your password must be at least 8 characters and contain at least 1 number and 1 letter'
    },
    username: {
      regex: /^[a-zA-Z0-9\-]{1,20}$/,
      message: 'Must be 1-20 characters long and use only "-" and alphanumeric symbols.'
    }
  },

  // Looks at this.fields, and returns an object of errors
  // keyed on field.name
  //
  // e.g. this.fields should look like:
  // [{
  //   name: 'username',
  //   label: 'Username',
  //   required: true,
  //   validations: 'username'
  // },
  // {
  //   name: 'email',
  //   label: 'Email',
  //   type: 'email',
  //   required: true,
  //   validations: 'email'
  // },
  // {
  //   name: 'password',
  //   label: 'Password',
  //   type: 'password',
  //   required: true,
  //   validations: ['passwordLength', 'lowerCase', 'upperCase', 'numbers']
  // }]

  getValidationErrors: function () {
    var errors = {};
    var fields = this.fields;

    if (!fields) {
      return errors;
    }

    fields.forEach(fieldData => {

      var field = fieldData.name;
      var value = this.state[field];
      var isRequired = fieldData.required;
      var isEmpty = !value && value !== 0;
      var validations = fieldData.validations;

      // Required
      if (isRequired && isEmpty) {
        errors.requiredFieldsMissing = true;
      }

      // Custom Validation
      if (validations) {
        if (typeof validations === 'string') {
          validations = [validations];
        }
        validations.forEach(type => {
          var validation = this.validators[type];
          var errorMessage = validation.message;
          var test = validation.test || (input) => validation.regex.test(input);

          // Test the value if it is non-emptynpm tun
          if (!isEmpty && !test(value)) {
            errors[field] = errors[field] || [];
            errors[field].push(errorMessage);
          }

        });
      }

    });

    return errors;
  }
};
