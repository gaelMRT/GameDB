
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
                followed += '<a href="/game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy" /></a>';
                followCount++;
            }
            if (actualCount < 3) {
                actual += '<a href="/game/' + g.idGame + '/" class="block col-33 gameCard"><div class="block block-header text-align-center">' + decodeURI(g.nameGame) + '</div><img src="' + g.imgId + '" width="100%" class="lazy"/></a>';
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
        document.getElementById("nameGame2").innerText = decodeURI(g.nameGame);
        document.getElementById("summary").innerText = decodeURI(g.summary);
        document.getElementById("storyline").innerText = decodeURI(g.storyline);
        document.getElementById("ratings").innerText = limitNbChar(g.rating,4);
        document.getElementById("followed").onclick = function(id){
            toggleFollowed(id);

            if(document.getElementById("followed").innerText == "star_fill"){
                document.getElementById("followed").innerText = "star"
            }else{
                document.getElementById("followed").innerText = "star_fill"
            }
        }
        getPlatforms(g,"platforms",false);
        getGenres(g,"genres",false);
        getCompanies(g,"companies",-1);
        getModes(g,"modes",-1);
        document.getElementById("popularity").innerText = decodeURI(g.popularity);
        document.getElementById("firstReleaseDate").innerText = timestampToStr(g.firstReleaseDate);
    });
}


function toggleFollowed(id){

    return true;
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
        var allG = gamesArrayToTable(games,"all");

        document.getElementById('allGameTable').innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            var g = games[i];
            getGenres(games[i],"allGenresGame"+g.idGame);
            getPlatforms(games[i],"allPlatformsGame"+g.idGame);
        }
    });
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
        var allG = gamesArrayToTable(games,"actual");

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
        var allG = gamesArrayToTable(games,"followed");
        document.getElementById("followedGameTable").innerHTML = allG;
        for (let i = 0; i < games.length; i++) {
            let g = games[i];
            getGenres(g,'followedGenresGame'+g.idGame);
            getPlatforms(g,"followedPlatformsGame"+g.idGame);
        }
    });
}
function gamesArrayToTable(gameArray,prefix){
    let allG = "<tr><th>Name</th><th>Gen.</th><th>Pla.</th><th>Out in</th></tr>";
    for (let i = 0; i < gameArray.length; i++) {

        let g = gameArray[i];
        allG += '<tr>';
        allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + limitNbChar(decodeURI(g.nameGame),NAME_LIMIT_CHARS) + '</a></td>';
        let remainingDays = remainingTo(g.firstReleaseDate);
        allG += '<td><a class="tableLink" id="'+prefix+'GenresGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
        allG += '<td><a class="tableLink" id="'+prefix+'PlatformsGame'+g.idGame+'" href="/game/' + g.idGame + '/"></a></td>';
        allG += '<td><a class="tableLink" href="/game/' + g.idGame + '/">' + (remainingDays > 0?remainingDays+" days":"") + '</a></td>';
        allG += '</tr>'

    }
    return allG;
}
function remainingTo(timestamp){
    //Convert ms timestamp to sec timestamp
    let dNow = Math.round((Date.now()) / 1000);

    let diff = timestamp - dNow;
    //sec to day
    let daysDiff = diff / 86400
    return Math.round(daysDiff)
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
