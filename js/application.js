var ripetoApp = angular.module('ripetoApp',['ngRoute','firebase']);

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
			when('/config', {
				templateUrl: 'views/addactivities.html',
				controller: 'ActivityCntrl',
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				}
			}).
			when('/activities', {
				templateUrl: 'views/activities.html',
				controller: 'ActivityCntrl',
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				}
			}).
			when('/init', {
				templateUrl: 'views/index.html',
				controller: 'HomeCntrl'
			}).
			when('/error', {
				templateUrl: 'views/errors/general.html',
				controller: 'ErrorCntrl'
			}).
			when('/error-login', {
				templateUrl: 'views/errors/login.html',
				controller: 'ErrorCntrl'
			}).
			otherwise({
				redirectTo: 'init'
			});
	}
]);

ripetoApp.run( ['$rootScope', '$location', function($rootScope,$location){

	$rootScope.$on('$routeChangeError', function( event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
			$location.path('/error-login');
		}else{		
			$rootScope.routeErrorMessage = error;	
			$location.path('/error');
		}
	});

}]);