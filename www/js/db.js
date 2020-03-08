
const HOURS_BEFORE_CONNECTED_UPDATE = 12;
const DAYS_ACTUAL_AFTER_BEFORE = 7;
const IMG_URL = "https://images.igdb.com/igdb/image/upload/t_cover_big/:imgId.jpg";
const DEFAULT_IMG = "res/default-image.png";
const HOURS_TO_MS = 60 * 60 * 1000;
const DAYS_TO_MS = 24 * HOURS_TO_MS;
const NEEDED_FIELDS = "fields cover.image_id,name,summary,storyline,rating,popularity,first_release_date,genres.name,platforms.abbreviation,platforms.alternative_name,game_modes.name,involved_companies.company.name;";

var db = openDatabase('mrtGameDB', '1.0', 'mrtGameDB', 12 * 1024 * 1024);


function createDB() {
    db.transaction(function (tx) {

        tx.executeSql('CREATE TABLE IF NOT EXISTS TGames (idGame INTEGER PRIMARY KEY,imgId TEXT, nameGame TEXT NOT NULL, summary TEXT NOT NULL, storyline TEXT, rating DOUBLE,popularity DOUBLE, firstReleaseDate INTEGER,followed TINYINT(1) );', null, null, errorCallback);
        tx.executeSql('CREATE TABLE IF NOT EXISTS TTags (cdTag VARCHAR(10),textTag VARCHAR(100),idGame INTEGER,PRIMARY KEY(cdTag,textTag,idGame))', null, null, errorCallback);

        tx.executeSql('CREATE TABLE IF NOT EXISTS TLastUpdated (idLastUpdated INTEGER PRIMARY KEY, tableName TEXT NOT NULL, lastUpdated INTEGER NOT NULL)', null, null, errorCallback);
    }, errorCallback);//end db transaction
}

function populateDB() {
    let needPopulate = false;
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM TLastUpdated WHERE tableName == 'TGames';", null, function (tx, results) {
            console.log(results);
            if (results.rows.length == 0) {
                needPopulate = true;
                console.log("Update because no games");
            } else {
                let lastUpdate;
                lastUpdate = results.rows.item(0);
                if (Date.now() - lastUpdate.lastUpdated >= HOURS_BEFORE_CONNECTED_UPDATE * HOURS_TO_MS) {
                    needPopulate = true;
                    console.log("Update because time");
                }
            }
        }, errorCallback)
    }, errorCallback, function () {
        if (needPopulate) {

            //Récupère les bonnes dates
            let dBefore = Math.round((Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);
            let dAfter = Math.round((Date.now() + DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS) / 1000);


            //Définit le body de la requête
            let body = NEEDED_FIELDS + " where (first_release_date > " + dBefore + " & first_release_date < " + dAfter + ") ";
            if (app.data != undefined && app.data.followedGames != undefined && app.data.followedGames.length > 0) {
                body += "| id = (" + app.data.followedGames[0];
                for (let i = 1; i < app.data.followedGames.length; i++) {
                    body += "," + app.data.followedGames[i];
                }
                body += ")";
            }
            body += ";limit 500;";

            //Définit l'url à acceder
            let sendUrl = 'https://api-v3.igdb.com/games/';

            //Fait des modifications afin que l'application marche sur navigateur
            if (device.platform == "browser") {
                let url = 'http://prox/public/?url=' + sendUrl + '&body=' + encodeURI(body).replace(/&/g, '%26');

                fetch(url, {
                    method: "post"
                }).then(function (resp) {
                    return resp.json()
                }).then(insertResp);//end fetch
            } else {

                fetch(sendUrl, {
                    method: "post",
                    body: body,
                    cache: 'default',
                    headers: {
                        "user-key": "c364edc9293459fe126c3de23e9bf176",
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                }).then(function (resp) {
                    return resp.json()
                }).then(insertResp);//end fetch
            }
        }
    });
}

//Insère toutes les réponses dans la base de donnée
function insertResp(response) {
    db.transaction(function (tx) {
        let sqlTags = "INSERT OR IGNORE INTO TTags (cdTag,textTag,idGame) VALUES ";
        let sqlGames = "INSERT OR REPLACE INTO TGames (idGame,imgId,nameGame,rating,popularity,firstReleaseDate,summary,storyline,followed) VALUES ";

        let dt = Date.now();
        let sqlUpdated = 'INSERT OR REPLACE INTO TLastUpdated (idLastUpdated,tableName,lastUpdated) VALUES (1,"TGames",' + dt + ' );';

        //extrait chaque element du json de réponse et remplit la database
        response.forEach(row => {
            //Inclut les Données du jeu
            let sql = "(:id,\":imgId\",\":name\",:rate,:pop,:rel,\":sum\",\":sto\",0),";
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

            sqlGames += sql;
            //Inclut les genres
            if (row.genres != undefined) {
                let sqlType = "('GENRES',':name',:idGame),";
                row.genres.forEach(genr => {
                    let sqlSingle = sqlType;
                    sqlSingle = sqlSingle.replace(':idGame', row.id);
                    sqlSingle = sqlSingle.replace(':name', encodeURI(genr.name).replace("'", "%27"));
                    sqlTags += sqlSingle;
                });//end genre
            }
            //Inclut les plateformes
            if (row.platforms != undefined) {
                let sqlType = "('PLATFORMS',':name',:idGame),";
                row.platforms.forEach(plat => {
                    let sqlSingle = sqlType;
                    sqlSingle = sqlSingle.replace(':idGame', row.id);
                    sqlSingle = sqlSingle.replace(':name', encodeURI(plat.abbreviation).replace("'", "%27"));
                    sqlTags += sqlSingle;
                });//end platforms
            }
            //Inclut les modes de jeu
            if (row.game_modes != undefined) {
                let sqlType = "('GAME_MODES',':name',:idGame),";
                row.game_modes.forEach(mode => {
                    let sqlSingle = sqlType;
                    sqlSingle = sqlSingle.replace(':idGame', row.id);
                    sqlSingle = sqlSingle.replace(':name', encodeURI(mode.name).replace("'", "%27"));
                    sqlTags += sqlSingle;
                });//end gameModes
            }
            //Inclut les companies investies dans le jeu
            if (row.involved_companies != undefined) {
                let sqlType = "('COMPANIES',':name',:idGame),";
                row.involved_companies.forEach(comp => {
                    let sqlSingle = sqlType;
                    sqlSingle = sqlSingle.replace(':idGame', row.id);
                    sqlSingle = sqlSingle.replace(':name', encodeURI(comp.company.name).replace("'", "%27"));
                    sqlTags += sqlSingle;
                });//end companies
            }

        });//end foreach

        sqlGames = sqlGames.slice(0, -1) + ';';
        sqlTags = sqlTags.slice(0, -1) + ';';

        //Lance la requête
        tx.executeSql(sqlGames, null, null, errorCallback);
        tx.executeSql(sqlTags, null, null, errorCallback);
        //Met à jour la date de dernière mise à jour
        tx.executeSql(sqlUpdated, null, null, errorCallback);

        GetHomeHTML();
    }, errorCallback);//end dbtransaction
}

//get All games
function getAllGames() {
    let sql = "SELECT * FROM TGames ORDER BY idGame ASC;";
    db.transaction(function (tx) {
        tx.executeSql(sql, [], function (tx, results) {
            getTags(tx, function (tags) {
                let games = [];
                for (let i = 0; i < results.rows.length; i++) {
                    games.push(results.rows.item(i));
                }
                f7app.games = extractTags(tags, games);
            });
        }, errorCallback);
    }, errorCallback);
}


//Get string for platforms and put it in elementId of document
function getTags(tx, callback) {
    let sql = "SELECT * FROM TTags ORDER BY idGame ASC;";
    tx.executeSql(sql, [], function (tx, results) {
        let resultList = [];
        for (let i = 0; i < results.rows.length; i++) {
            resultList.push(results.rows.item(i));
        }
        callback(resultList);
    }, errorCallback);


}
//Get string for platforms and put it in elementId of document
function getSingleGameTags(tx, id, callback) {
    let sql = "SELECT * FROM TTags WHERE idGame = " + id + ";";
    tx.executeSql(sql, [], function (tx, results) {
        let resultList = [];
        for (let i = 0; i < results.rows.length; i++) {
            resultList.push(results.rows.item(i));
        }
        console.log(results);
        callback(resultList);
    }, errorCallback);
}


