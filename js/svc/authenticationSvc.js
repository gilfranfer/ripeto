ripetoApp.factory( 'AuthenticationSvc', ['$rootScope', '$location','$firebaseObject','$firebaseAuth', 
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var usersFolder = 'users';
		var loginSuccessPage = '/success';

		auth.$onAuthStateChanged( function(authUser){
			if(authUser){
				var userRef = ref.child(usersFolder).child(authUser.uid);
				var userObj = $firebaseObject(userRef);
				$rootScope.currentUser = userObj;
    			
    			//console.log(userObj);

			}else{
				$rootScope.currentUser = '';				
			}
		} );

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
			//logout: function(){},
			register: function(user){
				auth.$createUserWithEmailAndPassword(
						user.email, user.pwd
				).then(
				/* Use firebase uid from the record created to
				 * save more user details in our users folder */ 
				function(regUser){
					var regRef = ref.child(usersFolder).child(regUser.uid).set({
						firstname: user.firstname,
						lastname: user.lastname,
						email: user.email,
						uderid: regUser.uid,
						date: firebase.database.ServerValue.TIMESTAMP						
					});

					$rootScope.message = user.firstname + 
						" you are now part of the awesomeness";
					//Clean Form
				} 
				).catch( function(error){
					$rootScope.message = error.message;
				});
			}
		};//return
	}

]);