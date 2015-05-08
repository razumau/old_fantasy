var users = [];

$.getJSON("https://popping-inferno-4625.firebaseio.com/users.json", function (list) {
	for (var key in list) {
		var user = list[key];
		if (user.remains < 100 && user.teams) {
			users.push({name: user.name, teams: user.teams});
		}
	}
	React.render(React.createElement(List, {users: users}), document.getElementById('center'));
});


var List = React.createClass({displayName: "List",
	render: function() {
		var users = [];
		this.props.users.forEach(function (user) {
			users.push(React.createElement(User, {user: user}));
		});
		shuffle(users);
		return (
			React.createElement("div", {className: "list"}, 
			users
			)
		);
	}
	
});

var User = React.createClass({displayName: "User",
	render: function() {
		var teams = [];
		this.props.user.teams.forEach(function (team) {
			teams.push(React.createElement("p", null, team.name));
		});
		return (
			React.createElement("a", {href:"https://fantasy.razumau.net"}, "← к выбору команд", "div", {className: "userTeams"}, 
				React.createElement("h3", null, " ", this.props.user.name, " "), 
				teams
			)
		);
	}
});

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

