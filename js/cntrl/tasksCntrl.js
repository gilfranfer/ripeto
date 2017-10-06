ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject', 'ngDialog', 
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, ngDialog){
		$scope.tasksOrder = "dueDate";
		$scope.taskDirection = "";
		$scope.taskDirectionLabel = "Asc";
		$scope.dpValue = "Due Date: MM/DD/YYYY";
		$rootScope.activeTasksList = "Default";
		
		var baseRef = firebase.database().ref();
		var userRef = undefined;
		var userTasksRef = undefined;
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();


		$scope.addTask = function(){
			var list = $( "#list-select" ).val();
			var taskDuedate = $( "#datepicker" ).datepicker( "getDate" );
			var dpValue = $( "#datepicker" ).val();
			
			//null and undefined are false
			if(!list || 0 === list.length){ list = "Default"; }
			console.log("After:"+ list);
			
			var taskObject = {
				name: $scope.taskName,
				date: firebase.database.ServerValue.TIMESTAMP,
				status: 'open',
				inList: list
			};
			
			if(taskDuedate != null && dpValue != $scope.dpValue){ taskObject.dueDate = taskDuedate.getTime(); }
			
			$rootScope.userTasks.$add( taskObject ).then( function(){
				$scope.taskName = '';
				$( "#datepicker" ).val($scope.dpValue);
			});
		};

		
		$scope.closeTask = function(id){
			userTasksRef.child(id).update(
					{status:'closed' ,closed: firebase.database.ServerValue.TIMESTAMP});
		};
		
		$scope.deleteTask = function(id){
			var refDel = userTasksRef.child(id);
		    var record = $firebaseObject(refDel);
		    record.$remove().then(function(ref) {
			  // data has been deleted locally and in the database
			}, function(error) {
			  console.log("Error:", error);
			});
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
			console.log("TskCntrl - On Auth State");
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
		
		$scope.addListDialog = function () {
			ngDialog.open({
                    template: 'views/dialogs/editLists.html',
                    className: 'ngdialog-theme-default',
                    widht: 500,
                    controller: 'ListsCntrl'
                });
	    };
	    
	    $scope.initDatePicker = function () {
          $(function () {
            $( "#datepicker" ).datepicker();
          });
      };

      $scope.initDatePicker();

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
			var taskDuedate = $( "#datepicker" ).datepicker( "getDate" );
			if(taskDuedate != null ){ 
				$scope.currentTask.dueDate = taskDuedate.getTime(); }
			
			$scope.currentTask.$save().then(function(ref) {
			  $scope.successmsg = "Record Saved";
			}, function(error) {
				$scope.errormsg = error;
			});
		};	
		
		$scope.initDatePicker = function () {
		  $(function () {
		    $( "#datepicker" ).datepicker();
		  });
		};
		
		$scope.initDatePicker();
	}

]);

ripetoApp.controller('ListsCntrl',['$scope', '$rootScope', '$firebaseArray', '$firebaseObject',
	function($scope,$rootScope,$firebaseArray,$firebaseObject){
		$scope.regex = "[a-zA-Z0-9\\s]{4,25}";
		$scope.listToCreate;
		$scope.listToDelete;
		
		var listsRef = firebase.database().ref().child('users')
							.child($rootScope.currentUser.$id).child('lists');
		var tasksRef = firebase.database().ref().child('users')
							.child($rootScope.currentUser.$id).child('tasks');
		 
		
		listsRef.on('child_removed', function(data) {
			moveTasksToDefaultList(data.val().name);
		});

		var moveTasksToDefaultList = function(origList){
			var list = $firebaseArray(tasksRef.orderByChild("inList").equalTo(origList));
			
			list.$loaded()
			.then(function(data) {
				console.log("Moving Tasks to Default List");
				list.forEach(function(element, index) {
					element.inList = "Default";
				    list.$save(index);
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
			});
		};
		
		$scope.createNewList = function(){
			$rootScope.taskLists.$add({
				name: $scope.listToCreate,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$scope.successmsg = $scope.listToCreate+" was created";
				$scope.listToCreate = "";
			});
		};
		
		$scope.removeList = function(){
			var uid = $rootScope.currentUser.$id;
			var refDel = listsRef.child($scope.listToDelete);
			var record = $firebaseObject(refDel);
		    
		    record.$loaded().then(function() {
				var listname = record.name;
					
			    record.$remove().then(function(ref) {
			    	$scope.successmsg = listname + " list was deleted";
			    }, function(error) {
					$scope.errormsg = error;
				});
				
		    });
		    
		};
		
	}
]);