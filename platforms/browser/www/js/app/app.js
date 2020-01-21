var app = new Framework7({
  // App root element
  root: '#app',
  // App Name
  name: 'GameDB',
  // App id
  id: 'net.gaelmrt.gamedb',
  // Add default routes
  // see https://blog.framework7.io/mastering-v2-router-958ea2dbd24f
  routes : [
    {
      path: '/',
      component: '../pages/home.f7.html',
      on: {
        pageAfterIn: function (e, page) {
          GetHomeHTML();
        }
      }  
    },
    {
      path: '/actual-games/',
      component: '../pages/actual-games.f7.html',
    },
    {
      path: '/all-games/',
      component: '../pages/all-games.f7.html',
    },
    {
      path: '/followed-games/',
      component: '../pages/followed-games.f7.html',
    },
    {
      path: '/game/:id/',
      component: '../pages/game.f7.html',
    },
    {
      path: '/search/:search/',
      component: '../pages/search-results.f7.html',
    },
    {
      path: '/search/',
      component: '../pages/search.f7.html',
    },
    {
      path: '(.*)',
      component: '../pages/404.f7.html',
    },
  ],
  // ... other parameters
});

var mainView = app.views.create('.view-main');