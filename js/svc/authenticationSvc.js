ripetoApp.factory( 'AuthenticationSvc', ['$rootScope', '$location','$firebaseObject','$firebaseAuth', 
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var usersFolder = 'users';
		var loginSuccessPage = '/home';

		auth.$onAuthStateChanged( function(authUser){
    		console.log("on AuthStateChanged ");
			if(authUser){
				var userRef = ref.child(usersFolder).child(authUser.uid);
				var userObj = $firebaseObject(userRef);
				$rootScope.currentUser = userObj;
    		
			}else{
				console.log("on AuthStateChanged - Not Authorized ");
				$rootScope.currentUser = '';				
			}
		} );

		return{
			login: function(user){
				auth.$signInWithEmailAndPassword(
					user.email,user.pwd
				).then( function (user){
					//update last login value
					ref.child(usersFolder).child(user.uid).update({
						lastlogin: firebase.database.ServerValue.TIMESTAMP						
					});
					//redirect
					$location.path( loginSuccessPage );
				}).catch( function(error){
					$rootScope.errormessage = error.message;
				});

			},
			logout: function(){
				console.log("logout");
				return auth.$signOut();
			},
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
						date: firebase.database.ServerValue.TIMESTAMP,
						lastlogin: firebase.database.ServerValue.TIMESTAMP						
					});
					
					//$location.path( loginSuccessPage );
				} 
				).catch( function(error){
					$rootScope.errormessage = error.message;
				});
			}
		};//return
	}

]);