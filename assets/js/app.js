let unsModule = angular.module('uns', ['ui.router', 'ui.bootstrap']);

config.$inject = ['$stateProvider', '$urlRouterProvider'];
unsModule.config(config);

function config($stateProvider, $urlRouterProvider) {
	$stateProvider.state('home', {
		url: '/home',
		views: {
			'': {
				templateUrl: './views/home.html',
				controller: 'HomeController'
			}
		}
	});

	$urlRouterProvider.otherwise('/home');
}
