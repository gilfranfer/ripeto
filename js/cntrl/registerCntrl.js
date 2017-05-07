ripetoApp.controller('RegisterCntrl',
	['$scope', 'AuthenticationSvc',

	function($scope, AuthenticationSvc){
		
		$scope.login = function(){
			AuthenticationSvc.login($scope.user);
		};
		

		$scope.register = function(){
			AuthenticationSvc.register($scope.user);
		};
	}]//function
);//controller

ripetoApp.controller('SuccessCntrl',['$scope',
	function($scope){

	}
]);