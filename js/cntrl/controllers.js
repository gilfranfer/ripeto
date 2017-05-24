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

ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject',
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject){
		$scope.tasksOrder= "date";
		
		var baseRef = firebase.database().ref();
		var userRef = undefined;
		var userTasksRef = undefined;
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();

		$scope.addTask = function(){
			$rootScope.userTasks.$add({
				name: $scope.taskName,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$scope.taskName = '';
			});
		};

		$scope.completeTask = function(id){
			var refDel = userTasksRef.child(id);
		    var record = $firebaseObject(refDel);
		    record.$remove(id);
			//$rootScope.userTasks.$remove(key);
		};
		
		auth.$onAuthStateChanged( function(user){
    		if(user){
    			userRef = baseRef.child('users').child(user.uid);
    			userTasksRef = userRef.child('tasks');
				var userTasks = $firebaseArray(userTasksRef);
				
				$rootScope.userTasks = userTasks;
				var updateBadge = function(){
					$rootScope.totalCount = userTasks.length;
				};

				userTasks.$loaded().then( function(data){
					updateBadge();
				} );

				userTasks.$watch( function(data){
					updateBadge();
				} );
			}
		}); //onAuthStateChanged

	}
]);//controller

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