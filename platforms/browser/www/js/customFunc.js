
//Custom Func
function GetHomeHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT tg.*,tfg.idFollowedGame AS followed  FROM TGames tg LEFT JOIN TFollowedGames AS tfg ON tg.idGame = tfg.idFollowedGame ;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    row.platforms = getPlatforms(tx, row.idGame);
                    row.genres = getGenres(tx, row.idGame);
                    row.companies = getCompanies(tx, row.idGame);
                    row.modes = getModes(tx, row.idGame);
                    row.isFollowed =row.followed == row.idGame;
                    games.push(row);
                }
                console.log(games);
            }, errorCallback);
    }, errorCallback, function () {
        var actualCount = 0;
        var followCount = 0;
        var followed = '';
        var actual = '';
        for (let i = 0; i < games.length && (actualCount < 3 && followCount < 3); i++) {
            const g = games[i];
            if (g.isFollowed && followCount < 3) {
                followed += '<a href="game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + g.nameGame + '</div><img src="' + g.imgId + '" width="100%" class="lazy" /></a>';
                followCount++;
            }
            if (actualCount < 3) {
                actual += '<a href="game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + g.nameGame + '</div><img src="' + g.imgId + '" width="100%" /></a>';
                actualCount++;
            }
        }
        document.getElementById('followedGames').innerHTML = followed;
        document.getElementById('actualGames').innerHTML = actual;
    });
}


function GetAllHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT *  FROM TGames tg;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    row.platforms = getPlatforms(tx, row.idGame);
                    row.genres = getGenres(tx, row.idGame);
                    row.companies = getCompanies(tx, row.idGame);
                    row.modes = getModes(tx, row.idGame);
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        var allG = "<tr><th>Name</th><th>Rat.</th><th>Out</th><th>Pop.</th><th>Gen.</th><th>Pla.</th></tr>";
        for (let i = 0; i < games.length; i++) {

            const g = games[i];
            allG += '<tr>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.nameGame+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.rating+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.firstReleaseDate+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.popularity+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.genres+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.platforms+'</a></td>';
            allG += '</tr>'
            
        }
        allGameTable.innerHTML = allG;
    });
}


function GetActualHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT *  FROM TGames tg;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    row.platforms = getPlatforms(tx, row.idGame);
                    row.genres = getGenres(tx, row.idGame);
                    row.companies = getCompanies(tx, row.idGame);
                    row.modes = getModes(tx, row.idGame);
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        var allG = "<tr><th>Name</th><th>Rat.</th><th>Out</th><th>Pop.</th><th>Gen.</th><th>Pla.</th></tr>";
        for (let i = 0; i < games.length; i++) {

            const g = games[i];
            allG += '<tr>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.nameGame+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.rating+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.firstReleaseDate+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.popularity+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.genres+'</a></td>';
            allG += '<td><a class="tableLink" href="/game/'+g.idGame+'/">'+g.platforms+'</a></td>';
            allG += '</tr>'
            
        }
        allGameTable.innerHTML = allG;
    });
}

function errorCallback(tx, err) {
    alert("Une erreur est survenue " + (err != undefined ? err.message : tx.message));

    console.log(err);
    console.log(tx);
    return false;
}