ripetoApp.factory( 'AuthenticationSvc', ['$rootScope', '$firebaseAuth',
	
	function($rootScope, $firebaseAuth){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var users_folder = 'users';

		return{
			login: function(user){
				$rootScope.message = "Welcome " + user.email;
			},
			register: function(user){
				auth.$createUserWithEmailAndPassword(
						user.email, user.pwd
				).then(
				/* Use firebase uid from the record created to
				 * save more user details in our users folder */ 
				function(regUser){
					console.log(user);
					console.log(firebase.database.ServerValue.TIMESTAMP);
					var regRef = ref.child(users_folder).child(regUser.uid).set({
						firstname: user.firstname,
						lastname: user.lastname,
						email: user.email,
						uderid: regUser.uid,
						date: firebase.database.ServerValue.TIMESTAMP						
					});

					$rootScope.message = user.firstname + 
						" you are now part of the awesomeness";
				} 
				).catch( function(error){
					$rootScope.message = error.message;
				});
			}
		};//return
	}

]);