var $table = $('#table-javascript');
var allTeams = [];
var MAX_TEAMS_PER_USER = 5;

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
    }).on("uncheck.bs.table", function (e, name, args) {
        removeTeam(name)
    }).on("load-success.bs.table", function(e, data) {
        highlightSelectedTeamsInTable();
    });


function highlightSelectedTeamsInTable() {
    var ref = new Firebase("https://popping-inferno-4625.firebaseio.com/users/1");
    ref.once("value", function(snapshot) {
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
    var ref = new Firebase("https://popping-inferno-4625.firebaseio.com/users/1"),
        newTeam = {index: teamRow.id, name: teamRow.name, price: teamRow.price, points: 0};

    ref.once("value", function (snapshot) {
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
            ref.set(user);
        }

    })
}

function removeTeam (teamRow) {
    var ref = new Firebase("https://popping-inferno-4625.firebaseio.com/users/1"),
        removedTeam = {index: teamRow.id, name: teamRow.name, price: teamRow.price, points: 0};

    ref.once("value", function (snapshot) {
        var user = snapshot.val();
        user.teams = user.teams.filter(function (element) {
            return element.name !== removedTeam.name
        });
        user.remains += removedTeam.price;
        user.spent -= removedTeam.price;
        ref.set(user);
    });
}

function cancelAddingNewTeam (index) {
    console.log('cancelling');
    $table.bootstrapTable('updateRow', {
        index: index,
        row: {
            state: false
        }
    })
}
