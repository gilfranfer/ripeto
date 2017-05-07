ripetoApp.factory( 'AuthenticationSvc', ['$rootScope', '$location','$firebaseAuth',
	
	function($rootScope, $location,$firebaseAuth){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var usersFolder = 'users';
		var loginSuccessPage = '/success';

		return{
			login: function(user){
				auth.$signInWithEmailAndPassword(
					user.email,user.pwd
				).then( function (user){
					$location.path( loginSuccessPage );
				}).catch( function(error){
					$rootScope.message = error.message;
				});

				//$rootScope.message = "Welcome " + user.email;
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
					var regRef = ref.child(usersFolder).child(regUser.uid).set({
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