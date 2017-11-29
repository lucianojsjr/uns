angular
	.module('uns')
	.directive('onReadFile', readFile);

readFile.$inject = ['$parse'];

function readFile($parse) {
	return {
		restrict: 'A',
		scope: {
			onReadFile: "&"
		},
		link: (scope, element, attrs) => {
			element.on('change', (e) => {
				let reader = new FileReader();

				reader.onload = (e) => {
					scope.$apply(() => {
						scope.onReadFile({$content: e.target.result});
					});
				};
				reader.readAsText((e.srcElement || e.target).files[0]);
			});
		}
	};
}
