angular
	.module('uns')
	.controller('SettingsController', SettingsController);

SettingsController.$inject = ['$scope', '$uibModalInstance'];

function SettingsController($scope, $uibModalInstance) {

	let editIndex;

	$scope.settings = localStorage.settings;
	$scope.settings = $scope.settings ? JSON.parse($scope.settings) : [];

	add = () => {
		if(!isValid()){
			return;
		}

		$scope.settings.push({
			name: $scope.name,
			url: $scope.url,
			parameters_url: $scope.parametersUrl
		});

		$scope.name = '';
		$scope.url = '';
		$scope.parametersUrl = '';
		localStorage.settings = JSON.stringify($scope.settings);
	};

	save = () => {
		if(!isValid()){
			return;
		}

		$scope.settings[editIndex] = {
			name: $scope.name,
			url: $scope.url,
			parameters_url: $scope.parametersUrl
		};

		$scope.name = '';
		$scope.url = '';
		$scope.parametersUrl = '';
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
		$scope.parametersUrl = $scope.settings[editIndex].parameters_url;
		localStorage.settings = JSON.stringify($scope.settings);
	};

	isValid = () => {
		if (!$scope.name) {
			Materialize.toast('É preciso informar o nome da configuração.', 4000, 'toast-danger');
			return false;
		}

		if (!$scope.url) {
			Materialize.toast('É preciso informar a url de simulação.', 4000, 'toast-danger');
			return false;
		}

		return true;
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
