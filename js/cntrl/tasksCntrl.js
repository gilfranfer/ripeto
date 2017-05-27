ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject',
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject){
		$scope.tasksOrder= "date";
		$scope.activeTasksList= "Default";
		//$scope.taskType= "normal";
		
		var baseRef = firebase.database().ref();
		var userRef = undefined;
		var userTasksRef = undefined;
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();


		$scope.addTask = function(){
			$rootScope.userTasks.$add({
				name: $scope.taskName,
				date: firebase.database.ServerValue.TIMESTAMP,
				status: 'open',
				inList: $scope.activeTasksList
			}).then( function(){
				$scope.taskName = '';
			});
		};

		
		$scope.closeTask = function(id){
			userTasksRef.child(id).update(
					{status:'closed' ,closed: firebase.database.ServerValue.TIMESTAMP});
		};
		
		$scope.deleteTask = function(id){
			var refDel = userTasksRef.child(id);
		    var record = $firebaseObject(refDel);
		    record.$remove(id);
			//$rootScope.userTasks.$remove(key);
		};
		
		$scope.openTask = function(id){
			userTasksRef.child(id).update(
					{status:'open' ,closed: null});
		};
		
		$rootScope.updateBadge = function(){
			var totalOpen = 0;
			var totalClosed = 0;
			$rootScope.userTasks.forEach(function(element) {
			    if(element.status == 'open'){
			    	totalOpen ++;
			    }else if(element.status == 'closed'){
			    	totalClosed ++;
			    }
			});
			$rootScope.totalClosedTasks = totalClosed;
			$rootScope.totalOpenTasks = totalOpen;
		};
				
		auth.$onAuthStateChanged( function(user){
    		if(user){
    			userRef = baseRef.child('users').child(user.uid);
    			userTasksRef = userRef.child('tasks');
				var userTasks = $firebaseArray(userTasksRef);
				var taskLists = $firebaseArray(userRef.child('lists'));
				
				$rootScope.userTasks = userTasks;
				$rootScope.taskLists = taskLists;
				
				userTasks.$loaded().then( function(data){
					$rootScope.updateBadge();
				} );

				userTasks.$watch( function(data){
					$rootScope.updateBadge();
				} );
			}
		}); //onAuthStateChanged

	}
]);//controller