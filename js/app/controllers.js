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
		
		$rootScope.tasksOrder = "name";
		$rootScope.reverseOrder = false;
		if( $rootScope.activeTasksList  == undefined){	
			$rootScope.activeTasksList = "All";
		}

		//Firebase stuff
		var auth = $firebaseAuth();
		var usersFolder = firebase.database().ref().child('users');

		auth.$onAuthStateChanged( function(user){
			console.log("TskCntrl - On Auth State");

    		if(user && (!$rootScope.userLists || !$rootScope.openTasks == undefined) ){
				console.log("TskCntrl - Creating Task References");

				let userTasksRef = usersFolder.child(user.uid).child('tasks');
    			let userListsRef = usersFolder.child(user.uid).child('lists');
				let openTasksQuery = userTasksRef.orderByChild("status").equalTo("open");
				
				let openTasksArray = $firebaseArray( openTasksQuery );
				let userListsArray = $firebaseArray( userListsRef );
				$rootScope.openTasks = openTasksArray;
				$rootScope.userLists = userListsArray;
			
				/*userTasksArray.$loaded().then( function(data){
					console.log("Loaded: User Tasks");
					$rootScope.updateBadge();
				} );*/

				openTasksArray.$watch( function(data){
					console.log("Watch: Event on Open Tasks");
					$rootScope.updateBadge();
				} );	
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
				//$scope.taskName = '';//Reset Taskname model after persist
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
		
		$rootScope.updateBadge = function(){
			var totalOpen = 0;
			var totalClosed = 0;
			$rootScope.openTasks.forEach(function(element) {
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
	    
	    $scope.loadClosedTaks = function(bool) {
			//console.log("Trying to load Closed tasks");
    		if( $rootScope.currentUser && !$rootScope.closedTasks ){
				console.log("Loading closed Tasks on Demand");

				let userTasksRef = usersFolder.child($rootScope.currentUser.$id).child('tasks');
				let closedTasksQuery = userTasksRef.orderByChild("status").equalTo("closed"); 
				let closedTasksArray = $firebaseArray( closedTasksQuery );
				$rootScope.closedTasks = closedTasksArray;
				closedTasksArray.$watch( function(data){
					console.log("Watch: Event on Closed Tasks");
					$rootScope.updateBadge();
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
]);//controller

ripetoApp.controller('TaskDetailCntrl',
  ['$scope', '$rootScope', '$location', '$routeParams', '$firebaseObject',
	function($scope, $rootScope, $location, $routeParams, $firebaseObject) {
		let whichUser = $rootScope.currentUser.$id;
		let whichTask = $routeParams.tId;
	    var ref = firebase.database().ref().child('users').child(whichUser).child("tasks").child(whichTask);
		$scope.currentTask = $firebaseObject(ref);
		
		$scope.updateTask = function(){
			/*var taskDuedate = $( "#datepicker" ).datepicker( "getDate" );
			if(taskDuedate != null ){ 
				$scope.currentTask.dueDate = taskDuedate.getTime(); }*/	
			$scope.appMessages = { };
			$scope.currentTask.$save().then(function(ref) {
			   $scope.appMessages.editTaskSuccessMsg = "Record Saved";
			}, function(error) {
				$scope.appMessages.editTaskErrorMsg = error;
			});
		};
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