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
				controller: 'RegisterCntrl'
			}).
			when('/register',{
				templateUrl: 'views/register.html',
				controller: 'RegisterCntrl'
			}).
			when('/success', {
				templateUrl: 'views/success.html',
				controller: 'SuccessCntrl'
			}).
			otherwise({
				redirectTo: 'login'
			});
	}
]);