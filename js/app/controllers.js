ripetoApp.controller('AuthenticationCntrl',
	['$scope', '$rootScope', 'AuthenticationSvc', 'ConfigurationSvc',

	function($scope, $rootScope, AuthenticationSvc, ConfigurationSvc){
		
		$scope.login = function(){
			AuthenticationSvc.loginUser($scope.user);
		};
		
		$scope.logout = function(){
			AuthenticationSvc.logout();
		};
		
		$scope.register = function(){
			AuthenticationSvc.register($scope.regUser, ConfigurationSvc.getAppVersion());
		};

		$scope.clearErrors = function () {
			$rootScope.appMessages = { };
		};
		
		$scope.clearErrors()
	}]//function
);//controller

ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject', 'ngDialog', 
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, ngDialog){
		//Default values for some utility variables
		$scope.tasksOrder = "name";
		$scope.reverseOrder = false;
		$scope.activeTasksList = "All";
		
		$rootScope.userTasks = undefined;
		$rootScope.userLists = undefined;
		$rootScope.totalClosedTasks = undefined;
		$rootScope.totalOpenTasks = undefined;

		//Firebase stuff
		var auth = $firebaseAuth();
		var baseRef = firebase.database().ref();
		var userRef = undefined;
		var userTasksRef = undefined;

		auth.$onAuthStateChanged( function(user){
			console.log("TskCntrl - On Auth State");
    		if(user){
    			userRef = baseRef.child('users').child(user.uid);
    			userTasksRef = userRef.child('tasks');
				let userTasks = $firebaseArray( userTasksRef );
				let userLists = $firebaseArray( userRef.child('lists') );
				
				$rootScope.userTasks = userTasks;
				$rootScope.userLists = userLists;
				
				userTasks.$loaded().then( function(data){
					$rootScope.updateBadge();
				} );

				userTasks.$watch( function(data){
					$rootScope.updateBadge();
				} );
			}
		}); 

		//Custom functions
		$scope.createTask = function(){
			let list = $scope.activeTasksList;
			//Task created while showing All Tasks,
			//get created in Default List
			if( list === 'All'){
				list = 'Default';
			}

			var taskObject = {
				name: $scope.taskName,
				status: 'open',
				inList: list,
				date: firebase.database.ServerValue.TIMESTAMP				
			};

			//Reset Taskname model after persist
			$rootScope.userTasks.$add( taskObject ).then( function(){
				$scope.taskName = '';
			});
			console.log(taskObject);
		};

		$scope.closeTask = function(id){
			userTasksRef.child(id).update(
					{status:'closed', closed: firebase.database.ServerValue.TIMESTAMP});
		};
		
		$scope.deleteTask = function(id){
			var record = $firebaseObject(userTasksRef.child(id));
		    record.$remove().then(function(ref) {
			  // data has been deleted locally and in the database
			}, function(error) {
			  console.error("Error:", error);
			});
			//$rootScope.userTasks.$remove(key);
		};
		
		$scope.reopenTask = function(id){
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
		
		$scope.addListDialog = function () {
			ngDialog.open({
                    template: 'views/dialogs/editLists.html',
                    className: 'ngdialog-theme-default',
                    widht: 500,
                    controller: 'ListsCntrl'
                });
	    };
	    
	    $scope.reverseDisplay = function(bool) {
			$scope.reverseOrder = bool;
		};

		$scope.orderTaskBy = function(value) {
			$scope.tasksOrder = value;
		};
		
		$scope.setActiveList = function(name) {
			$scope.activeTasksList = name;
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
			var taskDuedate = $( "#datepicker" ).datepicker( "getDate" );
			if(taskDuedate != null ){ 
				$scope.currentTask.dueDate = taskDuedate.getTime(); }
			
			$scope.currentTask.$save().then(function(ref) {
			  $scope.successmsg = "Record Saved";
			}, function(error) {
				$scope.errormsg = error;
			});
		};	
		/*
		$scope.initDatePicker = function () {
		  $(function () {
		    $( "#datepicker" ).datepicker();
		  });
		};
		
		$scope.initDatePicker();*/
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

ripetoApp.controller('ProfileCntrl', ['$routeParams', '$rootScope', 'AuthenticationSvc',
	function($routeParams, $rootScope, AuthenticationSvc){

		var uid =$routeParams.uid;
		$rootScope.profileData = AuthenticationSvc.loadUserProfileData(uid);
	}
]);