
'use strict';

var app = angular.module('editApp');
app.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('liveMap', {
        url: '/liveMap',
        templateUrl: 'app/liveMap/liveMap.html',
        controller: 'LiveMapCtrl',
        authenticate: true
      });
  }]);