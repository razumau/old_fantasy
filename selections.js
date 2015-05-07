var users = [];

$.getJSON("https://popping-inferno-4625.firebaseio.com/users.json", function (list) {
	for (var key in list) {
		var user = list[key];
		if (user.remains < 100 && user.teams) {
			users.push({name: user.name, teams: user.teams});
		}
	}
	React.render(<List users={users} />, document.getElementById('center'));
});


var List = React.createClass({
	render: function() {
		var users = [];
		this.props.users.forEach(function (user) {
			users.push(<User user={user} />);
		});
		shuffle(users);
		console.log(users);
		return (
			<div className="list">
			{users}
			</div>
		);
	}
	
});

var User = React.createClass({
	render: function() {
		var teams = [];
		this.props.user.teams.forEach(function (team) {
			teams.push(<p>{team.name}</p>);
		});
		return (
			<div className="userTeams">
				<h3> {this.props.user.name} </h3>
				{teams}
			</div>
		);
	}
});

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

