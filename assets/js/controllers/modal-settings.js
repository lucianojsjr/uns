angular
	.module('uns')
	.controller('SettingsController', SettingsController);

SettingsController.$inject = ['$scope', '$uibModalInstance'];

function SettingsController($scope, $uibModalInstance) {

	let editIndex;

	$scope.settings = localStorage.settings;
	$scope.settings = $scope.settings ? JSON.parse($scope.settings) : [];

	add = () => {
		$scope.settings.push({
			name: $scope.name,
			url: $scope.url
		});

		$scope.name = '';
		$scope.url = '';
		localStorage.settings = JSON.stringify($scope.settings);
	};

	save = () => {
		$scope.settings[editIndex] = {
			name: $scope.name,
			url: $scope.url
		};

		$scope.name = '';
		$scope.url = '';
		$scope.isEdit = false;
		localStorage.settings = JSON.stringify($scope.settings);
	};

	remove = (index) => {
		$scope.settings.splice(index, 1);
		localStorage.settings = JSON.stringify($scope.settings);
	};

	edit = (index) => {
		editIndex = index;

		$scope.isEdit = true;
		$scope.name = $scope.settings[editIndex].name;
		$scope.url = $scope.settings[editIndex].url;
		localStorage.settings = JSON.stringify($scope.settings);
	};

	cancel = () => {
		localStorage.settings = JSON.stringify($scope.settings);
		$uibModalInstance.dismiss('cancel');
	};

	$scope.add = add;
	$scope.save = save;
	$scope.remove = remove;
	$scope.edit = edit;
	$scope.cancel = cancel;
}
