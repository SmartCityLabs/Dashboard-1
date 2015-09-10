'use strict';

angular.module('editApp')
  .factory('User', function ($resource) {
    //$http.get('/api/settings').success(function(settingData) {
    //  console.log(settingData.API.remote_url);
    //});
    return $resource('https://maas-testapi.comtrade.com/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  });
