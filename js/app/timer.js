/*
A TimeSet will represent a specific period of time that the user wants to monitor.
for example a working day, or an entire week. Each TimeSet will contain a
group of timers, and a list of timers.
A Timer will represent a List or Category, and will contain the total time
for all the timers in the same List. For example a Timer for Work related Tasks,
another for Meetings or Personal activities.
An Event will represent an specific period of time.

TimeSet{
	name: String, - "ex Monday at Office"
	description: String, - "ex Set to track time spent at office this Monday"
	start: datetime ,
	end: endtime,
	status: Waiting / Running / Closed , - "To identify if this set is active or not"
	whichtimer: which timer is running,
	totalTime: timeinMilis,
	timers: {[
		{name: "List or Category name", start: datetime, totalTime: timeinMilis },
	]},
	timers:  {[
		{name: "Task / activity Name",
		belongsTo: "Timer name",
		start: datetime,
		time: timeinMilis }
	]},
}
*/
ripetoApp.controller('TimerCntrl', ['$scope', '$rootScope', 'TimerSvc',
	function($scope, $rootScope,TimerSvc){
		
		TimerSvc.init();

		/* This function will be executed to start counting time for a list or task.
		First we need to chedk in firebase if the user has a Time set running or not.
		Then we will stop the runnig timer (if any), then we can create a new 
		timer and star running it */
		$scope.clockIn = function(){
			let tset = $rootScope.chronos.timeset ;
			//Do we have a TimeSet for this Timer? First time we will not (unless one was found in DB)
			if ( tset ){
				console.log("TimerCntrl: Timeset already exist");				
			}else{
				console.log("TimerCntrl: We need a new Timeset");
				tset = TimerSvc.createBaseTimeSet();
				$rootScope.chronos.timeset = tset;
				//Persist to DB
			}

			//Clockout Runnig Timer (if any)
			if( tset.status === "running" ){
				console.log("TimerCntrl: Stop the running Timer for this TimeSet");
				TimerSvc.clockOut();
			}
			if( tset.status === "waiting" ){
				console.log("TimerCntrl: Starting Timeset");
				TimerSvc.startRunning($rootScope.chronos, $rootScope.activeTasksList);
			}

		};

		
	}
]);

//This Factory retunrs a set of functions to work with Timer features
ripetoApp.factory( 'TimerSvc', ['$rootScope','$firebaseObject','$firebaseAuth', 
	function($rootScope,$firebaseObject,$firebaseAuth){
		
		let ONE_SECOND = 1000;
		
		/* chronos object from rootScope will be the container for all the Timer values*/
		var invokeChronos = function(){
			console.log("Chronos Invokation");
			return {
				formattedTotalTime:"00:00:00", 
				refreshInterval: undefined
				//,timeset: createBaseTimeSet()
			};
		};

		/* check in firebase if the user has an a timeset with status different than closed */
		var getActiveTimesetFromDb = function(){ return null};

		/*This is the method that get called by INTERVAL on the specified time (1 sec).
		It will updated the elapsed time on the current activity Timer, and refresh view*/
		var updateActiveTimer = function() {
			console.log("A second passed");
			//getCurrentTimer().elapsed = new Date() -  getCurrentTimer().startTime;
			//let formattedTime = formatElapsedTime(getCurrentTimer().elapsed);
			//console.log("Update Timer: "+ formattedTime);
			//console.log(getCurrentTimer());
			//updateTimerView(GLOBAL_TIMER,formattedTime);
		};

		return {
			init: function(){
				console.log("Chronos: Init");
				if( !$rootScope.chronos ){
					let chronos = invokeChronos();
					let dbTimeset = getActiveTimesetFromDb();
					if ( dbTimeset ){
						console.log("Chronos: FOund a TimeSet in the DB");
						chronos.timeset = dbTimeset;
						//Add watch
					}
					$rootScope.chronos = chronos;
				}else{
					console.log("Chronos: Was already alive");
				}
			},
			createBaseTimeSet: function(){
				let date = new Date();
				return { 
					name: "My Set",
					description: date.toString(),
					start: date,
					end: undefined,
					status: "waiting",
					totalTime: 0,
					timers: new Map(),
					timers: new Array(),
				};
			},

			/* At this point a Timest already exist
			Set currentTimer to the new timer obeject, and prepare a refresh interval
			that will executed the updateActiveTimer functionevery second */
			startRunning: function(chronos,listname){
				if(!chronos.timeset){
					console.error("Chronos: There is no Timeset!!!");
				}else{
					let startdate = new Date();
					chronos.timeset.status =  "running";
					chronos.timeset.activetimer  = {startTime:startdate, name:listname, elapsed:0};

					if( !chronos.timeset.timers.has(activetimer.name) ){
				 		chronos.timeset.timers.set(activetimer.name,{name:listname,totalTime:0});
					}
					chronos.refreshInterval = setInterval( updateActiveTimer, ONE_SECOND);
					console.log(chronos);
				}
			},
			clockOut: function(){
				console.log("Clocking Out " + $rootScope.activeTasksList);
			}
		};
	} 
]);

