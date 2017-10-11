var ripetoApp = angular.module('ripetoApp',['ngRoute','firebase','ngDialog']);

ripetoApp.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
			when('/about', {
				templateUrl: 'views/home.html'
			}).
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
			when('/task/:tId', {
				templateUrl: 'views/editTask.html',
				controller:  'EditTaskCntrl',
				resolve: {
					currentAuth: function(AuthenticationSvc){
						return AuthenticationSvc.isUserLoggedIn();
					}
				}
			}).
			when('/error', {
				templateUrl: 'views/errors/general.html'
			}).
			when('/error-login', {
				templateUrl: 'views/errors/login.html',
				controller: 'ErrorCntrl'
			}).
			otherwise({
				redirectTo: 'about'
			});
	}
]);

ripetoApp.config(['ngDialogProvider', function (ngDialogProvider) {
            ngDialogProvider.setDefaults({
                className: 'ngdialog-theme-default',
                plain: false,
                showClose: false,
                closeByDocument: false,
                closeByEscape: true,
                appendTo: false,
                preCloseCallback: function () {
                    console.log('default pre-close callback');
                }
            });
}]);
        
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