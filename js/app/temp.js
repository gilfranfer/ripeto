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

/* A timer object consists off:*/
var createNewTimerObject = function(activity){
	if( !timersTotalsMap.has(activity) ){
	  timersTotalsMap.set(activity,{name:activity,totalTime:0});
	}
	let timerObj = {startTime: new Date(), name:activity, elapsed:0};
	return timerObj;
};

var updateTimerView = function(timerView, timeString){
	timerView.innerHTML = timeString;
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

		var resetAll = function() {
		  clockOut();
		  init();
		  timersTotalsMap = new Map();
			timerHistory = new Array();
		};