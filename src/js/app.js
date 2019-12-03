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
  id: 'cfpt.mrt.gamedb', // App bundle ID
  name: 'GameDB', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },

      // Demo games for followed section
      followedGames: [
        {
          id: '1',
          title: 'Apple iPhone 8',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        },
        {
          id: '2',
          title: 'Apple iPhone 8 Plus',
          description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
        },
        {
          id: '3',
          title: 'Apple iPhone X',
          description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
        },
      ],

      //Demo games for details
      games:[
        {id:1,
        }
      ],
      
      // Demo games for actual Section
      actualGames: [
        {
          id: '22',
          title: 'Jeu du kangourou',
          description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
        },
        {
          id: '2',
          title: 'Jeu du marsupial',
          description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
        },
        {
          id: '3',
          title: 'La chouette',
          img:'',
          description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
        },
      ]
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
    androidOverlaysWebView: false,
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
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGames (idGame INTEGER PRIMARY KEY, nameGame TEXT NOT NULL, summary TEXT NOT NULL, storyline TEXT,note DOUBLE,firstReleaseDate INTEGER);',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TFollowedGames (idFollowedGame INTEGER PRIMARY KEY)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGenres (idGenre INTEGER PRIMARY KEY,nameGenre TEXT NOT NULL)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TModes (idMode INTEGER PRIMARY KEY,nameMode TEXT NOT NULL)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TPlatforms (idPlatform INTEGER PRIMARY KEY, namePlatform TEXT NOT NULL)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TCompanies (idCompany INTEGER PRIMARY KEY, nameCompany TEXT NOT NULL)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TLastUpdated (idLastUpdate INTEGER PRIMARY KEY,tableName TEXT NOT NULL,lastUpdated INTEGER NOT NULL)',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameCompanies (idGame INTEGER,idCompany INTEGER,PRIMARY KEY(idGame,idCompany))',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameGenres (idGame INTEGER,idGenre INTEGER,PRIMARY KEY(idGame,idGenre))',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGamePlatforms (idGame INTEGER,idPlatforms INTEGER,PRIMARY KEY(idGame,idPlatforms))',null,null,errorCallback);
  tx.executeSql('CREATE TABLE IF NOT EXISTS TGameModes (idGameMode INTEGER,ids INTEGER,PRIMARY KEY(idGameMode,ids))',null,null,errorCallback);
});

function importGames(daysBeforeAfter = DAYS_ACTUAL_AFTER_BEFORE){
  
}

function errorCallback(err){
  alert("Une erreur est survenue : "+err);
}

