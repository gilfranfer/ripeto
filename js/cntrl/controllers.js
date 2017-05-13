ripetoApp.controller('AuthenticationCntrl',
	['$scope', 'AuthenticationSvc',

	function($scope, AuthenticationSvc){
		
		$scope.login = function(){
			AuthenticationSvc.login($scope.user);
		};
		
		$scope.logout = function(){
			AuthenticationSvc.logout();
		};
		
		$scope.register = function(){
			AuthenticationSvc.register($scope.user);
		};
	}]//function
);//controller

ripetoApp.controller('HomeCntrl',['$scope',
	function($scope){

	}
]);

ripetoApp.controller('ErrorCntrl',['$scope',
	function($scope){

	}
]);