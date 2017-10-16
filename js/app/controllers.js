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
);

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

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser && (!$rootScope.userLists || !$rootScope.openTasks ) ){
				console.log("TskCntrl - Creating Task References");

				let userListsQuery = $rootScope.userListsRef.orderByChild("name");
				let openTasksQuery = $rootScope.userTasksRef.orderByChild("status").equalTo("open");
				let openTasksArray = $firebaseArray( openTasksQuery );
				let userListsArray = $firebaseArray( userListsQuery );
				$rootScope.openTasks = openTasksArray;
				$rootScope.userLists = userListsArray;
			
				/*userTasksArray.$loaded().then( function(data){
					console.log("Loaded: User Tasks");
					$rootScope.updateBadge();
				} );*/

				openTasksArray.$watch( function(data){
					//console.log("Watch: Event on Open Tasks");
					//$rootScope.updateBadge();
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

		let whichTask = $routeParams.tid;
		let whichUser = $rootScope.currentUser.$id;
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

ripetoApp.controller('ListsCntrl',['$scope', '$rootScope', '$firebaseArray', '$firebaseObject',
	function($scope,$rootScope,$firebaseArray,$firebaseObject){
		$rootScope.appMessages = {};

		$scope.regex = "[a-zA-Z0-9\\s]{4,25}";
		let whichUser = $rootScope.currentUser.$id;
		var listsRef = firebase.database().ref().child('users')
							.child(whichUser).child('lists');
		
		listsRef.on('child_removed', function(data) {
			moveTasksToDefaultList(data.val().name);
		});

		var moveTasksToDefaultList = function(origList){
			var list = $firebaseArray($rootScope.userTasksRef.orderByChild("inList").equalTo(origList));
			
			list.$loaded()
			.then(function(data) {
				console.log("Moving Tasks to Default List from: "+origList);
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
			$rootScope.userLists.$add({
				name: $scope.listName,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$scope.successmsg = $scope.listName+" list was created";
				$scope.listName = "";
			});
		};
		
		$scope.removeList = function(listId){
			var refDel = listsRef.child(listId);
			var record = $firebaseObject(refDel);
		    
		    record.$loaded().then(function() {
				record.$remove().then(function(ref) {
					$rootScope.activeTasksList = "All"
			    	$scope.successmsg = record.name + " list was deleted";
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