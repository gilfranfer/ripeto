var ripetoApp = angular.module('ripetoApp',['ngRoute','firebase']);

/*
Basic controller example:
ripeto.controller('registerCtrl', [
	'$scope', 
	function($scope){
		$scope.message = "Welcome to Ripeto";
	}
] );
<div ng-controller="registerCtrl">
*/

ripetoApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
			when('/login',{
				templateUrl: 'views/login.html',
				controller: 'AuthenticationCntrl'
			}).
			when('/register',{
				templateUrl: 'views/register.html',
				controller: 'AuthenticationCntrl'
			}).
			when('/home', {
				templateUrl: 'views/home.html',
				controller: 'HomeCntrl'
			}).
			when('/index', {
				templateUrl: 'views/index.html',
				controller: 'HomeCntrl'
			}).
			otherwise({
				redirectTo: 'index'
			});
	}
]);