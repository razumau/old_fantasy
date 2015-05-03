var $table = $('#table-javascript');
var allTeams = [];
var MAX_TEAMS_PER_USER = 5;
var rootRef = new Firebase("https://popping-inferno-4625.firebaseio.com");
rootRef.onAuth(authCallback);
var userRef = {};

var UserBox = React.createClass({
    mixins: [ReactFireMixin],

    getInitialState: function() {
        return {
            user: {}
        };
    },

    componentWillMount: function() {
        this.bindAsObject(userRef, "user");
    },

    render: function() {
	console.log('user in render');
       console.log(this.state.user);
        var teams = [];
        if (this.state.user.teams) {
            for (var i = 0; i < this.state.user.teams.length; i++) {
                teams.push(<li>
          	  			{this.state.user.teams[i].name} — 
          	  			{this.state.user.teams[i].price}</li>)
            }
        }

        return ( <div className = "userBox">
            <h3> {this.state.user.name } </h3>  
            <div> Осталось {this.state.user.remains} очков </div>
            <div> Команды: <ul> {teams} </ul> </div></div>
        );
    }
});




var actions = {
    facebookLogin: function() {

	rootRef.authWithOAuthPopup("facebook", function(error, authData) {}, {
	    remember: "none",
	    scope: "public_profile"
	});
    },

    googleLogin: function() {
    	rootRef.authWithOAuthPopup("google", function(error, authData) {});
    },

    twitterLogin: function() {
    	console.log('twitter login');
    	rootRef.authWithOAuthPopup("twitter", function(error, authData) {});
    }
};

function authCallback(authData) {
	console.log(authData);
	if (authData) {
		userRef = rootRef.child("users").child(authData.uid);
		userRef.once('value', function (snapshot) {
			var user = snapshot.val();
			//console.log(isNewUser);
			/*console.log(user);
			console.log(user.name);
			var isNewUser = user.name === null;*/
			userRef = rootRef.child("users").child(authData.uid);
			if (!user) {
				console.log('new user');
				console.log(rootRef);

				userRef.set({
   					provider: authData.provider,
		       		name: authData[authData.provider].displayName,
		        		remains: 100,
		        		spent: 0
		    		});
			}

		    	showTable();
			hideLoginButtons();
			React.render(<UserBox />, document.getElementById('content'));
		})
	
	} else {

	}
}

$('body').on('click', '[data-action]', function() {
    var action = $(this).data('action');
    if (action in actions) actions[action]();
});

function hideLoginButtons () {
	$('#loginButtons').css("visibility", "hidden")
}

function showTable() {
    $table.bootstrapTable({
        method: 'get',
        url: 'https://popping-inferno-4625.firebaseio.com/teams.json',
        cache: false,
        height: 600,
        clickToSelect: true,
        columns: [{
            field: 'state',
            checkbox: true
        }, {
            field: 'price',
            title: 'Цена',
            align: 'center',
            width: 40,
            valign: 'middle',
            sortable: true
        }, {
            field: 'name',
            title: 'Команда',
            align: 'left',
            valign: 'middle',
            sortable: true
        }, ]
    }).on("check.bs.table", function(e, name, args) {
        addTeam(name)
    }).on("uncheck.bs.table", function(e, name, args) {
        removeTeam(name)
    }).on("load-success.bs.table", function(e, data) {
        highlightSelectedTeamsInTable();
    });
}


function highlightSelectedTeamsInTable() {
	console.log(userRef.key());
	userRef.once("value", function(snapshot) {
	    var teams = snapshot.val().teams;
	    if (!teams)
	        return;
	    teams.forEach(function(element) {
	        $table.bootstrapTable('updateRow', {
	            index: element.index,
	            row: {
	                state: true
	            }
	        })
	    })
	});

}

function addTeam(teamRow) {
    var newTeam = {
        index: teamRow.id,
        name: teamRow.name,
        price: teamRow.price,
        points: 0
    };

    userRef.once("value", function(snapshot) {
        var user = snapshot.val();
        if (!user.teams)
            user.teams = [];
        if (user.remains < newTeam.price 
        	|| user.teams.length === MAX_TEAMS_PER_USER) {
            cancelAddingNewTeam(newTeam.index);
        } else {
            user.teams.push(newTeam);
            user.remains -= newTeam.price;
            user.spent += newTeam.price;
            userRef.set(user);
        }

    })
}

function removeTeam(teamRow) {
    var removedTeam = {
        index: teamRow.id,
        name: teamRow.name,
        price: teamRow.price,
        points: 0
    };

    userRef.once("value", function(snapshot) {
        var user = snapshot.val();
        user.teams = user.teams.filter(function(element) {
            return element.name !== removedTeam.name
        });
        user.remains += removedTeam.price;
        user.spent -= removedTeam.price;
        userRef.set(user);
    });
}

function cancelAddingNewTeam(index) {
    $table.bootstrapTable('updateRow', {
        index: index,
        row: {
            state: false
        }
    })
}
