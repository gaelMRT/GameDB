var f7app = new Framework7({
  // App root element
  root: '#f7app',
  // App Name
  name: 'GameDB',
  // App id
  id: 'net.gaelmrt.gamedb',
  // Add default routes
  // see https://blog.framework7.io/mastering-v2-router-958ea2dbd24f
  routes: [
    {
      path: '/',
      url: './home.html',
      on: {
        pageAfterIn: function (e, page) {
          GetHomeHTML();
        }
      },
      alias: ['/index.html']
    },
    {
      path: '/followed/',
      url: './followed.html',
      on: {
        pageAfterIn: function (e, page) {
          GetFollowedHTML();
        }
      }
    },
    {
      path: '/actual/',
      url: './actual.html',
      on: {
        pageBeforeIn: function (e, page) {
          GetActualHTML();
        }
      }
    },
    {
      path: '/game/:id/',
      url: './game.html',
      on: {
        pageAfterIn: function (e, page) {
          GetSingleGame(page.route.params.id);
        }
      }
    },
    {
      path: '/img/platforms/:name',
      url: './img/platforms/{{name}}',
      on: {
        beforeEnter: function(e,page){
          console.log("Img load");
        },
      }
    },
  ],
  // ... other parameters
});

var mainView = f7app.views.create('.view-main');

GetHomeHTML();