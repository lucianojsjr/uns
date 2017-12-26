angular
	.module('uns')
	.controller('RunController', RunController);

RunController.$inject = ['$scope', '$uibModalInstance', 'UNSService', 'network'];

function RunController($scope, $uibModalInstance, UNSService, network) {

	$scope.result;
	$scope.currentIndex = -1;
	$scope.settings = localStorage.settings;
	$scope.settings = $scope.settings ? JSON.parse($scope.settings) : [];

	let parametersValues = {};

	run = () => {
		let setting = $scope.settings[$scope.currentIndex];

		simulate(setting.url);
	};

	getParameters = (url) => {
		if (!url) {
			return;
		}

		$scope.loadingParameters = true;

		UNSService.getParameters(url).then(function (data) {
			if (!data || !Object.keys(data).length) {
				return;
			}

			$scope.parameters = data;
			$scope.loadingParameters = false;
		}, function (error) {
			$scope.parameters = null;
			$scope.loadingParameters = false;
		});
	};

	simulate = (url) => {
		$scope.isRunning = true;
		$scope.isFinished = false;

		UNSService.simulate(url, network, parametersValues).then(function (data) {
			$scope.result = data;

			$scope.isRunning = false;
			$scope.isFinished = true;
		}, function (error) {
			$scope.isRunning = false;
			$scope.isFinished = true;
		});
	};

	selectSetting = (index) => {
		let setting;

		$scope.currentIndex = index;
		setting = $scope.settings[$scope.currentIndex];

		getParameters(setting.parameters_url);
	};

	updateValue = (key, value) => {
		parametersValues[key] = value;
	};

	cancel = () => {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.run = run;
	$scope.cancel = cancel;
	$scope.selectSetting = selectSetting;
	$scope.updateValue = updateValue;
}
