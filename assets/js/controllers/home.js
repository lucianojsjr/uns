angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', '$uibModal', 'Utils', 'UNSService'];

function HomeController($scope, $uibModal, Utils, UNSService) {
	const buttonCollapse = $('.button-collapse');

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
		buttonCollapse.sideNav({
			closeOnClick: true
		});
	};

	openSettings = () => {
		const modalInstance = $uibModal.open({
			templateUrl: 'views/modal-settings.html',
			controller: 'SettingsController',
			size: 'lg'
		});
	};

	openRunModal = () => {
		let modalInstance;

		if (!$scope.currentNetwork) {
			Materialize.toast('É preciso selecionar uma rede para executar a simulação.', 4000, 'toast-danger');
			$scope.options['running'] = false;
			return;
		}
		modalInstance = $uibModal.open({
			templateUrl: 'views/modal-run.html',
			controller: 'RunController'
		});

		modalInstance.result.then(function () {
		}, function () {
			$scope.options['running'] = false;
		});
	};

	newFile = () => {
		const modalInstance = $uibModal.open({
			templateUrl: 'views/modal-new-file.html',
			controller: 'NewFileController'
		});

		modalInstance.result.then((data) => {
			data = data.replace(/ /g, '_');

			$scope.files.push({
				name: `${data}.gml`,
				network: {}
			});
		});
	};

	openFile = (index) => {
		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[index];
		$scope.gml = $scope.currentNetwork ? Utils.getGML($scope.currentNetwork.network) : '';

		buttonCollapse.sideNav('hide');
	};

	loadFile = (content) => {
		const file = $('#file');

		$scope.files.push({
			name: file.prop('files')[0].name,
			network: Utils.parse(content)
		});

		file.val('');
	};

	downloadFile = (index) => {
		const fileIndex = index || $scope.currentIndex;
		const file = $scope.files[fileIndex];
		const gml = Utils.getGML(file.network) || '';
		const link = document.createElement('a');
		const blob = new Blob([gml],
			{type: 'text/plain'});

		link.download = file.name;
		link.href = window.URL.createObjectURL(blob);
		link.onclick = (e) => {
			const that = this;

			setTimeout(() => {
				window.URL.revokeObjectURL(that.href);
			}, 1500);
		};

		link.click();
		link.remove();
	};

	exportMap = () => {
		let a = document.createElement('a');
		let network = $scope.currentNetwork ? $scope.currentNetwork.network : null;

		a.href = UNSService.getMapImageURL({
			map_type: $scope.map.getMapTypeId()
		}, network);
		a.download = "map.png";

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	turnFeature = (feature) => {
		if (!$scope.currentNetwork) {
			Materialize.toast('É preciso selecionar um arquivo para desenhar uma rede.', 3000, 'toast-danger');
			return;
		}

		$scope.options[feature] = !$scope.options[feature];

		if (feature === 'running') {
			$scope.options['edge'] = false;
			$scope.options['node'] = false;
			openRunModal();
			return;
		}

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

	init();
	$scope.newFile = newFile;
	$scope.openFile = openFile;
	$scope.loadFile = loadFile;
	$scope.downloadFile = downloadFile;
	$scope.exportMap = exportMap;
	$scope.turnFeature = turnFeature;
	$scope.openSettings = openSettings;
	$scope.openRunModal = openRunModal;
}
