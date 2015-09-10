'use strict';

angular.module('editApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, $http) {

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.isIn = function(){
      if(Auth.isLoggedIn){
        $location.path('/');
      }
    };
    
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });