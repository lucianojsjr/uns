angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', 'Utils'];

function HomeController($scope, Utils) {
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

	openFile = (index) => {
		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[index];

		buttonCollapse.sideNav('hide');
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
		const file = file;

		$scope.files.push({
			name: file.prop('files')[0].name,
			network: Utils.parse(content)
		});

		file.val('');
	};

	downloadFile = (index) => {
		const fileIndex = $scope.currentIndex || index;
		const file = $scope.files[fileIndex];
		const gml = Utils.getGML(file.network);
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

	init();
	$scope.openFile = openFile;
	$scope.closeFile = closeFile;
	$scope.selectFile = selectFile;
	$scope.loadFile = loadFile;
	$scope.downloadFile = downloadFile;
	$scope.turnFeature = turnFeature;
}
