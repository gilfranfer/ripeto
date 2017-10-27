ripetoApp.controller('TimerCntrl', ['$scope', '$rootScope', 'TimerSvc',
	function($scope, $rootScope,TimerSvc){
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
		TimerSvc.init();

		
	}
]);

ripetoApp.factory( 'TimerSvc', ['$rootScope','$firebaseObject','$firebaseAuth', 
	function($rootScope,$firebaseObject,$firebaseAuth){
		let ONE_SECOND = 1000;

		//This Factory retunrs a set of functions to work with Timer features
		//chronos attribute from rootScope will be the container for all the Timer values

		var createEmptyTimeSet = function(){
			console.log("Chronos: This is a new TimeSet!");
			return {  };
		};

		var getActiveTimesetForUser = function(){ return null};

		return {
			init: function(){
				if( !$rootScope.chronos ){
					let tset = getActiveTimesetForUser();
					if ( tset ){
						
					}else{
						tset = createEmptyTimeSet();
					}
					$rootScope.chronos = {myname:"Chronos!", displayTimer:"00:00:00", timerset: ts};
				}else{
					console.log("Chronos: Still me, " + $rootScope.chronos.myname);
				}
			},
			/* This function will be executed to start counting time for a list or task.
			First we need to end the running timer (if any) using the clockOut function.
			Then we can update the RUNNING_ACTIVITY element with a new description.
			Start running the new timer
			*/
			clockIn: function(){

			},


			
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





		};
	} 
]);

