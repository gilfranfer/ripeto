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
				controller:  'AuthenticationCntrl'
			}).
			when('/profile/:uid', {
				templateUrl: 'views/profile.html',
				controller:  'ProfileCntrl',
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				}
			}).
			when('/tasks', {
				templateUrl: 'views/tasks.html',
				controller:  'TasksCntrl',
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				}
			}).
			when('/home', {
				templateUrl: 'views/home.html',
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
				redirectTo: 'home'
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