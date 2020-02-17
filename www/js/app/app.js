var app = new Framework7({
  // App root element
  root: '#app',
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
      }
    },
    {
      path: '/index.html',
      url: './home.html',
      on: {
        pageAfterIn: function (e, page) {
          GetHomeHTML();
        }
      }
    },
    {
      path: '/all/',
      url: './all.html',
      on: {
        pageAfterIn: function (e, page) {
          GetAllHTML();
        }
      }
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
        pageAfterIn: function (e, page) {
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
      path: '(.*)',
      component: './pages/404.f7.html',
      on: {
        pageAfterIn: function (e, page) {
          console.log(page);
        },
      }
    },
  ],
  // ... other parameters
});

var mainView = app.views.create('.view-main');

GetHomeHTML();