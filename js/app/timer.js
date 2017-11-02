/*
Choronos wll be the main container in the DB for all the timers.
- A timer will represent a period of time that the user wants to monitor, for example a working day, or an entire week. 
- Each timer will contain a list of timesets, that represent an specific period of time. The timer will be created
each time the user clicks the "Clock in" button, and will end with the "Clock out". ( or clocking in another list)
- List totals will represent a List or Category, and will contain the total time for all the timesets that belongs to 
the same List. For example a Timer for Work related Tasks, another for Meetings or Personal activities.

Chronos{
	totalformattedtime: '00:00:00', //To update the view
	timers:[ 
		TimerID: {
			name: "ex Monday at Office",
			description: "ex Timer to track time spent at office this Monday",
			start: datetime, 
			end: endtime,
			status: open | closed , //"To identify if this set is active or not"
			isRunnig: true | false
			activetimeset: {name: "Task", belongsToList: "List name", start: datetime, elapsed: timeinMilis},
			totalTime: timeinMilis,
			timesets: [
				{name: "Task | activity Name",
				belongsToList: "List name",
				start: datetime, end: datetime
				time: timeinMilis }
			],
			listtotals: [
				{listname: "List or Category name", start: datetime, totalTime: timeinMilis },
			]
		}
	]
}
*/
ripetoApp.controller('TimerCntrl', ['$scope', '$rootScope', 'TimerSvc','$firebaseAuth', '$firebaseArray','$firebaseObject', 
	function($scope, $rootScope,TimerSvc, $firebaseAuth, $firebaseArray, $firebaseObject){
		
		//Firebase stuff
		var auth = $firebaseAuth();
		var usersFolder = firebase.database().ref().child('users');

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser){
				console.log("TimerCntrl - Auth change");

				//Load only lists tha are not "Secret"
				let activeTimerRef = usersFolder.child(authUser.uid).child('chronos').child('activeTimer');
				let activeTimer = $firebaseObject( activeTimerRef );

				activeTimer.$loaded()
				  .then(function(activeTimer) {
				  	// console.log("Active Timer:");
				  	// console.log(data);
					TimerSvc.init(data);
				  })
				  .catch(function(error) {
				    console.log("DBTIMER error:"+ error);
				  });

				//userListsArray.$loaded().then( function(data){ console.log(data); } );
				//openTasksArray.$watch( function(data){} );
			}
		});


		/* This function will be executed to start counting time for a list or task.
		First we need to check in firebase if the user has a Time set running or not.
		Then we will stop the runnig timer (if any), then we can create a new 
		timer and star running it */
		$scope.clockIn = function(){
			console.log("TimerCntrl - Clocking In!!");
			document.querySelector("#global-timer").innerHTML = "00:00:00";
			$rootScope.chronos.timer = TimerSvc.getTimer($rootScope.chronos);
			
			//Clockout Runnig Timer (if any)
			if( $rootScope.chronos.timer.isRunning ){
				$scope.clockOut();
			}
			//
			if( !$rootScope.chronos.timer.isRunning){
				TimerSvc.startRunning($rootScope.chronos, $rootScope.activeTasksList);
				//console.log("TimerCntrl - running the following timer: ");
				//console.log($rootScope.chronos.timer);
			}
		};

		/* */
		$scope.clockOut = function(){
			if ( $rootScope.chronos.timer && $rootScope.chronos.timer.status == "running"){
				console.log("TimerCntrl: Clocking Out!!");
				
				let timeset = $rootScope.chronos.timer.activetimeset;
				timeset.end = new Date();
				TimerSvc.stopRunning($rootScope.chronos);
				// console.log("TimerCntrl: Chronos after Stop:");
				// console.log($rootScope.chronos);
				TimerSvc.updateTimesetHistory(timeset);
				TimerSvc.updateListTotals(timeset);
				// console.log("TimerCntrl: Chronos after updates:");
				console.log($rootScope.chronos.timer);
			}else{
				console.log("TimerCntrl: Nothing to stop!!!");				
			}
		};

		$scope.newTimer = function(){};

	}
]);

//This Factory retunrs a set of functions to work with Timer features
ripetoApp.factory( 'TimerSvc', ['$rootScope','$firebaseObject', 
	function($rootScope,$firebaseObject){
		
		let ONE_SECOND = 1000;
		var usersFolder = firebase.database().ref().child('users');

		/* chronos object from rootScope will be the container for all the Timer values*/
		var invokeChronos = function(){
			console.log("Chronos Invokation");
			return {
				formattedTotalTime:"00:00:00", 
				refreshInterval: undefined
			};
		};

		/*This is the method that get called by INTERVAL on the specified time (1 sec).
		It will updated the elapsed time on the current activity Timer, and refresh view*/
		var updateActiveTimeset = function() {
			let current = $rootScope.chronos.timer.activetimeset;
			current.elapsed = new Date() - current.startTime;
			$rootScope.chronos.formattedTotalTime = formatElapsedTime(current.elapsed);
			$rootScope.chronos.timer.activetimeset = current;
			//Updating view. For some Reason Angular biding didnt work.
			document.querySelector("#global-timer").innerHTML = $rootScope.chronos.formattedTotalTime;
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

		var createTimeset = function(listname,startdate){
			return {name: listname, belongsToList: listname, startTime: new Date(), elapsed:0};
		};

		var createBaseTimer = function(){
			let date = new Date();
			return { 
				name: "Basic Timer",
				description: date.toString(),	
				status: "open",
				isRunning: false,
				totalTime: 0,
				start: date.getTime(),
				end: null,
				listtotals: new Map(), //We might not need this one
				timesets: new Array(), //We might not need this one
				activetimeset: null
			};
		};

		var persistTimer = function(timer){
			var timersRef = usersFolder.child($rootScope.currentUser.$id).child('timers');
			var newTimerRef = timersRef.push();
			newTimerRef.set(timer);

		};

		var persistTimeset = function(timer){
			//Persist to DB
			var timesetRef = usersFolder.child($rootScope.currentUser.$id).child('timers');
			timesetRef.push().set(timer);
		};

		return {
			/*Init will be called by Task Controller onAuthStateChanged. 
			dbTimer is a possible Timer obejct from firebase*/
			init: function(dbTimer){
				console.log("Chronos: Init");
				if( !$rootScope.chronos ){
					let chronos = invokeChronos();
					$rootScope.chronos = chronos;
				}else{
					console.log("Chronos: Was already alive");
				}

				if ( dbTimer.status == 'open' ){
					console.log("Chronos: Found a Timer in the DB");
					$rootScope.chronos.timer = dbTimer;
					//Add watch
				}else{
					console.log("Chronos: Nothing from DB");
				}
			},
			getTimer: function(chronos){
				//Do we have a Timer? First time we will not (unless one was found in DB)
				if ( chronos.timer ){
					console.log("TimerSvc: Timer already exist?");
				}else{
					console.log("TimerSvc: Creating Base Timer");
					chronos.timer = createBaseTimer();
					persistTimer(chronos.timer);
				}
				return chronos.timer;
			},
			/* At this point a Timer already exist */
			startRunning: function(chronos,listname){
				if(!chronos.timer){	//This should not happen
					console.error("TimerSvc - There is no Timer!!!");
				}else{ //Normal flow
					chronos.timer.isRunning =  true;
					chronos.timer.activetimeset  = createTimeset(listname);
					chronos.refreshInterval = setInterval( updateActiveTimeset, ONE_SECOND);
				}
			},
			stopRunning: function(chronos){
				clearInterval(chronos.refreshInterval);
				chronos.refreshInterval = undefined; //Maybe this is not required
				chronos.timer.isRunning =  false;
				chronos.timer.activetimeset = undefined;
			},
			updateTimesetHistory: function(timeset){
				if(timeset.elapsed){
				  $rootScope.chronos.timer.timesets.push(timeset);
				}
			},
			updateListTotals: function(timeset){
				if(timeset.elapsed){
					let totals = $rootScope.chronos.timer.listtotals;
					if( !totals.has(timeset.belongsToList) ){
		 				totals.set(timeset.belongsToList, 
		 					{ listname: timeset.belongsToList, totalTime: 0, start:timeset.start}
		 				);
					}
					//update Total for Activity
					let tmap = totals.get(timeset.belongsToList);
					tmap.totalTime += timeset.elapsed;
				}
				
			}
		};
	} 
]);

