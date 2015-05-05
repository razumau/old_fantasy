var $table = $('#allTeams');
var allTeams = [];
var MAX_TEAMS_PER_USER = 5;
var SHORT_TIMEOUT = 5000;
var LONG_TIMEOUT = 10000;
var rootRef = new Firebase("https://popping-inferno-4625.firebaseio.com");
rootRef.onAuth(authCallback);
var userRef = {};

var numbers = {
	1: 'одной', 
	2: 'двух', 
	3: 'трёх', 
	4: 'четырёх', 
	5: 'пяти',
	6: 'шести',
	7: 'семи',
	8: 'восьми',
	9: 'девяти',
	10: 'десяти'
};

$('body').on('click', '[data-action]', function() {
	var action = $(this).data('action');
	if (action in actions) actions[action]();
});

var UserBox = React.createClass({
	displayName: "UserBox",
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
		var teams = [];
		var userName = React.createElement("div", 
					{ id: "userName" }, 
					this.state.user.name, " ",
					React.createElement("a", 
							{ id: "logout", 
								href: "#", 
								"data-action": "logout"
							}, "(выйти)")
					);

		if (this.state.user.teams) {
			for (var i = 0; i < this.state.user.teams.length; i++) {
				teams.push(React.createElement("span", 
					{ className: "list-group-item" },
					this.state.user.teams[i].name,
						React.createElement("span", 
							{ className: "badge" }, 
							this.state.user.teams[i].price)
					));
			}

			return (React.createElement("div", { className: "userBox" },
				userName,
				React.createElement("br", null),
				React.createElement("div", {id: "remainingPoints"}, this.state.user.remains),
				React.createElement("div", null, React.createElement("div", {className: "list-group"}, teams), " "
			)));
		} else {
			return (React.createElement("div", { className: "userBox" },
					userName,
					React.createElement("br", null),
					React.createElement("div", {id: "remainingPoints"}, this.state.user.remains),
					React.createElement("p", null, "Не больше пяти команд."),
					React.createElement("p", null, "Результат — сумма ответов команд."),
					React.createElement("p", null, "Изменения можно делать до 9 мая."))
				
			);
		}
	}
});




var actions = {
	facebookLogin: function() {

		rootRef.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				if (error.code === "TRANSPORT_UNAVAILABLE") {
					rootRef.authWithOAuthRedirect("facebook", 
						function (error, authData) {}, 
						{
							remember: "none",
							scope: "public_profile"
						});
				}
			}
		}, {
			remember: "none",
			scope: "public_profile"
		});
	},

	googleLogin: function() {
		rootRef.authWithOAuthPopup("google", function(error, authData) {
			if (error) {
				if (error.code === "TRANSPORT_UNAVAILABLE") {
					rootRef.authWithOAuthRedirect("google", 
						function (error, authData) {} );
				}
			}
		});
	},

	twitterLogin: function() {
		rootRef.authWithOAuthPopup("twitter", function(error, authData) {
			if (error) {
				if (error.code === "TRANSPORT_UNAVAILABLE") {
					rootRef.authWithOAuthRedirect("twitter", 
						function (error, authData) {} );
				}
			}
		});
	},

	logout: function () {
		rootRef.unauth();
		location.reload();
	}
};

function authCallback(authData) {
	if (authData) {
		hideLoginButtons();
		userRef = rootRef.child("users").child(authData.uid);
		userRef.once('value', function(snapshot) {
			var user = snapshot.val();
			userRef = rootRef.child("users").child(authData.uid);
			if (!user) {
				userRef.set({
					provider: authData.provider,
					name: authData[authData.provider].displayName,
					remains: 100,
					spent: 0
				});
			}

			showMainScreen();

		})

	} else {
		showLoginButtons();
	}
}

function showMainScreen() {
	showTable();
	updateBackground();
	React.render(React.createElement(UserBox, null), 
			document.getElementById('userTeams'));
}

function showLoginScreen() {
	
	/*hideTable();
	
	React.unmountComponentAtNode(document.getElementById('userTeams'));*/
}

function updateBackground () {
	$('#centerColumn').css('background-color', '#ffffff')
			.addClass('z-depth-4');
	$('#userTeams').css('background-color', '#ffffff')
			.css('min-height', '350px');

}

function hideLoginButtons() {
	$('#loginButtons').css("display", "none");
}

function showLoginButtons() {
	$('#loginButtons').css("display", "block");
}

function hideTable () {
	$table.bootstrapTable('destroy');
}

function showTable() {
	$table.bootstrapTable({
		method: 'get',
		url: 'https://popping-inferno-4625.firebaseio.com/teams.json',
		cache: false,
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
		console.log('check.bs');
		addTeam(name);
	}).on("uncheck.bs.table", function(e, name, args) {
		removeTeam(name);
	}).on("load-success.bs.table", function(e, data) {
		highlightSelectedTeamsInTable();
	});
}


function highlightSelectedTeamsInTable() {
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
		if (user.teams.length === MAX_TEAMS_PER_USER) {
			cancelAddingNewTeam(newTeam.index);
			showAlert('Нельзя брать больше ' 
					+ numbers[MAX_TEAMS_PER_USER]
					+ '&nbsp;команд', SHORT_TIMEOUT, true);
		} else if (user.remains < newTeam.price) {
			cancelAddingNewTeam(newTeam.index);
			showAlert('Осталось всего ' 
					+ user.remains 
					+ '&nbsp;очков. Это меньше '
					+ newTeam.price
					+ ', возьмите команду послабее', LONG_TIMEOUT, true);
		} else {
			user.teams.push(newTeam);
			user.remains -= newTeam.price;
			user.spent += newTeam.price;
			userRef.set(user);
			showAlert('Осталось ' + user.remains + '&nbsp;очков', SHORT_TIMEOUT);
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
		var countRemoveTeams = 0;
		user.teams = user.teams.filter(function(element) {
			if (element.name === removedTeam.name) {
				countRemoveTeams++;
				return false;
			} else {
				return true;
			}
		});
		if (countRemoveTeams) {
			user.remains += removedTeam.price;
			user.spent -= removedTeam.price;
		}
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


function hideAlerts () {
	$('.alert').remove();
}

function showAlert (message, timeout, important) {
	hideAlerts();
	if (important || !isInViewport($('#remainingPoints'))) {
		$('#centerColumn').append('<div id="remainsAlert" class="alert alert-dismissable"><button type="button" class="close" data-dismiss="alert">×</button>'
			+ message + '</div>');

		window.setTimeout(hideAlerts, timeout);
	}
}

function isInViewport (el) {

    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}
