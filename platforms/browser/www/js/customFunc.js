
//Custom Func
function GetHomeHTML() {
    console.log("Bite");
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
        followedGames.innerHTML = followed;
        actualGames.innerHTML = actual;
    });
}

function errorCallback(tx, err) {
    alert("Une erreur est survenue " + (err != undefined ? err.message : tx.message));

    console.log(err);
    console.log(tx);
    return false;
}