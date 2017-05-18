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
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray',
	function($scope, $rootScope, $firebaseAuth, $firebaseArray){

		var ref = firebase.database().ref();
		var auth = $firebaseAuth();

		$scope.addTask = function(){
			$rootScope.allTasks.$add({
				name: $scope.taskName,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$scope.taskName = '';
			});
		};

		$scope.completeTask = function(key){
			$rootScope.allTasks.$remove(key);
		};
		
		auth.$onAuthStateChanged( function(user){
    		if(user){
				var allTasks = $firebaseArray(
							ref.child('users').child(user.uid).child('tasks'));
				
				$rootScope.allTasks = allTasks;
				var updateBadge = function(){
					$rootScope.totalCount = allTasks.length;
				};

				allTasks.$loaded().then( function(data){
					updateBadge();
				} );

				allTasks.$watch( function(data){
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