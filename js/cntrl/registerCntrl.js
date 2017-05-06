ripetoApp.controller('RegisterCntrl',
	['$scope', '$firebase', '$firebaseAuth',

	function($scope,$firebase,$firebaseAuth){
		
		$scope.login = function(){
			$scope.message = "Welcome again!";
		};
		

		var ref = firebase.database().ref();
		var auth = $firebaseAuth();

		$scope.register = function(){
			
			auth.$createUserWithEmailAndPassword(
					$scope.user.email, $scope.user.pwd
				).then( function(regUser){
					$scope.message = $scope.user.firstname + 
						" you are now part of the awesomeness";
				} ).catch( function(error){
					$scope.message = error.message;
				});
		};
	}]
);

ripetoApp.controller('SuccessCntrl',['$scope',
	function($scope){

	}
]);