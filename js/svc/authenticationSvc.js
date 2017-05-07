ripetoApp.factory( 'AuthenticationSvc', ['$rootScope', '$firebaseAuth',
	function($rootScope, $firebaseAuth){
		var ref = firebase.database().ref();
		var auth = $firebaseAuth();

		return{
			login: function(user){
				$rootScope.message = "Welcome " +user.email;
			},
			register:  function(user){
				auth.$createUserWithEmailAndPassword(
						user.email, user.pwd
				).then( function(regUser){
					$rootScope.message = user.firstname + 
						" you are now part of the awesomeness";
				} ).catch( function(error){
					$rootScope.message = error.message;
				});
			}
		};//return
	}
]);