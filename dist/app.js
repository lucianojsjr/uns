let unsModule = angular.module('uns', ['ui.router']);

config.$inject = ['$stateProvider', '$urlRouterProvider'];
unsModule.config(config);

function config($stateProvider, $urlRouterProvider) {
	$stateProvider.state('map', {
		url: '/map',
		views: {
			'': {
				templateUrl: './views/map.html',
				controller: 'MapController'
			}
		}
	});

	$urlRouterProvider.otherwise('/map');
};


angular
    .module('uns')
    .factory('Utils', Utils);

function Utils(){
    function parse(gml) {
        let json = ('{\n' + gml + '\n}')
            .replace(/^(\s*)(\w+)\s*\[/gm, '$1"$2": {')
            .replace(/^(\s*)\]/gm, '$1},')
            .replace(/^(\s*)(\w+)\s+(.+)$/gm, '$1"$2": $3,')
            .replace(/,(\s*)\}/g, '$1}');

        let graph = {};
        let nodes = [];
        let edges = [];
        let i = 0;
        let parsed;

        json = json.replace(/^(\s*)"node"/gm, function (all, indent) {
            return (indent + '"node[' + (i++) + ']"');
        });

        i = 0;

        json = json.replace(/^(\s*)"edge"/gm, function (all, indent) {
            return (indent + '"edge[' + (i++) + ']"');
        });

        try {
            parsed = JSON.parse(json);
        }
        catch (err) {
            throw new SyntaxError('Bad Format');
        }

        if (!isObject(parsed.graph)) {
            throw new SyntaxError('No Graph Tag');
        }

        forIn(parsed.graph, function (key, value) {

            let matches = key.match(/^(\w+)\[(\d+)\]$/);
            let name;
            let i;

            if (matches) {
                name = matches[1];
                i = parseInt(matches[2], 10);

                if (name === 'node') {
                    nodes[i] = value;
                }
                else if (name === 'edge') {
                    edges[i] = value;
                }
                else {
                    graph[key] = value;
                }
            }
            else {
                graph[key] = value;
            }
        });

        graph.nodes = nodes;
        graph.edges = edges;

        return graph;
    }

    function stringify(graph, options) {
        if (typeof graph.toJSON === 'function') {
            graph = graph.toJSON();
        }

        options = options || {};

        let nodes = graph.nodes || [];
        let edges = graph.edges || [];
        let indent1 = (typeof options.indent === 'string' ? options.indent : '  ');
        let indent2 = indent1 + indent1;
        let getGraphAttributes = options.graphAttributes || null;
        let getNodeAttributes = options.nodeAttributes || null;
        let getEdgeAttributes = options.edgeAttributes || null;
        let lines = ['graph ['];

        function addAttribute(key, value, indent) {

            if (isObject(value)) {
                lines.push(indent + key + ' [');

                forIn(value, function (key, value) {

                    addAttribute(key, value, indent + indent1);
                });

                lines.push(indent + ']');
            }
            else {
                lines.push(indent + attribute(key, value));
            }
        }

        forIn(graph, function (key, value) {

            if (key !== 'nodes' && key !== 'edges') {
                addAttribute(key, value, indent1);
            }
        });

        if (getGraphAttributes) {
            forIn(getGraphAttributes(graph), function (key, value) {

                addAttribute(key, value, indent1);
            });
        }

        nodes.forEach(function (node) {

            lines.push(indent1 + 'node [');

            addAttribute('id', node.id, indent2);
            addAttribute('label', node.label, indent2);

            if (getNodeAttributes) {
                forIn(getNodeAttributes(node) || {}, function (key, value) {

                    addAttribute(key, value, indent2);
                });
            }

            lines.push(indent1 + ']');
        });

        edges.forEach(function (edge) {

            lines.push(indent1 + 'edge [');

            addAttribute('source', edge.source, indent2);
            addAttribute('target', edge.target, indent2);
            addAttribute('label', edge.label, indent2);

            if (getEdgeAttributes) {
                forIn(getEdgeAttributes(edge) || {}, function (key, value) {

                    addAttribute(key, value, indent2);
                });
            }

            lines.push(indent1 + ']');
        });

        lines.push(']');

        return lines.join('\n');
    }

    function isObject(value) {
        return (value && Object.prototype.toString.call(value) === '[object Object]');
    }

    function forIn(object, callback) {
        Object.keys(object).forEach(function (key) {
            callback(key, object[key]);
        });
    }

    function attribute(key, value) {
        if (typeof value === 'boolean') {
            value = Number(value);
        } else {
            value = JSON.stringify(value);
        }

        return (key + ' ' + value);
    }

    return {
        parse: parse,
        stringify: stringify
    }
};
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

        addNodeEvent();
    }

    function changeMapType(type) {
        $scope.map.setMapTypeId(type);
    }

    function addNodeEvent() {
        $scope.map.addListener('click', (evt) => {
            let marker = new google.maps.Marker({
                position: evt.latLng,
                icon: markerIcon,
                draggable: true,
                map: $scope.map
            });
        });
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