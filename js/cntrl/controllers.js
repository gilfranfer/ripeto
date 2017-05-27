ripetoApp.controller('AuthenticationCntrl',
	['$scope', '$rootScope', 'AuthenticationSvc', 'ConfigurationSvc',

	function($scope, $rootScope, AuthenticationSvc, ConfigurationSvc){
		
		$scope.login = function(){
			AuthenticationSvc.login($scope.user);
		};
		
		$scope.logout = function(){
			AuthenticationSvc.logout();
		};
		
		$scope.register = function(){
			AuthenticationSvc.register($scope.user, ConfigurationSvc.getAppVersion());
		};
	}]//function
);//controller

ripetoApp.controller('ErrorCntrl',['$scope',
	function($scope){

	}
]);

ripetoApp.controller('ProfileCntrl', ['$routeParams', '$rootScope', 'AuthenticationSvc',
	function($routeParams, $rootScope, AuthenticationSvc){

		var uid =$routeParams.uid;
		$rootScope.profileData = AuthenticationSvc.loadUserProfileData(uid);
	}
]);

ripetoApp.controller('HomeCntrl',['$scope',
	function($scope){

	}
]);