ripetoApp.controller('ListsCntrl',
['$scope', '$rootScope', '$routeParams','$firebaseArray', '$firebaseObject',
	function($scope,$rootScope,$routeParams,$firebaseArray,$firebaseObject){

		$rootScope.appMessages = {};

		$scope.regex = "[a-zA-Z0-9\\s]{4,25}";
		let whichUser = $routeParams.uid;
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

	    record.$loaded().then(function() {
				refreshActiveTaskList(record.name);
	    	let msg = record.name + " list was deleted";

				record.$remove().then(function(ref) {
					$scope.successmsg = msg;
			  }, function(error) {
					$scope.errormsg = error;
				});
	    });
		};

		/*When the active List is the one we are deleating or making secret,
		  then we need to set the active list to "Default", to avoid displaying it.*/
		var refreshActiveTaskList = function(listname){
			console.log("Set activeTasksList back to Default from: "+listname);
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
