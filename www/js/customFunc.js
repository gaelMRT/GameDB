
const NAME_LIMIT_CHARS = 20
const HOME_MAX_GAME_BY_ROW = 3
//Custom Func
function GetHomeHTML() {
    let games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT tg.*,tfg.idFollowedGame AS followed  FROM TGames tg LEFT JOIN TFollowedGames AS tfg ON tg.idGame = tfg.idFollowedGame ;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    let row = results.rows.item(i);
                    row.isFollowed = row.followed == row.idGame;
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        let actualCount = 0;
        let followCount = 0;
        let followed = '';
        let actual = '';
        games.sort(gameComparePopularity);
        for (let i = 0; i < games.length && (actualCount < HOME_MAX_GAME_BY_ROW || followCount < HOME_MAX_GAME_BY_ROW); i++) {
            const g = games[i];
            if (g.isFollowed && followCount < HOME_MAX_GAME_BY_ROW) {
                followed += '<a href="/game/' + g.idGame + '/" class="block col-'+Math.floor(100/HOME_MAX_GAME_BY_ROW)+' gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy" /></a>';
                followCount++;
            }
            if (actualCount < HOME_MAX_GAME_BY_ROW) {
                actual += '<a href="/game/' + g.idGame + '/" class="block col-'+Math.floor(100/HOME_MAX_GAME_BY_ROW)+' gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy"/></a>';
                actualCount++;
            }
        }
        document.getElementById('followedGames').innerHTML = followed;
        document.getElementById('actualGames').innerHTML = actual;
        //#region Activate "See more" buttons
        if (followCount < HOME_MAX_GAME_BY_ROW) {
            document.getElementById('moreFollowed').innerHTML = '';
        } else {
            document.getElementById('moreFollowed').innerHTML = '<a href="/followed/">See more ...</a>';
        }
        if (actualCount < HOME_MAX_GAME_BY_ROW) {
            document.getElementById('moreActual').innerHTML = '';
        } else {
            document.getElementById('moreActual').innerHTML = '<a href="/actual/">See more ...</a>';
        }
        //#endregion
    });
}//end GetHomeHTML

function GetSingleGame(id) {
    let g;
    db.transaction(function (tx) {
        //#region Sql call
        tx.executeSql('SELECT *  FROM TGames tg WHERE tg.idGame = ' + id + ';'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    let row = results.rows.item(i);
                    g = row;
                }
                tx.executeSql('SELECT * FROM TFollowedGames t WHERE t.idFollowedGame = ' + g.idGame + ';', [], function (tx, results) {
                    if (results.rows.length > 0) {
                        g.followed = true;
                    } else {
                        g.followed = false;
                    }
                });
            }, errorCallback);
            //#endregion
    }, errorCallback, function () {
        //#region Set page values
        document.getElementById("img").innerHTML = '<img src="' + g.imgId + '" width="100%" class="lazy" />';
        document.getElementById("nameGame").innerText = decodeURI(g.nameGame);
        document.getElementById("nameGame2").innerText = decodeURI(g.nameGame);
        document.getElementById("summary").innerText = decodeURI(g.summary);
        document.getElementById("storyline").innerText = decodeURI(g.storyline);
        document.getElementById("ratings").innerText = g.rating;
        document.getElementById("followed").innerText = "star" + (g.followed ? "_fill" : "");
        getPlatforms(g, "platforms", false);
        getGenres(g, "genres", false);
        getCompanies(g, "companies", -1);
        getModes(g, "modes", -1);
        document.getElementById("popularity").innerText = g.popularity.toFixed(2);
        document.getElementById("firstReleaseDate").innerText = timestampToStr(g.firstReleaseDate);
        //#endregion
        //Set toggle of follow with current id
        document.getElementById("followed").onclick = function () {
            id = g.idGame;
            toggleFollowed(id, function (results) {
                g.followed = results;
                if (g.followed) {
                    document.getElementById("followed").innerText = "star_fill";
                } else {
                    document.getElementById("followed").innerText = "star";
                }
            });

        }
    });
}//end GetSingleGame


//Get actual(defined in a range of DAYS_ACTUAL_AFTER_BEFORE) games and put them in html
function GetActualHTML() {
    let games = [];
    db.transaction(function (tx) {
        //Récupère les bonnes dates
        let dBefore = Math.round((Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
        let dAfter = Math.round((Date.now() + DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);


        tx.executeSql('SELECT *  FROM TGames tg WHERE tg.firstReleaseDate < ' + dAfter + ' AND tg.firstReleaseDate > ' + dBefore + ';'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    let row = results.rows.item(i);
                    games.push(row);
                }
            }, errorCallback);
    }, errorCallback, function () {
        games.sort(gameCompareName);
        let allG = gamesArrayToTable(games, "actual");

        document.getElementById("actualGameTable").innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            let g = games[i];
            getGenres(games[i], 'actualGenresGame' + g.idGame);
            getPlatforms(games[i], "actualPlatformsGame" + g.idGame);
        }
    });
}//end GetActualHTML


//Get followed games and put them in html
function GetFollowedHTML() {
    let games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT tg.*,tfg.idFollowedGame AS followed  FROM TGames tg JOIN TFollowedGames AS tfg ON tg.idGame = tfg.idFollowedGame ;'
            , [], function (tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    let row = results.rows.item(i);
                    if (row.followed == row.idGame) {
                        games.push(row);
                    }
                }
            }, errorCallback);
    }, errorCallback, function () {
        games.sort(gameCompareName);
        let allG = gamesArrayToTable(games, "followed");

        document.getElementById("followedGameTable").innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            let g = games[i];
            getGenres(g, 'followedGenresGame' + g.idGame);
            getPlatforms(g, "followedPlatformsGame" + g.idGame);
        }
    });
}//end GetFollowedHTML


//Set game follow to true when false and inversly
function toggleFollowed(id, callback) {
    let result = false;
    let sql = 'DELETE FROM TFollowedGames WHERE idFollowedGame = ' + id + ' ;';
    db.transaction(function (tx) {
        tx.executeSql(sql, [], function (tx, results) {
            if (results.rowsAffected == 0) {
                let newSql = "INSERT INTO TFollowedGames (idFollowedGame) VALUES (" + id + ");"
                tx.executeSql(newSql, [], null, errorCallback);
                result = true;
            }
        }, errorCallback);
    }, errorCallback, function () {
        callback(result);
    });
}//end toggleFollowed

/*
DATA TRANSFORMATIONS
*/

//Transform an array of game to a table
function gamesArrayToTable(gameArray, prefix) {
    let allG = "<tr><th>Name</th><th>Gen.</th><th>Pla.</th><th>Out in</th></tr>";
    for (let i = 0; i < gameArray.length; i++) {

        let g = gameArray[i];
        allG += '<tr>';
        allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame), NAME_LIMIT_CHARS) + '</a></td>';
        let remainingDays = remainingTo(g.firstReleaseDate);
        allG += '<td><a class="tableLink" id="' + prefix + 'GenresGame' + g.idGame + '" href="/game/' + g.idGame + '/"></a></td>';
        allG += '<td><a class="tableLink" id="' + prefix + 'PlatformsGame' + g.idGame + '" href="/game/' + g.idGame + '/"></a></td>';
        allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + (remainingDays > 0 ? remainingDays + " days" : "") + '</a></td>';
        allG += '</tr>'

    }
    return allG;
}//end gamesArrayToTable

//Calculate days before given timestamp
function remainingTo(timestamp) {
    //Convert ms timestamp to sec timestamp
    let dNow = Math.round((Date.now()) / 1000);

    let diff = timestamp - dNow;
    //sec to day
    let daysDiff = diff / 86400
    return Math.round(daysDiff)
}

//Limit a word to a given number of chars
function limitNbChar(words, nbChars) {
    if (words == undefined) {
        return "";
    }
    if (nbChars > -1 && words.length > nbChars) {
        return words.substring(0, nbChars - 3) + "...";
    }
    else {
        return words;
    }
}
//Transform a timestamp to a string
function timestampToStr(timestamp) {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    //Get date
    let date = new Date(timestamp * 1000);

    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let day = date.getDate();
    let formattedTime = day + ' ' + month + ' ' + year;
    return formattedTime;
}

//Comparisons function
function gameCompareRating(a, b) {
    return a.rating - b.rating;
}
function gameComparePopularity(a, b) {
    return a.popularity - b.popularity;
}
function gameCompareName(a, b) {
    return a.nameGame.localeCompare(b.nameGame);
};
function gameCompareReleaseOrdered(a, b) {
    let remainingDaysA = remainingTo(a.firstReleaseDate);
    let remainingDaysB = remainingTo(b.firstReleaseDate);

    return remainingDaysA - remainingDaysB;
};
function gameCompareReleaseDisordered(a, b) {
    let remainingDaysA = remainingTo(a.firstReleaseDate);
    let remainingDaysB = remainingTo(b.firstReleaseDate);

    return remainingDaysB - remainingDaysA;
};

//Call this to call an error out
function errorCallback(tx, err) {
    alert("Une erreur est survenue " + (err != undefined ? err.message : tx.message));

    console.log(err);
    console.log(tx);
    console.trace();
    return false;
}

