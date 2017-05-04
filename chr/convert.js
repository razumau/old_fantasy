var users = new Firebase("https://popping-inferno-4625.firebaseio.com/users-chr");

var teams = {};

$.getJSON("https://popping-inferno-4625.firebaseio.com/teams-chr.json", function (list) {
	for (var key in list) {
		var t = list[key];
		teams[t.name] = {name: t.name, index: t.id, points: t.points, price: t.price};
	}
	users.once('value', function (snap) {
		
		snap.forEach(function (userSnap) {
			var user = userSnap.val();

			if (user.teams) {
				var ts = user.teams;
				user.teams = [];
				for (var i = 0; i < ts.length; i++) {
					
					var t = ts[i].name;
					user.teams.push(teams[t]);

				}
			}
			var userRef = userSnap.ref();
			userRef.set(user);

		})
	})
});

