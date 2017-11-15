angular
    .module('uns')
    .controller('MapController', MapController);

MapController.$inject = ['$scope', 'Utils'];

function MapController($scope, Utils) {
    const mapElement = document.getElementById('map');
    const markerIcon = {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4,
        strokeColor: '#000000',
        fillColor: 'orange',
        fillOpacity: 1,
    };

    $scope.map;
    $scope.network;

    function initMap() {
        $scope.map = new google.maps.Map(mapElement, {
            center: {
                lat: -8.05428,
                lng: -34.8813
            },
            zoom: 6,
            disableDefaultUI: true
        });
    }

    function changeMapType(type) {
        $scope.map.setMapTypeId(type);
    }

    function loadContent(content) {
        $scope.network = Utils.parse(content);

        renderNetwork();
    }

    function renderNetwork() {
        renderNodes();
        renderEdges();
    }

    function renderNodes() {
        let marker;

        $scope.network.nodes.forEach((node, index) => {
            $scope.map.setCenter({
                lat: node.Latitude,
                lng: node.Longitude
            });

            marker = new google.maps.Marker({
                position: {
                    lat: node.Latitude,
                    lng: node.Longitude
                },
                icon: markerIcon,
                draggable: true,
                map: $scope.map
            });

            bindDrag(marker, index);
        });
    }

    function renderEdges() {
        let edge;

        $scope.network.edges.forEach((edge, index) => {
            let source;
            let target;

            source = findNode(edge.source, $scope.network.nodes);
            target = findNode(edge.target, $scope.network.nodes);

            edge = new google.maps.Polyline({
                path: [
                    new google.maps.LatLng(source.Latitude, source.Longitude),
                    new google.maps.LatLng(target.Latitude, target.Longitude)
                ],
                strokeColor: "#000000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: $scope.map
            });

            source.edges_source.push(edge);
            target.edges_target.push(edge);
        });
    }

    function bindDrag(marker, index) {
        google.maps.event.addListener(marker, 'drag', (evt) => {
            const newLatLng = {
                lat: evt.latLng.lat(),
                lng: evt.latLng.lng()
            };

            $scope.network.nodes[index].Latitude = newLatLng.lat;
            $scope.network.nodes[index].Longitude = newLatLng.lng;

            updateEdgesPosition(index, newLatLng);
        });
    }

    function updateEdgesPosition(index, position) {
        if ($scope.network.nodes[index].edges_source) {
            $scope.network.nodes[index].edges_source.forEach((edge) => {
                let targetPoint = edge.getPath().getArray()[1];

                edge.setPath([position, targetPoint]);
            });
        }

        if ($scope.network.nodes[index].edges_target) {
            $scope.network.nodes[index].edges_target.forEach((edge) => {
                let sourcePoint = edge.getPath().getArray()[0];

                edge.setPath([sourcePoint, position]);
            });
        }
    }

    function findNode(id, nodes) {
        return nodes.find((node) => {
            node.edges_source = node.edges_source ? node.edges_source : [];
            node.edges_target = node.edges_target ? node.edges_target : [];

            return node.id === id;
        });
    }

    initMap();

    $scope.changeMapType = changeMapType;
    $scope.loadContent = loadContent;
}