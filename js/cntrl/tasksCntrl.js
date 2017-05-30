ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject', 'ngDialog', 
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, ngDialog){
		$scope.tasksOrder = "date";
		$scope.taskDirection = "";
		$scope.taskDirectionLabel = "Asc";
		
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
				inList: $rootScope.activeTasksList
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
		
		$scope.changeTasksDirection = function(){
			if ($scope.taskDirectionLabel === "Asc"){
				$scope.taskDirection = "reverse";
				$scope.taskDirectionLabel = "Des";
			}else{
				$scope.taskDirection = "";
				$scope.taskDirectionLabel = "Asc";
			}
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
			console.log("On Auth State");
    		if(user){
    			userRef = baseRef.child('users').child(user.uid);
    			userTasksRef = userRef.child('tasks');
				var userTasks = $firebaseArray(userTasksRef);
				var taskLists = $firebaseArray(userRef.child('lists'));
				
				$rootScope.userTasks = userTasks;
				$rootScope.taskLists = taskLists;
				$rootScope.activeTasksList = "Default";
				
				userTasks.$loaded().then( function(data){
					$rootScope.updateBadge();
				} );

				userTasks.$watch( function(data){
					$rootScope.updateBadge();
				} );
			}
		}); //onAuthStateChanged
		
		$scope.addListDialog = function () {
			ngDialog.open({
                    template: 'views/dialogs/addList.html',
                    className: 'ngdialog-theme-default',
                    height: 250, widht: 500,
                    controller: 'ListsCntrl'
                });
	    };

	}
]);//controller

ripetoApp.controller('EditTaskCntrl',
  ['$scope', '$rootScope', '$location', '$routeParams', '$firebaseObject',
	function($scope, $rootScope, $location, $routeParams, $firebaseObject) {
		var whichUser = $routeParams.uId;
		var whichTask = $routeParams.tId;
	    var ref = firebase.database().ref().child('users').child(whichUser).child("tasks").child(whichTask);
		$scope.currentTask = $firebaseObject(ref);
		
		$scope.updateTask = function(){
			$scope.currentTask.$save().then(function(ref) {
			  $scope.successmsg = "Record Saved";
			}, function(error) {
				$scope.errormsg = error;
			});
		};
	}
]);

ripetoApp.controller('ListsCntrl',['$scope', '$rootScope', '$firebaseArray',
	function($scope,$rootScope,$firebaseArray){
		$scope.title = "Add Your List Here";
		$scope.regex = "[a-zA-Z0-9\\s]{4,25}";
		$scope.listName;
		
		$scope.createNewList = function(){
			$rootScope.taskLists.$add({
				name: $scope.listName,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$rootScope.activeTasksList = $scope.listName;
				$scope.message = "List was created";
				$scope.listName = "";
			});
		};
	}
]);