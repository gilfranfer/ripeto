ripetoApp.factory( 'AuthenticationSvc', 
	['$rootScope','$location','$firebaseObject','$firebaseAuth', 'ConfigurationSvc',
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth,ConfigurationSvc){
		
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();
		var usersFolder = ref.child('users');
		var loginSuccessPage = '/tasks';

		auth.$onAuthStateChanged( function(authUser){
			console.log("AuthSvc - On Auth State");
    		if(authUser){
				$rootScope.currentUser = getUserData(authUser.uid);
				//ConfigurationSvc.upgradeUserConfig( getUserData(authUser.uid) );
			}else{
				$rootScope.currentUser = null;				
			}
		} );
		
		var updateLastLogin = function(user){
				usersFolder.child(user.uid).update(
					{lastlogin: firebase.database.ServerValue.TIMESTAMP});
			};
			
		var getUserData = function(uid){
			var userRef = usersFolder.child(uid);
			return $firebaseObject(userRef);
		};
		
		return{
			loginUser: function(user){
				auth.$signInWithEmailAndPassword( 
					user.email,user.pwd
				).then( function (user){
					updateLastLogin(user);
					$location.path( loginSuccessPage );
					console.log( "Sucessful Login!");
				}).catch( function(error){
					$rootScope.appMessages.loginErrorMsg = error.message;
					console.error( error.message );
				});
			},
			logout: function(){
				//Clean rootScope
				for (var prop in $rootScope) {
				    if (prop.substring(0,1) !== '$') {
						console.log("Rootscope Prop: "+prop);
				        delete $rootScope[prop];
				    }
				}
				return auth.$signOut();
			},
			isUserLoggedIn: function(){
				return auth.$requireSignIn();
			},
			loadUserProfileData: function(uid){
				return $firebaseObject(usersFolder.child(uid));
			},
			register: function(user, currentAppVersion){
				auth.$createUserWithEmailAndPassword(user.email, user.pwd
				).then(
					function(regUser){
						usersFolder.child(regUser.uid).set({
							firstname: user.firstname,
							lastname: user.lastname,
							email: user.email,
							userid: regUser.uid,
							date: firebase.database.ServerValue.TIMESTAMP,
							lastlogin: firebase.database.ServerValue.TIMESTAMP,
							//Consider to move this to a ConfService
							config: { appVersion: currentAppVersion },
							lists: { "default": {name:"Default", date:firebase.database.ServerValue.TIMESTAMP}}
						});
						$location.path( loginSuccessPage );
					}
				).catch( function(error){
					$rootScope.appMessages.registerErrorMsg = error.message;
				});
			}
		};//return
	}
]);

ripetoApp.factory( 'ConfigurationSvc', 
	['$rootScope','$firebaseObject','$firebaseAuth', 
	
	function($rootScope,$firebaseObject,$firebaseAuth){
		var currentAppVersion = "0.1.1"
		
		var putTasksOnDefaultList = function(userData){
			if (userData.tasks === undefined ){
				console.log("No Tasks to Update");
			}else{
				var count = 0;
				Object.keys(userData.tasks).map(
					function (key) { 
						if( userData.tasks[key].inList === undefined){
							userData.tasks[key].inList = "Default";
						}
						return userData.tasks[key];	
					});
				console.log(count + " Tasks updated");
			}
		};
		
		return{
			upgradeUserConfig: function( user ){
				
				user.$loaded().then( function(data) {
				    if ( user.config === undefined 
				    		|| user.config.appVersion !== currentAppVersion ){
						console.log("User needs some updates");
						//Update App Version on Conf Folder
						user.config = {appVersion:currentAppVersion};
						//Create Default Task List (Consider to check if lists folder is empty )
						user.lists = { "default": {name:"Default", date:firebase.database.ServerValue.TIMESTAMP} };
						putTasksOnDefaultList(user);
						user.$save();
					}else{
						console.log("User is up to date "+ currentAppVersion );	
					}
				}).catch(function(error) {
					console.error("Error:", error);
				});
				
				return "";
			},
			getAppVersion: function(){
				return currentAppVersion;
			}
		};
	}
]);


ripetoApp.factory( 'TasksSvc', 
	['$rootScope','$location','$firebaseObject','$firebaseAuth', 
	
	function($rootScope, $location,$firebaseObject,$firebaseAuth){
		
		return{
			
		};
	}
]);