let unsModule = angular.module('uns', ['ui.router']);

config.$inject = ['$stateProvider', '$urlRouterProvider'];
unsModule.config(config);

function config($stateProvider, $urlRouterProvider) {
    $stateProvider.state('map', {
        url: '/map',
        views: {
            '': {
                templateUrl: './views/map.html',
                controller: 'MapController'
            }
        }
    });

    $urlRouterProvider.otherwise('/map');
}



