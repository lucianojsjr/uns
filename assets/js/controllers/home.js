angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', 'Utils'];

function HomeController($scope, Utils) {
	$scope.currentIndex;
	$scope.currentNetwork;
	$scope.files = [];
	$scope.openedFiles = [];
	$scope.options = {
		node: false,
		edge: false,
		running: false
	};

	init = () => {
		$('.button-collapse').sideNav({
			closeOnClick: true
		});
	};

	openFile = (index) => {
		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[index];

		$('.button-collapse').sideNav('hide');
	};

	closeFile = (index) => {
		$scope.openedFiles.splice(index, 1);

		$scope.currentIndex = $scope.openedFiles.length - 1;
		$scope.currentNetwork = $scope.files[$scope.currentIndex];
	};

	selectFile = (index) => {
		const fileIndex = $scope.openedFiles[index].file_index;

		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[fileIndex];
	};

	loadFile = (content) => {
		$scope.files.push({
			name: $('#file').prop('files')[0].name,
			network: Utils.parse(content)
		});

		$('#file').val('');
	};

	turnFeature = (feature) => {
		$scope.options[feature] = !$scope.options[feature];

		if (feature === 'node') {
			$scope.options['edge'] = false;
			return;
		}

		if (feature === 'edge') {
			$scope.options['node'] = false;
			return;
		}

		$scope.options[feature] = !$scope.options[feature];
	};

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

	init();
	$scope.openFile = openFile;
	$scope.closeFile = closeFile;
	$scope.selectFile = selectFile;
	$scope.loadFile = loadFile;
	$scope.turnFeature = turnFeature;
}
