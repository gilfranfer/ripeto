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

		$rootScope.tasksOrder = "date";
		$rootScope.reverseOrder = false;
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

				//openTasksArray.$loaded().then( function(data){} );
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
		let listsRef = firebase.database().ref().child('users')
							.child(whichUser).child('lists');
		let tasksRef = firebase.database().ref().child('users')
							.child(whichUser).child('tasks');

		let allUserLists = $firebaseArray( listsRef );
		$rootScope.alluserLists = allUserLists;

		listsRef.on('child_removed', function(data) {
			moveTasksToDefaultList(data.val().name);
		});

		var moveTasksToDefaultList = function(origList){
			let tasksToUpdate = $firebaseArray(tasksRef.orderByChild("inList").equalTo(origList));

			tasksToUpdate.$loaded().then(function(data) {
				console.log("Moving Tasks to Default List from: "+origList);
				tasksToUpdate.forEach(function(element, index) {
					element.inList = "Default";
					element.secret = false;
				    tasksToUpdate.$save(index);
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
			});
		};

		$scope.createNewList = function(){
			allUserLists.$add({
				name: $scope.listName, secret: false,
				date: firebase.database.ServerValue.TIMESTAMP
			}).then( function(){
				$scope.successmsg = $scope.listName+" list was created";
				$scope.listName = "";
			});
		};

		$scope.removeList = function(listId){
			//TODO: I think there is another way to do this deleation
			let refDel = listsRef.child(listId);
			let record = $firebaseObject(refDel);
		    refreshActiveTaskList(record.name);

		    record.$loaded().then(function() {
		    	let msg = record.name + " list was deleted"
				record.$remove().then(function(ref) {
					refreshActiveTaskList(record.name);
			    	$scope.successmsg = msg;
			    }, function(error) {
					$scope.errormsg = error;
				});
		    });
		};

		/*When the active List is the one we are deleating or making secret,
		  then we need to set the active list to "Default", to avoid displaying it.*/
		var refreshActiveTaskList = function(listname){
			if($rootScope.activeTasksList == listname){
				$rootScope.activeTasksList = "Default"
			}
		};
		/* When a list is marked as Secret, two things happen:
			1. The list object is marked in DB with secret:true
			2. All the Tasks inList will be marked with secret:true
		*/
		$scope.makeSecretList = function(list, makeSecret){

			listsRef.child(list.$id).update({secret:makeSecret});
			let tasksToUpdate = $firebaseArray(tasksRef.orderByChild("inList").equalTo(list.name));
			refreshActiveTaskList(list.name);

			tasksToUpdate.$loaded().then(function(data) {
				tasksToUpdate.forEach(function(element, index) {
					element.secret = makeSecret;
				    tasksToUpdate.$save(index);
				});
			})
			.catch(function(error) {
				console.log("Error:", error);
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

ripetoApp.controller('TimerCntrl', ['$scope', '$rootScope',
	function($scope, $rootScope){
		/*
		A TimeSet will represent a specific period of time that the user wants to monitor.
		for example a working day, or an entire week. Each TimeSet will contain a
		group of timers, and a list of events.
		A Timer will represent a List or Category, and will contain the total time
		for all the events in the same List. For example a Timer for Work related Tasks,
		another for Meetings or Personal activities.
		An Event will represent an specific period of time.

		TimeSet{
			name: String, - "ex Monday at Office"
			description: String, - "ex Set to track time spent at office this Monday"
			start: datetime ,
			end: endtime,
			status: Running / Closed / Open, - "To identify if this set is active or not"
			totalTime: timeinMilis,
			timers: {[
				{name: "List or Category name", start: datetime, totalTime: timeinMilis },
			]},
			events:  {[
				{name: "Task / activity Name",
				belongsTo: "Timer name",
				start: datetime,
				time: timeinMilis }
			]},
		}
		*/

		let GLOBAL_TIMER = document.querySelector("#global-timer");
		let RUNNING_ACTIVITY = document.querySelector("#running-activity");
		let TIMER_HISTORY = document.querySelector("#timers-history");
		let TIMER_TOTALS = document.querySelector("#timers-totals");
		let ONE_SECOND = 1000;



		//Timer Related
		var refreshInterval;
		var currentTimer;
		var timersTotalsMap;
		var timerHistory;

		var init = function(){
			TIMER_HISTORY.innerHTML = "";
			TIMER_TOTALS.innerHTML = "";
			timersTotalsMap = new Map();
			timerHistory = new Array();
		};

		if( !timersTotalsMap ){console.log(timersTotalsMap);
			console.log("Entering to Timer controller");
			timersTotalsMap = new Map();
			timerHistory = new Array();
		}


		var getCurrentTimer = function(){
			return currentTimer;
		};

		/* This function will be executed to start counting time for a list or task.
		First we need to end the running timer (if any) using the clockOut function.
		Then we can update the RUNNING_ACTIVITY element with a new description.
		Start running the new timer
		*/
		$scope.clockIn = function(activity){
			clockOut();
			RUNNING_ACTIVITY.innerHTML = "Clocking "+activity;
			startRunning( createNewTimerObject(activity) );
			console.log("Clocking In "+ getCurrentTimer().name);
		};

		/* Function to stop the running interval. If the currentTimer exists
		we need to save the timer details and reset the text for GLOBAL_TIMER
		and the RUNNING_ACTIVITY description */
		var clockOut = function(){
			stopRunning();
			if( getCurrentTimer() ){
			  //TODO:save active timer data
			  console.log("Clocking Out "+ getCurrentTimer().name);
			  saveTimerOnHistoryAndDisplay( getCurrentTimer() );
			  GLOBAL_TIMER.innerHTML = "00:00:00";
			  RUNNING_ACTIVITY.innerHTML = "Not Running";
			  currentTimer = null;
			}
		};

		//Clear the refresh interval if any
		stopRunning = function(){
			if ( refreshInterval ){
				clearInterval(refreshInterval);
			}
			refreshInterval = undefined;
		};

		/* Set currentTimer to the new timer obeject, and prepare a refresh interval
		that will executed the updateActiveTimer functionevery second */
		var startRunning = function(timerObj) {
		 currentTimer = timerObj;
		 refreshInterval = setInterval( updateActiveTimer, ONE_SECOND);
	 };

		/*This is the method that get called by interval on the specified time (1 sec).
		It will updated the elapsed time on the current activity Timer, and refresh
		the user viee. */
		var updateActiveTimer = function() {
			getCurrentTimer().elapsed = new Date() -  getCurrentTimer().startTime;
			let formattedTime = formatElapsedTime(getCurrentTimer().elapsed);
			//console.log("Update Timer: "+ formattedTime);
			//console.log(getCurrentTimer());
			updateTimerView(GLOBAL_TIMER,formattedTime);
		};

		var updateTimerView = function(timerView, timeString){
			timerView.innerHTML = timeString;
		};

		/* A timer object consists off:

		*/
		var createNewTimerObject = function(activity){
			if( !timersTotalsMap.has(activity) ){
			  timersTotalsMap.set(activity,{name:activity,totalTime:0});
			}
			let timerObj = {startTime: new Date(), name:activity, elapsed:0};
			return timerObj;
		};

		/*Validate if some time was actually captured by the timer */
		var saveTimerOnHistoryAndDisplay = function(timer){
			if(timer.elapsed){
			  //update Total for Activity
			  let tmap = timersTotalsMap.get(timer.name);
			  tmap.totalTime += timer.elapsed;
			  console.log(tmap);

				//let li = document.querySelector("#timer-total-"+tmap.name);
			  //li.innerHTML = tmap.name +": "+ formatElapsedTime(tmap.totalTime)

				//update timer history
			  timerHistory.push(timer);
				console.log(timerHistory);
			  li = document.createElement("li");
			  li.append(timer.name +" - "+ formatElapsedTime(timer.elapsed) ) ;
			  TIMER_HISTORY.append(li);
			}
		};

		/* Receives miliseconds and prepares a String that has the visual
		representation of the elapsed time in HH:MM:SS format */
		var formatElapsedTime = function(timeinMilis){
			let hours =0, minutes=0, seconds=0;

			hours = Math.floor( (timeinMilis/1000)/60/60);
			minutes = Math.floor( (timeinMilis/1000)/60) - (hours * 60);
			seconds = Math.floor( (timeinMilis/1000)  - ( ((hours * 60) + minutes) * 60) );

			formattedTime =
			    leadingZero(hours) + ":" +
			    leadingZero(minutes) + ":" +
			    leadingZero(seconds);
			return formattedTime;
		};

		/* Get a number and add the 0 to the right if less than 10*/
		var leadingZero = function(value){
			return (value<10)?"0"+value:value;
		};

		var resetAll = function() {
		  clockOut();
		  init();
		  timersTotalsMap = new Map();
			timerHistory = new Array();
		};

	}
]);
