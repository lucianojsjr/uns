angular
    .module('uns')
    .directive('onReadFile', readFile);

readFile.$inject = ['$parse'];

function readFile($parse){
    return {
        restrict: 'A',
        scope: {
            onReadFile : "&"
        },
        link: function(scope, element, attrs) {
            element.on('change', function(e) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    scope.$apply(function() {
                        scope.onReadFile({$content:e.target.result});
                    });
                };
                reader.readAsText((e.srcElement || e.target).files[0]);
            });
        }
    };
}