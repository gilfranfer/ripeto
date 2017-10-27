var ripetoApp = angular.module('ripetoApp',['ngRoute','firebase']);

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
			// when('/profile/:uid', {
			// 	templateUrl: 'views/profile.html',
			// 	controller:  'ProfileCntrl',
			// 	resolve: {
			// 		currentAuth: function(AuthenticationSvc){
			// 			return AuthenticationSvc.isUserLoggedIn();
			// 		}
			// 	}
			// }).
				when('/lists/:uid', {
				templateUrl: 'views/lists.html',
				controller:  'ListsCntrl',
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
			when('/task/:uid/:tid', {
				templateUrl: 'views/taskDetails.html',
				controller:  'TaskDetailCntrl',
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
				templateUrl: 'views/errors/login.html'
			}).
			otherwise({
				redirectTo: 'about'
			});
	}
]);

ripetoApp.run( ['$rootScope', '$location', function($rootScope,$location){

	$rootScope.$on('$routeChangeError', function( event, next, previous, error){
		if(error == 'AUTH_REQUIRED'){
			$location.path('/error-login');
		}else{
			$rootScope.appMessages.errorMessage = error;
			$location.path('/error');
		}
	});

}]);

ripetoApp.factory( 'ConfigurationSvc',
	['$rootScope','$firebaseObject','$firebaseAuth',

	function($rootScope,$firebaseObject,$firebaseAuth){
		var currentAppVersion = "0.1.1"

		var putTasksOnDefaultList = function(userData){
			if (userData.tasks === undefined ){
				console.log("No Tasks to Update");
			}else{
				var count = 0;
				Object.keys(userData.tasks).map(
					function (key) {
						if( userData.tasks[key].inList === undefined){
							userData.tasks[key].inList = "Default";
						}
						return userData.tasks[key];
					});
				console.log(count + " Tasks updated");
			}
		};

		return{
			upgradeUserConfig: function( user ){

				user.$loaded().then( function(data) {
				    if ( user.config === undefined
				    		|| user.config.appVersion !== currentAppVersion ){
						console.log("User needs some updates");
						//Update App Version on Conf Folder
						user.config = {appVersion:currentAppVersion};
						//Create Default Task List (Consider to check if lists folder is empty )
						user.lists = { "default": {name:"Default", date:firebase.database.ServerValue.TIMESTAMP} };
						putTasksOnDefaultList(user);
						user.$save();
					}else{
						console.log("User is up to date "+ currentAppVersion );
					}
				}).catch(function(error) {
					console.error("Error:", error);
				});

				return "";
			},
			getAppVersion: function(){
				return currentAppVersion;
			}
		};
	}
]);
