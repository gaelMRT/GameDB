import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

const HOURS_BEFORE_CONNECTED_UPDATE = 1;
const DAYS_ACTUAL_AFTER_BEFORE = 30;
const IMG_URL = "https://images.igdb.com/igdb/image/upload/t_cover_big/:imgId.jpg";
const DAYS_TO_MS = 24*60*60*1000;


// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';
// Import Cordova APIs
import cordovaApp from './cordova-app.js';
// Import Routes
import routes from './routes.js';

var app = new Framework7({
  root: '#app', // App root element
  idGame: 'cfpt.mrt.gamedb', // App bundle idGame
  name: 'GameDB', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
      games:[
        {
          idGame: 1,
          nameGame: 'Jeu N°1',
          platforms: 'PC, PS4',
          genres:'Action, Adventure',
          release:'05-10-2019',
          rating:54.32,
          popularity:5,
          img:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lgd.jpg',
          summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.',
          storyline: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        }
      ],
      // Demo games for followed section
      followedGames: [1,22,3,6],

      
      // Demo games for actual Section
      actualGames: [22,2,3]
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  // App routes
  routes: routes,


  // Input settings
  input: {
    scrollIntoViewOnFocus: Framework7.device.cordova && !Framework7.device.electron,
    scrollIntoViewCentered: Framework7.device.cordova && !Framework7.device.electron,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidGameOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
  },
});

var db = openDatabase('mrtGameDB','1.0','mrtGameDB',12*1024*1024);

db.transaction(function (tx){
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGames (idGame INTEGER PRIMARY KEY,imgId TEXT, nameGame TEXT NOT NULL, summary TEXT NOT NULL, storyline TEXT, rating DOUBLE,popularity DOUBLE, firstReleaseDate INTEGER);', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TFollowedGames (idFollowedGame INTEGER PRIMARY KEY)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGenres (idGenre INTEGER PRIMARY KEY, nameGenre TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TModes (idMode INTEGER PRIMARY KEY, nameMode TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TPlatforms (idPlatform INTEGER PRIMARY KEY, namePlatform TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TCompanies (idCompany INTEGER PRIMARY KEY, nameCompany TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameCompanies (idGame INTEGER, idCompany INTEGER, PRIMARY KEY(idGame, idCompany))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameGenres (idGame INTEGER, idGenre INTEGER, PRIMARY KEY(idGame, idGenre))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGamePlatforms (idGame INTEGER, idPlatforms INTEGER, PRIMARY KEY(idGame, idPlatforms))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameModes (idGame INTEGER, idMode INTEGER, PRIMARY KEY(idGame, idMode))', null, null, errorCallback);

  tx.executeSql('CREATE TABLE IF NOT EXISTS TLastUpdated (idLastUpdate INTEGER PRIMARY KEY, tableName TEXT NOT NULL, lastUpdated INTEGER NOT NULL)', null, null, errorCallback);
},errorCallback);

db.transaction(function (tx) {
  tx.executeSql("SELECT * FROM TLastUpdated WHERE tableName == 'TGame';",null,function (tx,results) {
    if(results.rows.length == 0){
      populateDB(tx);
    }
  },errorCallback)
},errorCallback);

importGames();



//Populate de Database
function populateDB(tx){
  var myHeaders = new Headers();
  myHeaders.append('user-key','c364edc9293459fe126c3de23e9bf176');

  var myInits = {
    method: 'GET',
    headers : myHeaders,
    mode : 'no-cors',
    cache : 'default'
  } 

  //Récupère les bonnes dates
  var dBefore = Date.now() - DAYS_ACTUAL_AFTER_BEFORE * DAYS_TO_MS;
  var dAfter = Date.now() + DAYS_ACTUAL_AFTER_BEFORE*DAYS_TO_MS;

  var myRequest = new Request('https://api-v3.igdb.com/games/')
  
  //Récupère tous les jeux nécessaires
  var body = "fields cover.image_id,name,summary,storyline,rating,popularity,first_release_date,genres.name,platforms.abbreviation,game_modes.name,involved_companies.company.name; where (first_release_date > "+dBefore+" & first_release_date < "+dAfter+") ";
  app.data.followedGames.forEach(element => {
    body += "| id == "+element+" ";
  });
  myRequest.body = body

  //Récupère
  fetch(myRequest,myInits).then(function(resp){
    return JSON.parse(resp);
  }).then(function (response) {
    response.forEach(row => {
      var sql = "INSERT OR REPLACE FROM TGames (idGame,imgId,nameGame,rating,popularity,firstReleaseDate,summary,storyline) VALUES (:id,':imgId',':name',:rate,:pop,:rel,:sum,:sto);";

      sql = sql.replace(':id',row['id']);
      sql = sql.replace(':imgId',IMG_URL.replace(':imgId',row.cover.image_id));
      sql = sql.replace(':name',row['name']);
      sql = sql.replace(':rate',row['rating']);
      sql = sql.replace(':pop',row['popularity']);
      sql = sql.replace(':rel',row['first_release_date']);
      sql = sql.replace(':sum',row['summary']);
      sql = sql.replace(':sto',row['storyline']);

      tx.executeSql(sql,null,null,errorCallback);

      row['genres'].forEach(genr => {
        var sqlGenre = "INSERT OR REPLACE FROM TGenres (idGenre,nameGenre) VALUES (:id,':name');";

        sqlGenre = sqlGenre.replace(':id',genr['id']);
        sqlGenre = sqlGenre.replace(':id',genr['name']);

        tx.executeSql(sqlGenre,null,null,errorCallback);

        var linkGenre = "INSERT OR REPLACE FROM TGameGenres (idGame,idGenre) VALUES (:idGame,:idGenre);"

        linkGenre = linkGenre.replace(':idGame',row['id']);
        linkGenre = linkGenre.replace(':idGenre',genr['id']);

        tx.executeSql(linkGenre,null,null,errorCallback);
      });//end genre

      row['platforms'].forEach(plat => {
        var sqlPlatform = "INSERT OR REPLACE FROM TPlatforms (idPlatform,namePlatform) VALUES (:id,':name');";

        sqlPlatform = sqlPlatform.replace(':id',plat['id']);
        sqlPlatform = sqlPlatform.replace(':id',plat['name']);

        tx.executeSql(sqlPlatform,null,null,errorCallback);

        var linkPlatform = "INSERT OR REPLACE FROM TGamePlatforms (idGame,idPlatform) VALUES (:idGame,:idPlatform);"

        linkPlatform = linkPlatform.replace(':idGame',row['id']);
        linkPlatform = linkPlatform.replace(':idPlatform',plat['id']);

        tx.executeSql(linkPlatform,null,null,errorCallback);
      });//end platforms

      row['gameMode'].forEach(mode => {
        var sqlMode = "INSERT OR REPLACE FROM TModes (idMode,nameMode) VALUES (:id,':name');";

        sqlMode = sqlMode.replace(':id',mode['id']);
        sqlMode = sqlMode.replace(':id',mode['name']);

        tx.executeSql(sqlMode,null,null,errorCallback);

        var linkMode = "INSERT OR REPLACE FROM TGameModes (idGame,idMode) VALUES (:idGame,:idMode);"

        linkMode = linkMode.replace(':idGame',row['id']);
        linkMode = linkMode.replace(':idMode',mode['id']);

        tx.executeSql(linkMode,null,null,errorCallback);
      });//end gamemode

      row['involved_companies'].forEach(comp => {
        var sqlCompany = "INSERT OR REPLACE FROM TCompanies (idCompany,nameCompany) VALUES (:id,':name');";

        sqlCompany = sqlCompany.replace(':id',comp['id']);
        sqlCompany = sqlCompany.replace(':id',comp['name']);

        tx.executeSql(sqlCompany,null,null,errorCallback);

        var linkCompany = "INSERT OR REPLACE FROM TGameCompanies (idGame,idCompany) VALUES (:idGame,:idCompany);"

        linkCompany = linkCompany.replace(':idGame',row['id']);
        linkCompany = linkCompany.replace(':idCompany',comp['id']);

        tx.executeSql(linkCompany,null,null,errorCallback);
      });//end companies

    });
  });//end fetch

  var dt = Date.now();
  tx.executeSql('INSERT OR REPLACE FROM TLastUpdated (idLastUpdated,tableName,lastUpdated) VALUES (SELECT idLastUpdated FROM TLastUpdated WHERE tableName = "TGames","TGames",'+dt+' );',null,null,errorCallback);
}// end populateDB

//Import the games from the database
function importGames(daysBeforeAfter = DAYS_ACTUAL_AFTER_BEFORE){
  var games = [];
  db.transaction(function(tx){
    tx.executeSql('SELECT * FROM TGames WHERE '+
    '(firstReleaseDate > DATE("now","-'+daysBeforeAfter+'days") AND' +
    'firstReleaseDate < DATE("now","+'+daysBeforeAfter+'days")) OR '+
    '(idGame IN (SELECT idFollowedGame FROM TFollowedGames));'
    ,[],function(tx,results){
      for (let i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
        row.platforms = getPlatforms(tx,row.idGame);
        row.genres = getGenres(tx,row.idGame);
        row.companies = getCompanies(tx,row.idGame);
        row.modes = getModes(tx,row.idGame);
        games.push(row);
      }
    }
    ,errorCallback);
    console.log(games); //TODO - Remove debug
  },errorCallback);

}//end importGames

function returnList(tx,results){
  var list = [];
  for (let i = 0; i < results.rows.length; i++) {
    list.push(results.rows.item(i));
  }
  return list;
}
function listToStr(list,field){
  var str = "";
  list.forEach(el => {
    str += el[field]+',';
  });
  return str.substring(0,str.length - 1);
}

function getPlatforms(tx,idGame){
  var sql = "SELECT tp.namePlatform FROM TGamePlatforms AS tgp, TPlatforms AS tp WHERE tp.idPlatform == tgp.idPlatform AND tgp.idGame == "+idGame+";";
  var list = tx.executeSql(sql,[],returnList,errorCallback);
  return listToStr(list,'namePlatform');
}
function getModes(tx,idGame){
  var sql = "SELECT tp.nameMode FROM TGameModes AS tgm, TModes AS tp WHERE tp.idMode == tgm.idMode AND tgm.idGame == "+idGame+";";
  var list = tx.executeSql(sql,[],returnList,errorCallback);
  return listToStr(list,'nameMode');
}
function getCompanies(tx,idGame){
  var sql = "SELECT tp.nameCompany FROM TGameCompanies AS tgc, TCompanies AS tp WHERE tp.idCompany == tgc.idCompany AND tgc.idGame == "+idGame+";";
  var list = tx.executeSql(sql,[],returnList,errorCallback);
  return listToStr(list,'nameCompany');
}
function getGenres(tx,idGame){
  var sql = "SELECT tp.nameGenre FROM TGameGenres AS tgg, TGenres AS tp WHERE tp.idGenre == tgg.idGenre AND tgg.idGame == "+idGame+";";
  var list = tx.executeSql(sql,[],returnList,errorCallback);
  return listToStr(list,'nameGenre');
}

function errorCallback(err){
  console.log(err);
  alert("Une erreur est survenue : "+err.message);
  return false;
}

