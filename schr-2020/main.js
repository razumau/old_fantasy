var $table = $('#allTeams');
var MAX_TEAMS_PER_USER = 5;
var SHORT_TIMEOUT = 5000;
var LONG_TIMEOUT = 10000;
var MAX_POINTS = 200;
var USERS = "users-schr-2020";
var userRef;


function getUiConfig() {
    return {
        'callbacks': {
            'signInSuccessWithAuthResult': function (authResult, redirectUrl) {
                authCallback(authResult);
                return false;
            }
        },
        'signInFlow': 'popup',
        'signInOptions': [
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                authMethod: 'https://accounts.google.com',
                clientId: CLIENT_ID
            },
            {
                provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                scopes: [
                    'public_profile',
                    'email'
                ]
            },
            firebase.auth.TwitterAuthProvider.PROVIDER_ID
        ],
        'tosUrl': 'https://www.google.com',
        'privacyPolicyUrl': 'https://www.google.com',
        'credentialHelper': CLIENT_ID
    };
}


var config = {
    apiKey: "AIzaSyCIvow5DuwC9oxwec7vbbqikd6AFHHRinc",
    authDomain: "popping-inferno-4625.firebaseapp.com",
    databaseURL: "https://popping-inferno-4625.firebaseio.com",
    projectId: "popping-inferno-4625",
    storageBucket: "popping-inferno-4625.appspot.com",
    messagingSenderId: "647131766498"
};
firebase.initializeApp(config);

var CLIENT_ID = '725662173800-lnlbumhkacu43pl2c498itl47h4qm567.apps.googleusercontent.com';
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.disableAutoSignIn();
ui.start('#firebaseui-container', getUiConfig());


var handleSignedOutUser = function () {
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    ui.start('#firebaseui-container', getUiConfig());
};


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

var UserBox = React.createClass({
    displayName: "UserBox",

    getInitialState: function () {
        return {
            user: {}
        };
    },

    componentWillMount: function () {
        var userbox = this;
        userRef.on('value', function (snap) {
            var val = snap.val();
            userbox.setState({user: val});
        });
    },


    render: function () {
        var teams = [];
        var userName = React.createElement("div",
            {id: "userName"},
            this.state.user.name, " "
        );

        if (this.state.user.teams) {
            for (var i = 0; i < this.state.user.teams.length; i++) {
                teams.push(React.createElement("span",
                    {className: "list-group-item"},
                    this.state.user.teams[i].name,
                    React.createElement("span",
                        {className: "badge"},
                        this.state.user.teams[i].price)
                ));
            }

            return (React.createElement("div", {className: "userBox"},
                    userName,
                    React.createElement("br", null),
                    React.createElement("div", {id: "remainingPoints"}, this.state.user.remains),
                    React.createElement("div", null, React.createElement("div", {className: "list-group"}, teams), " "),
                    React.createElement("div", {id: "selectionsLinkTeams"},
                        React.createElement("a", {
                            href: "https://fantasy.razumau.net/schr-2020/results",
                            id: "selectionsLink"
                        }, "Кого выбрали другие?"))
                )
            );
        } else {
            return (React.createElement("div", {className: "userBox"},
                    userName,
                    React.createElement("br", null),
                    React.createElement("div", {id: "remainingPoints"}, this.state.user.remains),
                    React.createElement("p", null, "Не больше пяти команд."),
                    React.createElement("p", null, "Результат — сумма ответов команд."),
                    React.createElement("p", null, "Изменения можно делать до 9:00 19 сентября."),
                    React.createElement("div", {id: "selectionsLinkRules"},
                        React.createElement("a", {
                            href: "https://fantasy.razumau.net/schr-2020/results",
                            id: "selectionsLink"
                        }, "Кого выбрали другие?"))
                )

            );
        }
    }
});


function authCallback(authData) {
    if (authData) {
        var db = firebase.database();
        userRef = db.ref(USERS + '/' + authData.user.uid);
        userRef.once('value', function (snapshot) {
            var user = snapshot.val();
            if (!user) {
                var provider = authData.additionalUserInfo.providerId;
                var name = authData.additionalUserInfo.profile.name;
                userRef.set({
                    provider: provider,
                    name: name,
                    remains: MAX_POINTS,
                    spent: 0
                });
            }
            showMainScreen();
        })

    } else {
        if (!userRef)
            showLoginButtons();
    }
}

function showMainScreen() {
    showTable();
    updateBackground();
    React.render(React.createElement(UserBox, null),
        document.getElementById('userTeams'));
}


function updateBackground() {
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

function hideTable() {
    $table.bootstrapTable('destroy');
}

function showTable() {
    $table.bootstrapTable({
        method: 'get',
        url: 'https://popping-inferno-4625.firebaseio.com/teams-schr-2020.json',
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
        }]
    }).on("check.bs.table", function (e, name, args) {
        addTeam(name);
    }).on("uncheck.bs.table", function (e, name, args) {
        removeTeam(name);
    }).on("load-success.bs.table", function (e, data) {
        highlightSelectedTeamsInTable();
    });
}


function highlightSelectedTeamsInTable() {
    userRef.once("value", function (snapshot) {
        var teams = snapshot.val().teams;
        if (!teams)
            return;
        teams.forEach(function (element) {
            var index = -1;
            $table.data()["bootstrap.table"].data.forEach(function (elem, ind) {
                if (elem.name === element.name) {
                    index = ind;
                }
            });
            $table.bootstrapTable('updateRow', {
                index: index,
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

    userRef.once("value", function (snapshot) {
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
            if (!isAlreadySelected(user.teams, newTeam) && user.remains >= newTeam.price) {
                user.teams.push(newTeam);
                user.remains -= newTeam.price;
                user.spent += newTeam.price;
                userRef.set(user);
                showAlert('Осталось ' + user.remains + '&nbsp;очков', SHORT_TIMEOUT);
            }
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

    userRef.once("value", function (snapshot) {
        var user = snapshot.val();
        var filtered = user.teams.filter(function (element) {
            return element.name !== removedTeam.name;
        });
        if (user.teams.length !== filtered.length) {
            user.teams = filtered;
            user.remains += removedTeam.price;
            user.spent -= removedTeam.price;
            userRef.set(user);
        }
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

function isAlreadySelected(teams, newTeam) {
    for (var i = 0; i < teams.length; i++) {
        if (teams[i].name === newTeam.name)
            return true;
    }
    return false;
}

function hideAlerts() {
    $('.alert').remove();
}

function showAlert(message, timeout, important) {
    hideAlerts();
    if (important || !isInViewport($('#remainingPoints'))) {
        $('#centerColumn').append('<div id="remainsAlert" class="alert alert-dismissable"><button type="button" class="close" data-dismiss="alert">×</button>'
            + message + '</div>');

        window.setTimeout(hideAlerts, timeout);
    }
}

function isInViewport(el) {
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
