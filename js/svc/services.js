ripetoApp.factory( 'AuthenticationSvc', 
	['$rootScope','$location','$firebaseObject','$firebaseAuth', 
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var usersFolder = ref.child('users');
		var loginSuccessPage = '/tasks';

		auth.$onAuthStateChanged( function(authUser){
    		if(authUser){
				var userRef = usersFolder.child(authUser.uid);
				var userObj = $firebaseObject(userRef);
				$rootScope.currentUser = userObj;
			}else{
				$rootScope.currentUser = '';				
			}
		} );
		
		var updateLastLogin = function(user){
				usersFolder.child(user.uid).update(
					{lastlogin: firebase.database.ServerValue.TIMESTAMP});
			};

		return{
			login: function(user){
				auth.$signInWithEmailAndPassword( 
					user.email,user.pwd
				).then( function (user){
					updateLastLogin(user);
					$location.path( loginSuccessPage );
				}).catch( function(error){
					$rootScope.errormessage = error.message;
				});
			},
			logout: function(){
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			loadUserProfileData: function(uid){
				return $firebaseObject(usersFolder.child(uid));
			},
			register: function(user){
				auth.$createUserWithEmailAndPassword(user.email, user.pwd
				).then(
					function(regUser){
						usersFolder.child(regUser.uid).set({
							firstname: user.firstname,
							lastname: user.lastname,
							email: user.email,
							userid: regUser.uid,
							date: firebase.database.ServerValue.TIMESTAMP,
							lastlogin: firebase.database.ServerValue.TIMESTAMP						
						});
						$location.path( loginSuccessPage );
					} 
				).catch( function(error){
					$rootScope.errormessage = error.message;
				});
			}
		};//return
	}
]);

ripetoApp.factory( 'TasksSvc', 
	['$rootScope','$location','$firebaseObject','$firebaseAuth', 
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth){
		
		return{
			
		};
	}
]);