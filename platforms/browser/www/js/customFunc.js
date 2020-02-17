
const NAME_LIMIT_CHARS = 20
//Custom Func
function GetHomeHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT tg.*,tfg.idFollowedGame AS followed  FROM TGames tg LEFT JOIN TFollowedGames AS tfg ON tg.idGame = tfg.idFollowedGame ;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    row.isFollowed = row.followed == row.idGame;
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        var actualCount = 0;
        var followCount = 0;
        var followed = '';
        var actual = '';
        for (let i = 0; i < games.length && (actualCount < 3 && followCount < 3); i++) {
            const g = games[i];
            if (g.isFollowed && followCount < 3) {
                followed += '<a href="game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy" /></a>';
                followCount++;
            }
            if (actualCount < 3) {
                actual += '<a href="game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" /></a>';
                actualCount++;
            }
        }
        document.getElementById('followedGames').innerHTML = followed;
        document.getElementById('actualGames').innerHTML = actual;
    });
}

function GetSingleGame(id) {
    var g;
    db.transaction(function (tx) {
        tx.executeSql('SELECT *  FROM TGames tg WHERE tg.idGame = '+id+';'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    g = row;
                }
            }, errorCallback);
    }, errorCallback, function () {
        document.getElementById("img").innerHTML = '<img src="'+g.imgId+'" width="100%" class="lazy" />';
        document.getElementById("nameGame").innerText = decodeURI(g.nameGame);
        document.getElementById("summary").innerText = decodeURI(g.summary);
        document.getElementById("storyline").innerText = decodeURI(g.storyline);
        document.getElementById("ratings").innerText = decodeURI(g.rating);
        getPlatforms(g,"platforms",-1);
        getGenres(g,"genres",-1);
        getCompanies(g,"companies",-1);
        getModes(g,"modes",-1);
        document.getElementById("popularity").innerText = decodeURI(g.popularity);
        document.getElementById("firstReleaseDate").innerText = timestampToStr(g.firstReleaseDate);
    });
}

function GetAllHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT *  FROM TGames tg;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        var allG = "<tr><th>Name</th><th>Rat.</th><th>Out</th><th>Pop.</th><th>Gen.</th><th>Pla.</th></tr>";
        for (let i = 0; i < games.length; i++) {

            const g = games[i];
            allG += '<tr>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame),NAME_LIMIT_CHARS) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + g.rating + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + timestampToStr(g.firstReleaseDate) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(g.popularity,5) + '</a></td>';
            allG += '<td><a class="tableLink" id="allGenresGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '<td><a class="tableLink" id="allPlatformsGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '</tr>'

        }
        document.getElementById('allGameTable').innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            var g = games[i];
            getGenres(games[i],"allGenresGame"+g.idGame);
            getPlatforms(games[i],"allPlatformsGame"+g.idGame);
        }
    });
}

function limitNbChar(words, nbChars) {
    if(words == undefined){
        return "";
    }
    if (nbChars > -1 && words.length > nbChars) {
        return words.substring(0, nbChars - 3) + "...";
    }
    else {
        return words;
    }
}
function timestampToStr(timestamp) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
    var date = new Date(timestamp*1000);
    var year = date.getFullYear();
    var month = months[date.getMonth()];
    var day = date.getDate();
    var formattedTime = day + ' ' + month + ' ' + year;
    return formattedTime;
}

function GetActualHTML() {
    var games = [];
    db.transaction(function (tx) {
        //Récupère les bonnes dates
        var dBefore = Math.round((Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
        var dAfter = Math.round((Date.now() + DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);


        tx.executeSql('SELECT *  FROM TGames tg WHERE tg.firstReleaseDate < ' + dAfter + ' AND tg.firstReleaseDate > ' + dBefore + ';'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        var allG = "<tr><th>Name</th><th>Rat.</th><th>Out</th><th>Pop.</th><th>Gen.</th><th>Pla.</th></tr>";
        for (let i = 0; i < games.length; i++) {

            const g = games[i];
            allG += '<tr>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame),NAME_LIMIT_CHARS) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + g.rating + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + timestampToStr(g.firstReleaseDate) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(g.popularity,5) + '</a></td>';
            allG += '<td><a class="tableLink" id="actualGenresGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '<td><a class="tableLink" id="actualPlatformsGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '</tr>'

        }
        document.getElementById("actualGameTable").innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            var g = games[i];
            getGenres(games[i],'actualGenresGame'+g.idGame);
            getPlatforms(games[i],"actualPlatformsGame"+g.idGame);
        }
    });
}

function errorCallback(tx, err) {
    alert("Une erreur est survenue " + (err != undefined ? err.message : tx.message));

    console.log(err);
    console.log(tx);
    console.trace();
    return false;
}


//Custom Func
function GetFollowedHTML() {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT tg.*,tfg.idFollowedGame AS followed  FROM TGames tg JOIN TFollowedGames AS tfg ON tg.idGame = tfg.idFollowedGame ;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    var row = results.rows.item(i);
                    if(row.followed == row.idGame){
                        games.push(row);
                    }
                }
            }, errorCallback);
    }, errorCallback, function () {
        var allG = "<tr><th>Name</th><th>Rat.</th><th>Out</th><th>Pop.</th><th>Gen.</th><th>Pla.</th></tr>";
        for (let i = 0; i < games.length; i++) {

            var g = games[i];
            allG += '<tr>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame),NAME_LIMIT_CHARS) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + g.rating + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + timestampToStr(g.firstReleaseDate) + '</a></td>';
            allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(g.popularity,5) + '</a></td>';
            allG += '<td><a class="tableLink" id="followedGenresGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '<td><a class="tableLink" id="followedPlatformsGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
            allG += '</tr>'

        }
        document.getElementById("followedGameTable").innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            var g = games[i];
            getGenres(games[i],'followedGenresGame'+g.idGame);
            getPlatforms(games[i],"followedPlatformsGame"+g.idGame);
        }
    });
}