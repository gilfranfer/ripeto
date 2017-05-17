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

ripetoApp.controller('ActivityCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray',
	function($scope, $rootScope, $firebaseAuth, $firebaseArray){

		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		
		
		auth.$onAuthStateChanged( function(user){
    		if(user){
				var allActivities = $firebaseArray(
							ref.child('users').child(user.uid).child('activities'));

				var allTasks = $firebaseArray(
							ref.child('users').child(user.uid).child('tasks'));
				
				var updateBadge = function(){
					$rootScope.activitiesCounter = allActivities.length;
					$rootScope.tasksCounter = allTasks.length;
					$rootScope.totalCounter = allActivities.length + allTasks.length;
				};
				
				allActivities.$loaded().then( function(data){
					updateBadge();
				} );

				allActivities.$watch( function(data){
					updateBadge();
				} );

				allTasks.$loaded().then( function(data){
					updateBadge();
				} );

				allTasks.$watch( function(data){
					updateBadge();
				} );

				$scope.allActivities = allActivities;
				$scope.allTasks = allTasks;

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
    		
    			$scope.addTask = function(){
					allTasks.$add({
						name: $scope.taskName,
						date: firebase.database.ServerValue.TIMESTAMP
					}).then( function(){
						$scope.taskName = '';
					});
				};

				$scope.deleteTask = function(key){
					allTasks.$remove(key);
				};

				$scope.ignoreActivity = function(key){
					//allTasks.$remove(key);
				};

				$scope.completeActivity = function(key){
					//allTasks.$remove(key);
				};


			}
		}); //onAuthStateChanged

	}
]);//controller

ripetoApp.controller('ErrorCntrl',['$scope',
	function($scope){

	}
]);

ripetoApp.controller('HomeCntrl',['$scope',
	function($scope){

	}
]);