angular
    .module('uns')
    .controller('MapController', MapController);

MapController.$inject = ['$scope', 'Utils'];

function MapController($scope, Utils) {
    const mapElement = document.getElementById('map');

    $scope.map;

    function initMap() {
        $scope.map = new google.maps.Map(mapElement, {
            center: {
                lat: -8.05428,
                lng: -34.8813
            },
            zoom: 8
        });
    }

    initMap();
}