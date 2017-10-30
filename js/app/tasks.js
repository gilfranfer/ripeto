ripetoApp.controller('TasksCntrl',
	['$scope', '$rootScope', '$firebaseAuth', '$firebaseArray','$firebaseObject', 'TimerSvc',
	function($scope, $rootScope, $firebaseAuth, $firebaseArray, $firebaseObject, TimerSvc){

		$rootScope.tasksOrder = "date";
		$rootScope.reverseOrder = true;
		if( $rootScope.activeTasksList  == undefined){
			$rootScope.activeTasksList = "All";
		}

		//Firebase stuff
		var auth = $firebaseAuth();
		var usersFolder = firebase.database().ref().child('users');

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser /*&& (!$rootScope.userLists || !$rootScope.openTasks )*/ ){
				console.log("TskCntrl - Creating Task References");

				//Load only lists tha are not "Secret"
				let userListsQuery = usersFolder.child(authUser.uid).child('lists').orderByChild("secret").equalTo(false);
				let openTasksQuery = usersFolder.child(authUser.uid).child('tasks').orderByChild("status").equalTo("open");
				let openTasksArray = $firebaseArray( openTasksQuery );
				let userListsArray = $firebaseArray( userListsQuery );
				$rootScope.openTasks = openTasksArray;
				$rootScope.userLists = userListsArray;

				//Get Timer and Init
				let dbTimer = $firebaseObject( usersFolder.child(authUser.uid).child('timers').orderByChild("status").equalTo("open"));
				dbTimer.$loaded()
				  .then(function(data) {
					TimerSvc.init(data);
				  })
				  .catch(function(error) {
				    console.log("DBTIMER error:"+ error);
				  });

				//userListsArray.$loaded().then( function(data){ console.log(data); } );
				//openTasksArray.$watch( function(data){} );
			}
		});

		//Custom functions
		$scope.createTask = function(){
			let list = $rootScope.activeTasksList;
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

			$rootScope.openTasks.$add( taskObject ).then( function(){
			$scope.taskName = '';//Reset Taskname model after persist
			});
			//console.log(taskObject);
		};

		$scope.closeTask = function(id){
			usersFolder.child($rootScope.currentUser.$id).child('tasks').child(id).update(
					{status:'closed', closed: firebase.database.ServerValue.TIMESTAMP});
		};

		$scope.deleteTask = function(id){
			var record = $firebaseObject(usersFolder.child($rootScope.currentUser.$id).child('tasks').child(id));
		    record.$remove().then(function(ref) {
			  // data has been deleted locally and in the database
			}, function(error) {
			  console.error("Error:", error);
			});
			//$rootScope.openTasks.$remove(key);
		};

		$scope.reopenTask = function(id){
			usersFolder.child($rootScope.currentUser.$id).child('tasks').child(id).update(
					{status:'open' ,closed: null});
		};

		// Closed tasks wil be loaded on demand.
	    $scope.loadClosedTaks = function(bool) {
    		if( $rootScope.currentUser && !$rootScope.closedTasks ){
				let userTasksRef = usersFolder.child($rootScope.currentUser.$id).child('tasks');
				let closedTasksQuery = userTasksRef.orderByChild("status").equalTo("closed");
				let closedTasksArray = $firebaseArray( closedTasksQuery );
				$rootScope.closedTasks = closedTasksArray;
				closedTasksArray.$watch( function(data){
					console.log("Watch: Event on Closed Tasks");
					//$rootScope.updateBadge();
				} );
			}
		};

		$scope.reverseDisplay = function(bool) {
			$rootScope.reverseOrder = bool;
		};

		$scope.orderTaskBy = function(value) {
			$rootScope.tasksOrder = value;
		};

		$scope.setActiveList = function(name) {
			$rootScope.activeTasksList = name;
		};

	}
]);

ripetoApp.controller('TaskDetailCntrl',
  ['$scope', '$rootScope', '$location', '$routeParams', '$firebaseObject',
	function($scope, $rootScope, $location, $routeParams, $firebaseObject) {
		$rootScope.appMessages = {};

		let whichUser = $routeParams.uid;
		let whichTask = $routeParams.tid;
		let usersFolder = firebase.database().ref().child('users');
		let currentTask = $firebaseObject(usersFolder.child(whichUser).child('tasks').child(whichTask));
		currentTask.$loaded()
		  .then(function(data) {
		    if(!data.name){
		    	//Task was not found
		    	$rootScope.appMessages.errorMessage = "The task doesn't exist";
				$location.path( "/error" );
		    }
		    $scope.currentTask = currentTask;
		  })
		  .catch(function(error) {
			$rootScope.appMessages.errorMessage = error;
			$location.path( "/error" )
		  });

		$scope.updateTask = function(){
			$scope.currentTask.$save().then(function(ref) {
			   $rootScope.appMessages.editTaskSuccessMsg = "Record Saved";
			}, function(error) {
				$rootScope.appMessages.editTaskErrorMsg = error;
			});
		};
	}
]);
