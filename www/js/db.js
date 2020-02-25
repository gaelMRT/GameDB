
const HOURS_BEFORE_CONNECTED_UPDATE = 1;
const DAYS_ACTUAL_AFTER_BEFORE = 7;
const IMG_URL = "https://images.igdb.com/igdb/image/upload/t_cover_big/:imgId.jpg";
const DEFAULT_IMG = "res/default-image.png";
const DAYS_TO_MS = 24 * 60 * 60 * 1000;
const NEEDED_FIELDS = "fields cover.image_id,name,summary,storyline,rating,popularity,first_release_date,genres.name,platforms.abbreviation,platforms.alternative_name,game_modes.name,involved_companies.company.name;";
const MAX_ICONS = 2;

var db = openDatabase('mrtGameDB', '1.0', 'mrtGameDB', 12 * 1024 * 1024);
createDB();
populateDB();

function createDB() {
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGames (idGame INTEGER PRIMARY KEY,imgId TEXT, nameGame TEXT NOT NULL, summary TEXT NOT NULL, storyline TEXT, rating DOUBLE,popularity DOUBLE, firstReleaseDate INTEGER);', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TFollowedGames (idFollowedGame INTEGER PRIMARY KEY)', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGenres (idGenre INTEGER PRIMARY KEY, nameGenre TEXT NOT NULL)', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TModes (idMode INTEGER PRIMARY KEY, nameMode TEXT NOT NULL)', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TPlatforms (idPlatform INTEGER PRIMARY KEY, namePlatform TEXT NOT NULL)', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TCompanies (idCompany INTEGER PRIMARY KEY, nameCompany TEXT NOT NULL)', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGameCompanies (idGame INTEGER, idCompany INTEGER, PRIMARY KEY(idGame, idCompany))', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGameGenres (idGame INTEGER, idGenre INTEGER, PRIMARY KEY(idGame, idGenre))', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGamePlatforms (idGame INTEGER, idPlatform INTEGER, PRIMARY KEY(idGame, idPlatform))', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TGameModes (idGame INTEGER, idMode INTEGER, PRIMARY KEY(idGame, idMode))', null, null, errorCallback);

        tx.executeSql('CREATE TABLE IF NOT EXISTS TLastUpdated (idLastUpdated INTEGER PRIMARY KEY, tableName TEXT NOT NULL, lastUpdated INTEGER NOT NULL)', null, null, errorCallback);
    }, errorCallback);//en db transaction
}

function populateDB() {
    var needPopulate = false;
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM TLastUpdated WHERE tableName == 'TGame';", null, function (tx, results) {
            if (results.rows.length == 0) {
                needPopulate = true;
            }
        }, errorCallback)
    }, errorCallback, function () {
        if (needPopulate) {

            //Récupère les bonnes dates
            var dBefore = Math.round((Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
            var dAfter = Math.round((Date.now() + DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);

            //Récupère

            //Récupère tous les jeux nécessaires

            var body = NEEDED_FIELDS + " where (first_release_date > " + dBefore + " & first_release_date < " + dAfter + ") ";
            if (app.data != undefined && app.data.followedGames != undefined && app.data.followedGames.length > 0) {
                body += "| id = (" + app.data.followedGames[0];
                for (let i = 1; i < app.data.followedGames.length; i++) {
                    body += "," + app.data.followedGames[i];
                }
                body += ")";
            }
            body += ";limit 500;";


            var sendUrl = 'https://api-v3.igdb.com/games/';
            /*fetch(sendUrl, {
              method: "post",
              body: body,
              cache: 'default',
              headers: {
                "user-key": "c364edc9293459fe126c3de23e9bf176",
                "Content-Type": "application/json"
              }
            })*/
            
            var url = 'http://prox/public/?url=' + sendUrl + '&body=' + encodeURI(body).replace(/&/g, '%26');


            fetch(url, {
                method: "post"
            }).then(function (resp) {
                return resp.json()
            }).then(function (response) {
                db.transaction(function (tx) {
                    response.forEach(row => {
                        let sql = "INSERT OR REPLACE INTO TGames (idGame,imgId,nameGame,rating,popularity,firstReleaseDate,summary,storyline) VALUES (:id,\":imgId\",\":name\",:rate,:pop,:rel,\":sum\",\":sto\");";
                        sql = sql.replace(':id', row.id);
                        if (row.cover != undefined) {
                            sql = sql.replace(':imgId', IMG_URL.replace(':imgId', row.cover.image_id));
                        } else {
                            sql = sql.replace(':imgId', DEFAULT_IMG);
                        }
                        sql = sql.replace(':name', encodeURI(row.name));
                        sql = sql.replace(':rate', (row.rating == undefined ? 0 : row.rating));
                        sql = sql.replace(':pop', (row.popularity == undefined ? 0 : row.popularity));
                        sql = sql.replace(':rel', (row.first_release_date == undefined ? 0 : row.first_release_date));
                        sql = sql.replace(':sum', encodeURI(row.summary == undefined ? "" : row.summary));
                        sql = sql.replace(':sto', encodeURI(row.storyline == undefined ? "" : row.storyline));


                        tx.executeSql(sql, null, function (tx, results) {
                            if (row.genres != undefined)
                                row.genres.forEach(genr => {
                                    var sqlGenre = "INSERT OR REPLACE INTO TGenres (idGenre,nameGenre) VALUES (:id,':name');";

                                    sqlGenre = sqlGenre.replace(':id', genr.id);
                                    sqlGenre = sqlGenre.replace(':name', encodeURI(genr.name).replace("'", "%27"));

                                    tx.executeSql(sqlGenre, null, function (tx) {
                                        var linkGenre = "INSERT OR REPLACE INTO TGameGenres (idGame,idGenre) VALUES (:idGame,:idGenre);"

                                        linkGenre = linkGenre.replace(':idGame', row.id);
                                        linkGenre = linkGenre.replace(':idGenre', genr.id);

                                        tx.executeSql(linkGenre, null, null, errorCallback);
                                    }, errorCallback);

                                });//end genre

                            if (row.platforms != undefined)
                                row.platforms.forEach(plat => {
                                    var sqlPlatform = "INSERT OR REPLACE INTO TPlatforms (idPlatform,namePlatform) VALUES (:id,':name');";
                                    var platName = (plat.abbreviation == undefined ? plat.alternative_name : plat.abbreviation);
                                    sqlPlatform = sqlPlatform.replace(':id', plat.id);
                                    sqlPlatform = sqlPlatform.replace(':name', encodeURI(platName.replace("\'\g", "%27")));

                                    tx.executeSql(sqlPlatform, null, null, errorCallback);

                                    var linkPlatform = "INSERT OR REPLACE INTO TGamePlatforms (idGame,idPlatform) VALUES (:idGame,:idPlatform);"

                                    linkPlatform = linkPlatform.replace(':idGame', row.id);
                                    linkPlatform = linkPlatform.replace(':idPlatform', plat.id);

                                    tx.executeSql(linkPlatform, null, null, errorCallback);
                                });//end platforms

                            if (row.game_modes != undefined) {
                                row.game_modes.forEach(mode => {
                                    var sqlMode = "INSERT OR REPLACE INTO TModes (idMode,nameMode) VALUES (:id,':name');";

                                    sqlMode = sqlMode.replace(':id', mode.id);
                                    sqlMode = sqlMode.replace(':name', encodeURI(mode.name.replace("'", "%27")));

                                    tx.executeSql(sqlMode, null, null, errorCallback);

                                    var linkMode = "INSERT OR REPLACE INTO TGameModes (idGame,idMode) VALUES (:idGame,:idMode);"

                                    linkMode = linkMode.replace(':idGame', row.id);
                                    linkMode = linkMode.replace(':idMode', mode.id);

                                    tx.executeSql(linkMode, null, null, errorCallback);
                                });
                            }//end gamemode

                            if (row.involved_companies != undefined) {
                                row.involved_companies.forEach(invol => {
                                    if (invol.company != undefined) {
                                        {
                                            var comp = invol.company;
                                            var sqlCompany = "INSERT OR REPLACE INTO TCompanies (idCompany,nameCompany) VALUES (:id,':name');";

                                            sqlCompany = sqlCompany.replace(':id', comp.id);
                                            sqlCompany = sqlCompany.replace(':name', encodeURI(comp.name.replace("'", "%27")));

                                            tx.executeSql(sqlCompany, null, null, errorCallback);


                                            var linkCompany = "INSERT OR REPLACE INTO TGameCompanies (idGame,idCompany) VALUES (:idGame,:idCompany);"

                                            linkCompany = linkCompany.replace(':idGame', row.id);
                                            linkCompany = linkCompany.replace(':idCompany', comp.id);

                                            tx.executeSql(linkCompany, null, null, errorCallback);
                                        }
                                    }
                                });
                            }//end companies

                        }, errorCallback); //end execute

                        var dt = Date.now();
                        tx.executeSql('INSERT OR REPLACE INTO TLastUpdated (idLastUpdated,tableName,lastUpdated) VALUES (1,"TGames",' + dt + ' );', null, null, errorCallback);
                    });//end foreach
                }, errorCallback);//end dbtransaction
            });//end fetch
        }
    });
}

//Get string for platforms and put it in elementId of document
function getPlatforms(game, elementId,icons = true) {
    var platforms = ""
    db.transaction(function (tx) {
        var sql = "SELECT tp.namePlatform as name FROM TGamePlatforms AS tgp, TPlatforms AS tp WHERE tp.idPlatform == tgp.idPlatform AND tgp.idGame == " + game.idGame + ";";
        
        tx.executeSql(sql, [], function (tx, results) {
            let list = returnList(results);
            if(icons){
                for (let i = 0; i < list.length && i < MAX_ICONS; i++) {
                    let result = decodeURI(list[i]);
                    platforms += '<img class="myIcon" src="./static/platforms/'+result+'.svg" alt="'+result+'"/>';   
                }
                if(list.length > MAX_ICONS){
                    platforms+= "...";
                }
            }else{
                platforms = listToStr(list);
            }
        }, errorCallback);

    }, errorCallback, function () {
        document.getElementById(elementId).innerHTML = platforms;
    });
}
//Get string for genres and put it in elementId of document
function getGenres(game, elementId,icons = true) {
    var genres = ""
    db.transaction(function (tx) {
        var sql = "SELECT tp.nameGenre as name FROM TGameGenres AS tgg, TGenres AS tp WHERE tp.idGenre == tgg.idGenre AND tgg.idGame == " + game.idGame + ";";
        tx.executeSql(sql, [], function (tx, results) {
            let list = returnList(results);
            if(icons){
                for (let i = 0; i < list.length && i < MAX_ICONS; i++) {
                    let result = decodeURI(list[i]);
                    genres += '<img class="myIcon" src="./static/genres/'+result+'.svg" alt="'+result+'"/>';
                    console.log(list[i]);
                }
                if(list.length > MAX_ICONS){
                    genres+= "...";
                }
            }else{
                genres = listToStr(list);
            }
        }, errorCallback);
    }, errorCallback, function () {
        document.getElementById(elementId).innerHTML = genres;
    });
}

//Get string for modes and put it in elementId of document
function getModes(game, elementId,limit= 20) {
    var modes = ""
    db.transaction(function (tx) {
        var sql = "SELECT tp.nameMode as name FROM TGameModes AS tgm, TModes AS tp WHERE tp.idMode == tgm.idMode AND tgm.idGame == " + game.idGame + ";";
        tx.executeSql(sql, [], function (tx, results) {
            modes = returnList(results);
        }, errorCallback);
    }, errorCallback, function () {
        document.getElementById(elementId).innerHTML = limitNbChar(modes,limit);
    });
}

//Get string for companies and put it in elementId of document
function getCompanies(game, elementId,limit=20) {
    var companies = ""
    db.transaction(function (tx) {
        var sql = "SELECT tp.nameCompany as name FROM TGameCompanies AS tgc, TCompanies AS tp WHERE tp.idCompany == tgc.idCompany AND tgc.idGame == " + game.idGame + ";";
        tx.executeSql(sql, [], function (tx, results) {
            companies = returnList(results);
        }, errorCallback);
    }, errorCallback, function () {
        document.getElementById(elementId).innerHTML = limitNbChar(companies,limit);
    });
}


function returnList(results) {
    var list = [];
    for (let i = 0; i < results.rows.length; i++) {
        list.push(decodeURI(results.rows.item(i).name));
    }
    return list;
}

function listToStr(list) {
    var str = "";
    if (list != undefined) {
        list.forEach(el => {
            str += el + ',';
        });
        return str.substring(0, str.length - 1);
    } else {
        return str;
    }
}

function fileExists(fileUrl){
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', fileUrl, false);
    xhr.send();
     
    if (xhr.status == "404") {
        return false;
    } else {
        return true;
    }
}