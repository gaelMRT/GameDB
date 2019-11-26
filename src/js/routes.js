
import HomePage from '../pages/home.f7.html';
import NotFoundPage from '../pages/404.f7.html';

import ActualGames from '../pages/actual-games.f7.html';
import FollowedGames from '../pages/followed-games.f7.html';
import GameInfo from '../pages/game.f7.html';
import AllGames from '../pages/all-games.f7.html';
import SearchResults from '../pages/search-results.f7.html';
import Search from '../pages/search.f7.html';


var routes = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/actual-games/',
    component: ActualGames,
  },
  {
    path: '/all-games/',
    component: AllGames,
  },
  {
    path: '/followed-games/',
    component: FollowedGames,
  },
  {
    path: '/game/:id/',
    component: GameInfo,
  },
  {
    path: '/search/:search/',
    component: SearchResults,
  },
  {
    path: '/search/',
    component: Search,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;