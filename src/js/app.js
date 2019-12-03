import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

const HOURS_BEFORE_CONNECTED_UPDATE = 1;
const DAYS_ACTUAL_AFTER_BEFORE = 30;


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
        },
        {
          idGame: 2,
          nameGame: 'Jeu N°2',
          platforms: 'PC, PS4',
          genres:'Action, Adventure',
          release:'05-10-2019',
          rating:54.32,
          popularity:5,
          img:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lgd.jpg',
          summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.',
          storyline: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
         },
         {
           idGame: 3,
           nameGame: 'Jeu N°3',
           platforms: 'PC, PS4',
           genres:'Action, Adventure',
           release:'05-10-2019',
           rating:54.32,
           popularity:5,
           img:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lgd.jpg',
           summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.',
           storyline: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
         },
         {
           idGame: 6,
           nameGame: 'Jeu N°6',
           platforms: 'PC, PS4',
           genres:'Action, Adventure',
           release:'05-10-2019',
           rating:54.32,
           popularity:5,
           img:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lgd.jpg',
           summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.',
           storyline: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
         },
         {
           idGame: 22,
           nameGame: 'Jeu N°22',
           platforms: 'PC, PS4',
           genres:'Action, Adventure',
           release:'05-10-2019',
           rating:54.32,
           popularity:5,
           img:'https://images.igdb.com/igdb/image/upload/t_cover_big/co1lgd.jpg',
           summary: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.',
           storyline: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
         },
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
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGames (idGameGame INTEGER PRIMARY KEY, nameGame TEXT NOT NULL, summary TEXT NOT NULL, storyline TEXT, note DOUBLE, firstReleaseDate INTEGER);', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TFollowedGames (idGameFollowedGame INTEGER PRIMARY KEY)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGenres (idGameGenre INTEGER PRIMARY KEY, nameGenre TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TModes (idGameMode INTEGER PRIMARY KEY, nameMode TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TPlatforms (idGamePlatform INTEGER PRIMARY KEY, namePlatform TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TCompanies (idGameCompany INTEGER PRIMARY KEY, nameCompany TEXT NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TLastUpdated (idGameLastUpdate INTEGER PRIMARY KEY, tableName TEXT NOT NULL, lastUpdated INTEGER NOT NULL)', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameCompanies (idGameGame INTEGER, idGameCompany INTEGER, PRIMARY KEY(idGameGame, idGameCompany))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameGenres (idGameGame INTEGER, idGameGenre INTEGER, PRIMARY KEY(idGameGame, idGameGenre))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGamePlatforms (idGameGame INTEGER, idGamePlatforms INTEGER, PRIMARY KEY(idGameGame, idGamePlatforms))', null, null, errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameModes (idGameGameMode INTEGER, idGames INTEGER, PRIMARY KEY(idGameGameMode, idGames))', null, null, errorCallback);
});

function importGames(daysBeforeAfter = DAYS_ACTUAL_AFTER_BEFORE){
  
}

function errorCallback(err){
  alert("Une erreur est survenue : "+err);
}

