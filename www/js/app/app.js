
var f7app = new Framework7({
    games: [],
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
                    if(f7app.games != []){
                        GetHomeHTML();
                    }
                },
                pageBeforeOut: function (e, page) {
                    lastPage = page.route.url;
                }
            },
            alias: ['/index.html']
        },
        {
            path: '/followed/',
            url: './followed.html',
            on: {
                pageAfterIn: function (e, page) {
                    if(f7app.games != []){
                        GetFollowedHTML();
                    }
                },
                pageBeforeOut: function (e, page) {
                    lastPage = page.route.url;
                }
            }
        },
        {
            path: '/actual/',
            url: './actual.html',
            on: {
                pageAfterIn: function (e, page) {
                    if(f7app.games != []){
                        GetActualHTML();
                    }
                },
                pageBeforeOut: function (e, page) {
                    lastPage = page.route.url;
                }
            }
        },
        {
            path: '/game/:id/',
            url: './game.html',
            on: {
                pageAfterIn: function (e, page) {
                    if(f7app.games != []){
                        GetActualHTML();
                    }
                    document.getElementById("backLink").href = lastPage;
                }
            }
        },
        {
            path: '/img/platforms/:name',
            url: './img/platforms/{{name}}',
            on: {
                beforeEnter: function (e, page) {
                    console.log("Img load");
                },
            }
        },
    ],
    // ... other parameters
});

mainView = f7app.views.create('.view-main');