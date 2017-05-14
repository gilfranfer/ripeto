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

ripetoApp.controller('HomeCntrl',
	['$scope', '$firebaseAuth', '$firebaseArray',
	function($scope, $firebaseAuth, $firebaseArray){

		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		
		auth.$onAuthStateChanged( function(user){
    		if(user){
				var allActivities = $firebaseArray(
							ref.child('users').child(user.uid).child('activities')
						);
				
				$scope.allActivities = allActivities;

				$scope.addActivity = function(){
					allActivities.$add({
						name: $scope.activityName,
						date: firebase.database.ServerValue.TIMESTAMP
					}).then( function(){
						$scope.activityName = '';
					});
				};

				$scope.deleteActivity = function(key){
					allActivities.$remove(key);
				};
    		
			}
		}); //onAuthStateChanged

	}
]);//controller

ripetoApp.controller('ErrorCntrl',['$scope',
	function($scope){

	}
]);