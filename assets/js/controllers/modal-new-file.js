angular
	.module('uns')
	.controller('NewFileController', NewFileController);

NewFileController.$inject = ['$scope', '$uibModalInstance'];

function NewFileController($scope, $uibModalInstance) {

	add = () => {
		$uibModalInstance.close($scope.name);
	};

	cancel = () => {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.add = add;
	$scope.cancel = cancel;
}
