ripetoApp.controller('RegisterCntrl',['$scope', 
	function($scope){
		$scope.login = function(){
			$scope.message = "Welcome again!";
		}
		$scope.register = function(){
			$scope.message = "You are part of the awesomeness";
		}
	}
]);

ripetoApp.controller('SuccessCntrl',['$scope',
	function($scope){

	}
]);