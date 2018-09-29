var result = [];

$.getJSON("https://popping-inferno-4625.firebaseio.com/users-ke-2018.json")
    .then(function (users) {
        $.getJSON("https://popping-inferno-4625.firebaseio.com/teams-ke-2018.json", function (teams) {
            var teams_counter = {};
            var users_count = 0;

            for (var team in teams) {
                teams_counter[teams[team].name] = 0;
            }

            for (var key in users) {
                // debugger;
                var user = users[key];
                if (user.teams && user.teams.length > 0) {
                    users_count += 1;
                    user.teams.forEach(function (team) {
                        // debugger;
                        teams_counter[team.name] += 1;
                    });

                }


            }

            for (key in teams) {
                team = teams[key];
                result.push({
                    team: team.name,
                    price: team.price,
                    pct: (100 * teams_counter[team.name] / users_count).toFixed(2)
                });
            }

            result.sort(function (a, b) {
                return b.pct - a.pct;
            });
            React.render(React.createElement(List, {teams: result}), document.getElementById('center'));


        })
    });


var List = React.createClass({
    displayName: "List",
    render: function () {
        var teams = [];
        for (var i = 0; i < this.props.teams.length; i++) {
            this.props.teams[i].place = i + 1;
            // debugger;
            teams.push(React.createElement(Team, {team: this.props.teams[i]}));
        }
        return (
            React.createElement("div", {className: "resultsList"},
                React.createElement('h3', null, 'Популярные команды'),
                React.createElement('p', null, 'Процент игроков, взявших команду в\u00A0свою сборную (в\u00A0скобках — цена команды).'),
                React.createElement('br'),
                teams
            )
        );
    }

});

var Team = React.createClass({
    displayName: "Team",
    render: function () {
        return (
            React.createElement("div", {className: "resultsUserTeams"},
                React.createElement("p", null,
                    this.props.team.place, ". ",
                    this.props.team.team, " — ",
                    this.props.team.pct, "% (",
                    this.props.team.price, ")"
                )
            )
        );
    }
});


