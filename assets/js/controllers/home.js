angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope'];

function HomeController($scope) {
	const mapElement = document.getElementById('map');
	const map = new google.maps.Map(mapElement, {
		center: {
			lat: -8.05428,
			lng: -34.8813
		},
		zoom: 6,
		disableDefaultUI: true
	});

	$('.button-collapse').sideNav({
		closeOnClick: true
	});

	$scope.showMenu = true;
	$scope.properties = {
		"Número de nós": 1,
		"Número de enlaces": 1,
		"$\overline{d}$": 1,
		"SD APL": 1,
		"$\overline{c},km$": 1,
		"Assortatividade": 1,
		"Densidade": 1,
		"Diâmetro  ísico": 1,
		"Densidade por distância física": 1,
		"Con. natural": 1,
		"Raio espectral": 1,
		"$CC$": 1,
		"$I(G)$": 1,
		"$\mathcal{I(F)}$": 1,
		"PTLE": 1,
		"diam($G$)": 1,
		"Con. algébrica	": 1,
		"$\overline{c}$": 1,
		"Closeness máximo": 1
	};
	$scope.files = [{
		name: 'Arquivo 1'
	}, {
		name: 'Arquivo 2'
	}];
};
