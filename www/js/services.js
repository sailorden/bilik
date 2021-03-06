// This is a JavaScript file

/**
 * Services
 */

// auth service
app.factory('auth', function ($window, salesforce_client_id) {

  return {

    get: function () {
      var data = $window.localStorage.auth;
      console.log('auth.get', data);
      return data ? JSON.parse(data) : false;
    },

    set: function (data) {
      data = JSON.stringify(data);
      console.log('auth.set', data);
      $window.localStorage.auth = data;
    },

    erase: function () {
      delete $window.localStorage.auth;
    },

    // open OAuth page in external browser
    openLogin: function () {
      $window.open(
        
        'http://auth.mercadolibre.com.ar/authorization' +
          '?response_type=token' +
          '&client_id=' + salesforce_client_id,
        '_system',
        'location=yes'
      )
    }

  }
});