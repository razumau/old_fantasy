var config = {
    apiKey: "AIzaSyCIvow5DuwC9oxwec7vbbqikd6AFHHRinc",
    authDomain: "popping-inferno-4625.firebaseapp.com",
    databaseURL: "https://popping-inferno-4625.firebaseio.com",
    projectId: "popping-inferno-4625",
    storageBucket: "popping-inferno-4625.appspot.com",
    messagingSenderId: "647131766498"
};
firebase.initializeApp(config);
var db = firebase.database();
var users = db.ref("users-schr-2022");

var teams = {};

$.getJSON("https://popping-inferno-4625.firebaseio.com/teams-schr-2022.json", function (list) {
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


                try {
                    userSnap.ref.set(user);
                } catch (error) {
                    console.log(error);
                    console.log(user);
                }

            }
        });
    });
    console.log('converted')
});

