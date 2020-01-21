
const HOURS_BEFORE_CONNECTED_UPDATE = 1;
const DAYS_ACTUAL_AFTER_BEFORE = 1;
const IMG_URL = "https://images.igdb.com/igdb/image/upload/t_cover_big/:imgId.jpg";
const DEFAULT_IMG = "res/default-image.png";
const DAYS_TO_MS = 24 * 60 * 60 * 1000;
const NEEDED_FIELDS = "fields cover.image_id,name,summary,storyline,rating,popularity,first_release_date,genres.name,platforms.abbreviation,game_modes.name,involved_companies.company.name;";

var db = openDatabase('mrtGameDB', '1.0', 'mrtGameDB', 12 * 1024 * 1024);

function createDB() {
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS TGames;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TFollowedGames ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TGenres ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TModes ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TPlatforms ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TCompanies ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TGameCompanies;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TGameGenres ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TGamePlatforms ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TGameModes ;', null, null, errorCallback);
        tx.executeSql('DROP TABLE IF EXISTS TLastUpdated ;', null, null, errorCallback);


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
            /*
            //Récupère tous les jeux nécessaires
            var body = NEEDED_FIELDS + " where (first_release_date > " + dBefore + " & first_release_date < " + dAfter + ") ";
            if (app.data.followedGames.length > 0) {
              body += "| id = (" + app.data.followedGames[0];
              for (let i = 1; i < app.data.followedGames.length; i++) {
                body += "," + app.data.followedGames[i];
              }
              body += ")";
            }
            body += ";limit 100;";
          
          
            fetch('https://api-v3.igdb.com/games/', {
              method: "post",
              body: body,
              cache: 'default',
              headers: {
                "user-key": "c364edc9293459fe126c3de23e9bf176",
                "Content-Type": "application/json"
              }
            })*/

            var tst = "";
            if (app.data.followedGames.length > 0) {
                tst += "| id = (" + app.data.followedGames[0];
                for (let i = 1; i < app.data.followedGames.length; i++) {
                    tst += "," + app.data.followedGames[i];
                }
                tst += ")";
            }
            fetch('http://prox/public/?url=https://api-v3.igdb.com/games/&body=fields%20cover.image_id,name,summary,storyline,rating,popularity,first_release_date,genres.name,platforms.abbreviation,game_modes.name,involved_companies.company.name;%20where%20(first_release_date%20%3E%20' + dBefore + '%20%26%20first_release_date%20%3C%20' + dAfter + ')%20' + tst + ';limit%20100;', {
                method: "post"
            }).then(function (resp) {
                return resp.json();
            }).then(function (response) {
                db.transaction(function (tx) {
                    response.forEach(row => {
                        var sql = "INSERT OR REPLACE INTO TGames (idGame,imgId,nameGame,rating,popularity,firstReleaseDate,summary,storyline) VALUES (:id,\":imgId\",\":name\",:rate,:pop,:rel,\":sum\",\":sto\");";
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

                                    sqlPlatform = sqlPlatform.replace(':id', plat.id);
                                    sqlPlatform = sqlPlatform.replace(':name', encodeURI(plat.abbreviation.replace("'", "%27")));

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

//Import the games from the database
function importGames(daysBeforeAfter = DAYS_ACTUAL_AFTER_BEFORE) {
    var games = [];
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM TGames;'
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
        games.forEach(element => {
            app.data.actualGames.push(element.idGame);
            app.data.games.push(element);
        });

    });

}//end importGames

function getPlatforms(tx, idGame) {
    var sql = "SELECT tp.namePlatform FROM TGamePlatforms AS tgp, TPlatforms AS tp WHERE tp.idPlatform == tgp.idPlatform AND tgp.idGame == " + idGame + ";";
    var list = tx.executeSql(sql, [], returnList, errorCallback);
    return listToStr(list, 'namePlatform');
}
function getModes(tx, idGame) {
    var sql = "SELECT tp.nameMode FROM TGameModes AS tgm, TModes AS tp WHERE tp.idMode == tgm.idMode AND tgm.idGame == " + idGame + ";";
    var list = tx.executeSql(sql, [], returnList, errorCallback);
    return listToStr(list, 'nameMode');
}
function getCompanies(tx, idGame) {
    var sql = "SELECT tp.nameCompany FROM TGameCompanies AS tgc, TCompanies AS tp WHERE tp.idCompany == tgc.idCompany AND tgc.idGame == " + idGame + ";";
    var list = tx.executeSql(sql, [], returnList, errorCallback);
    return listToStr(list, 'nameCompany');
}
function getGenres(tx, idGame) {
    var sql = "SELECT tp.nameGenre FROM TGameGenres AS tgg, TGenres AS tp WHERE tp.idGenre == tgg.idGenre AND tgg.idGame == " + idGame + ";";
    var list = tx.executeSql(sql, [], returnList, errorCallback);
    return listToStr(list, 'nameGenre');
}

function returnList(tx, results) {
    var list = [];
    for (let i = 0; i < results.rows.length; i++) {
        list.push(results.rows.item(i));
    }
    return list;
}
function listToStr(list, field) {
    var str = "";
    if (list != undefined) {
        list.forEach(el => {
            str += el[field] + ',';
        });
        return str.substring(0, str.length - 1);
    } else {
        return str;
    }
}
