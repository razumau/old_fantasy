var users = [];
var MAX_POINTS = 175;

$.getJSON("https://popping-inferno-4625.firebaseio.com/users-ke-2018.json", function (list) {
    for (var key in list) {
        var user = list[key];
        if (user.remains < MAX_POINTS && user.teams) {
            user.teams.sort(function (a, b) {
                return b.points - a.points;
            });
            var sum = 0, sum_price = 0;
            for (var i = user.teams.length - 1; i >= 0; i--) {
                sum += user.teams[i].points;
                sum_price += user.teams[i].price;
            }
            if (sum_price <= MAX_POINTS) {
                users.push({name: user.name, teams: user.teams, sum: sum});
            }
        }
    }
    users.sort(function (a, b) {
        return b.sum - a.sum;
    });
    React.render(React.createElement(List, {users: users}), document.getElementById('center'));
});


var List = React.createClass({
    displayName: "List",
    render: function () {
        var users = [];
        for (var i = 0; i < this.props.users.length; i++) {
            this.props.users[i].place = i + 1;
            users.push(React.createElement(User, {user: this.props.users[i]}));
        }
        return (
            React.createElement("div", {className: "resultsList"},
                users
            )
        );
    }

});

var User = React.createClass({
    displayName: "User",
    render: function () {
        var teams = [];
        this.props.user.teams.forEach(function (team) {
            var str = [team.name, " — ", team.points, " (", team.price, ")"].join('');
            teams.push(React.createElement("p", null, str));
        });
        return (
            React.createElement("div", {className: "resultsUserTeams"},
                React.createElement("h3", null,
                    this.props.user.place, ". ",
                    this.props.user.name, " — ",
                    this.props.user.sum
                ),
                teams
            )
        );
    }
});

function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

