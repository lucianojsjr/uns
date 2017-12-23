angular
	.module('uns')
	.controller('RunController', RunController);

RunController.$inject = ['$scope', '$uibModalInstance', 'UNSService'];

function RunController($scope, $uibModalInstance, UNSService) {

	$scope.result;
	$scope.currentIndex = -1;
	$scope.settings = localStorage.settings;
	$scope.settings = $scope.settings ? JSON.parse($scope.settings) : [];
	$scope.parameters = {
		parameter_1: 'int',
		parameter_2: 'string',
		parameter_3: 'double'
	};

	run = () => {
		let setting = $scope.settings[$scope.currentIndex];

		simulate(setting.url);
	};

	simulate = (url) => {
		$scope.isRunning = true;
		$scope.isFinished = false;

		UNSService.simulate(url).then(function (data) {
			$scope.result = data;

			$scope.isRunning = false;
			$scope.isFinished = true;
		}, function (error) {
			console.log(error);

			$scope.isRunning = false;
			$scope.isFinished = true;
		});
	};

	selectSetting = (index) => {
		$scope.currentIndex = index;
	};

	cancel = () => {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.run = run;
	$scope.cancel = cancel;
	$scope.selectSetting = selectSetting;
}
