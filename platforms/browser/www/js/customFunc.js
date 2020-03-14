const NAME_LIMIT_CHARS = 20
const MAX_ICONS = 2;
const HOME_MAX_GAME_BY_ROW = 3

//Custom Func
function GetHomeHTML() {

    console.log("HTML");
    if (f7app.games == undefined || f7app.games == [] || f7app.games.length == 0) {
        console.log("GetGames");
        getAllGames();
        return;
    }
    let games = f7app.games;
    let actualCount = 0;
    let followCount = 0;
    let followed = '';
    let actual = '';

    //fill the followed and actual games
    for (let i = 0; i < games.length && (actualCount < HOME_MAX_GAME_BY_ROW || followCount < HOME_MAX_GAME_BY_ROW); i++) {
        const g = games[i];
        if (g.followed && followCount < HOME_MAX_GAME_BY_ROW) {
            followed += '<a href="/game/' + g.idGame + '/" class="block col-' + Math.floor(100 / HOME_MAX_GAME_BY_ROW) + ' gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy" /></a>';
            followCount++;
        }
        if (actualCount < HOME_MAX_GAME_BY_ROW) {
            actual += '<a href="/game/' + g.idGame + '/" class="block col-' + Math.floor(100 / HOME_MAX_GAME_BY_ROW) + ' gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy"/></a>';
            actualCount++;
        }
    }

    let followedGamesHTML = document.getElementsByClassName('followedGames');
    let actualGamesHTML = document.getElementsByClassName('actualGames');
    if (followedGamesHTML.length != 0) {
        followedGamesHTML[followedGamesHTML.length - 1].innerHTML = followed;
    }
    if (actualGamesHTML.length != 0) {
        actualGamesHTML[actualGamesHTML.length - 1].innerHTML = actual;
    }
    //#region Activate "See more" buttons
    let moreFollowed = document.getElementsByClassName('moreFollowed');
    let lastMoreFollowed = moreFollowed[moreFollowed.length - 1];
    if (lastMoreFollowed != undefined) {
        if (followCount < HOME_MAX_GAME_BY_ROW) {
            lastMoreFollowed.innerHTML = '';
        } else {
            lastMoreFollowed.innerHTML = '<a href="/followed/">See more ...</a>';
        }
    }
    let moreActual = document.getElementsByClassName('moreActual');
    let lastMoreActual = moreActual[moreActual.length - 1];
    if (lastMoreActual != undefined) {
        if (actualCount < HOME_MAX_GAME_BY_ROW) {
            lastMoreActual.innerHTML = '';
        } else {
            lastMoreActual.innerHTML = '<a href="/actual/">See more ...</a>';
        }
    }
    //#endregion

}//end GetHomeHTML

function GetSingleGame(id) {
    let g = null;
    if (f7app.games == undefined || f7app.games == [] || f7app.games.length == 0) {
        return;
    }
    for (let i = 0; i < f7app.games.length && g == null; i++) {
        let el = f7app.games[i];
        if (el.idGame == id) {
            g = el;
        }
    }
    //#region Set page values
    document.getElementById("img").innerHTML = '<img src="' + g.imgId + '" width="100%" class="lazy" />';
    document.getElementById("nameGame").innerText = decodeURI(g.nameGame);
    document.getElementById("nameGame2").innerText = decodeURI(g.nameGame);
    document.getElementById("summary").innerText = decodeURI(g.summary);
    document.getElementById("storyline").innerText = decodeURI(g.storyline);
    document.getElementById("ratings").innerText = g.rating;
    document.getElementById("followed").innerText = "star" + (g.followed ? "_fill" : "");
    document.getElementById("popularity").innerText = g.popularity.toFixed(2);
    document.getElementById("firstReleaseDate").innerText = timestampToStr(g.firstReleaseDate);

    getPlatforms(g, "platforms", false);
    getGenres(g, "genres", false);
    getCompanies(g, "companies", -1);
    getModes(g, "modes", -1);

    //#endregion


    //Set toggle of follow with current id
    document.getElementById("followed").onclick = function () {
        id = g.idGame;
        toggleFollowed(id, function (results) {
            g.followed = results;
            document.getElementById("followed").innerText = "star" + (g.followed ? "_fill" : "");
        });

    }
}//end GetSingleGame


//Get actual(defined in a range of DAYS_ACTUAL_AFTER_BEFORE) games and put them in html
function GetActualHTML() {
    let games = [];
    //Récupère les bonnes dates
    let dBefore = Math.round((Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
    let dAfter = Math.round((Date.now() + DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
    if (f7app.games == undefined || f7app.games == [] || f7app.games.length == 0) {
        return;
    }
    f7app.games.forEach(g => {
        if (g.firstReleaseDate < dAfter && g.firstReleaseDate > dBefore) {
            games.push(g);
        }
    });
    games.sort(gameCompareName);
    let allG = gamesArrayToTable(games, "actual");

    document.getElementById("actualGameTable").innerHTML = allG;
    for (let i = 0; i < games.length; i++) {
        let g = games[i];
        getGenres(games[i], 'actualGenresGame' + g.idGame);
        getPlatforms(games[i], "actualPlatformsGame" + g.idGame);
    }
}//end GetActualHTML


//Get followed games and put them in html
function GetFollowedHTML() {
    let games = [];
    if (f7app.games == undefined || f7app.games == [] || f7app.games.length == 0) {
        return;
    }
    f7app.games.forEach(g => {
        if (g.followed) {
            games.push(g);
        }
    });

    games.sort(gameCompareName);
    let allG = gamesArrayToTable(games, "followed");

    document.getElementById("followedGameTable").innerHTML = allG;
    for (let i = 0; i < games.length; i++) {
        let g = games[i];
        getGenres(g, 'followedGenresGame' + g.idGame);
        getPlatforms(g, "followedPlatformsGame" + g.idGame);
    }
}//end GetFollowedHTML


//Set game follow to true when false and inversly
function toggleFollowed(id, callback) {
    let result = false;
    let sql = 'UPDATE TGames SET followed = 0 WHERE idGame = ' + id + ' AND followed = 1;';
    db.transaction(function (tx) {
        tx.executeSql(sql, [], function (tx, results) {
            if (results.rowsAffected == 0) {
                let newSql = 'UPDATE TGames SET followed = 1 WHERE idGame = ' + id + ';';
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
    let allG = "<tr><th>Name</th><th>Gen.</th><th>Plat.</th></tr>";
    for (let i = 0; i < gameArray.length; i++) {

        let g = gameArray[i];
        let remainingDays = remainingTo(g.firstReleaseDate);
        allG += '<tr>';
        allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame), NAME_LIMIT_CHARS) + (remainingDays > 0 ? '[d-' + remainingDays + ']' : "") + '</a></td>';
        allG += '<td><a class="tableLink" id="' + prefix + 'GenresGame' + g.idGame + '" href="/game/' + g.idGame + '/"></a></td>';
        allG += '<td><a class="tableLink" id="' + prefix + 'PlatformsGame' + g.idGame + '" href="/game/' + g.idGame + '/"></a></td>';
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
function gameCompareId(a, b) {
    return a.idGame - b.idGame;
}
function gameCompareReleaseDisordered(a, b) {
    let remainingDaysA = remainingTo(a.firstReleaseDate);
    let remainingDaysB = remainingTo(b.firstReleaseDate);

    return remainingDaysB - remainingDaysA;
};

//TTags extract
function extractTags(tags, games) {
    let newGames = [];
    let i = 0;
    games.forEach(g => {
        //Skip useless tags
        while (tags[i] != undefined && tags[i].idGame < g.idGame) {
            i++;
        }
        while (tags[i] != undefined && tags[i].idGame == g.idGame) {
            if (g[tags[i].cdTag] == undefined) {
                g[tags[i].cdTag] = [];
            }
            g[tags[i].cdTag].push(tags[i].textTag);
            i++;
        }
        newGames.push(g);
    });
    return newGames;
}

//Call this to call an error out
function errorCallback(tx, err) {
    alert("Une erreur est survenue " + (err != undefined ? err.message : tx.message));

    console.log(err);
    console.log(tx);
    console.trace();
    return false;
}

//Extract datas from tags list

//Get string for platforms and put it in elementId of document
function getPlatforms(game, elementId, icons = true) {
    let platforms = ""
    let list = game['PLATFORMS'];
    if (list == undefined) {
        return;
    }
    if (icons) {
        for (let i = 0; i < list.length && i < MAX_ICONS; i++) {
            let result = list[i];
            platforms += '<img class="myIcon" src="./static/platforms/' + result + '.svg" alt="' + result + '"/>';
        }
        if (list.length > MAX_ICONS) {
            platforms += "...";
        }
    } else {
        platforms = listToStr(list);
    }
    document.getElementById(elementId).innerHTML = platforms;
}
//Get string for genres and put it in elementId of document
function getGenres(game, elementId, icons = true) {
    let genres = ""
    let list = game['GENRES'];
    if (list == undefined) {
        return;
    }
    if (icons) {
        for (let i = 0; i < list.length && i < MAX_ICONS; i++) {
            let result = list[i];
            genres += '<img class="myIcon" src="./static/genres/' + result + '.svg" alt="' + result + '"/>';
        }
        if (list.length > MAX_ICONS) {
            genres += "...";
        }
    } else {
        genres = listToStr(list);
    }
    document.getElementById(elementId).innerHTML = genres;
}

//Get string for modes and put it in elementId of document
function getModes(game, elementId, limit = 20) {
    let modes = ""
    modes = listToStr(game['GAME_MODES']);
    document.getElementById(elementId).innerHTML = limitNbChar(modes, limit);
}

//Get string for companies and put it in elementId of document
function getCompanies(game, elementId, limit = 20) {
    let companies = ""
    companies = listToStr(game['COMPANIES']);
    document.getElementById(elementId).innerHTML = limitNbChar(companies, limit);
}



function listToStr(list) {
    let str = "";
    if (list != undefined) {
        list.forEach(el => {
            str += decodeURI(el) + ',';
        });
        return str.substring(0, str.length - 1);
    } else {
        return str;
    }
}