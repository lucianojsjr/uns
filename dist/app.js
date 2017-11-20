let unsModule = angular.module('uns', ['ui.router']);

config.$inject = ['$stateProvider', '$urlRouterProvider'];
unsModule.config(config);

function config($stateProvider, $urlRouterProvider) {
	$stateProvider.state('home', {
		url: '/home',
		views: {
			'': {
				templateUrl: './views/home.html',
				controller: 'HomeController'
			}
		}
	});

	$urlRouterProvider.otherwise('/home');
};

angular
	.module('uns')
	.directive('map', MapDirective);

function MapDirective() {
	return {
		restrict: 'EA',
		scope: true,
		template: '<div id="map" style="width: 100%; height: 500px"></div>',
		controller: ($scope) => {
			$scope = $scope.$parent;

			const mapElement = document.getElementById('map');
			const markerIcon = {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 4,
				strokeColor: '#000000',
				fillColor: 'orange',
				fillOpacity: 1,
			};

			//TODO: LIMPAR O MAP PARA RENDERIZAR AO RENDERIZAR NOVA REDE
			//TODO: CRIAR ABAS MAPA|SATELITE|SOURCE
			//TODO: ADICIONAR NOVO NÒ
			//TODO: ADICIONAR LINK ENTRE ELES
			//TODO: CRIAR VALORES DEFAULT PARA LINK E NÓS

			initMap = () => {
				map = new google.maps.Map(mapElement, {
					center: {
						lat: -8.05428,
						lng: -34.8813
					},
					zoom: 6,
					disableDefaultUI: true
				});

				addNodeListener();
			};

			addNodeListener = () => {
				map.addListener('click', (evt) => {
					if (!$scope.options.node) {
						return;
					}

					let marker = new google.maps.Marker({
						position: evt.latLng,
						icon: markerIcon,
						draggable: true,
						map: map
					});
				});
			};

			renderNetwork = () => {
				console.log($scope.currentNetwork);

				renderNodes();
				renderEdges();
			};

			renderNodes = () => {
				let marker;

				$scope.currentNetwork.network.nodes.forEach((node, index) => {
					map.setCenter({
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
						map: map
					});

					bindDrag(marker, index);
				});
			};

			renderEdges = () => {
				let edge;

				$scope.currentNetwork.network.edges.forEach((edge, index) => {
					let source;
					let target;

					source = findNode(edge.source, $scope.currentNetwork.network.nodes);
					target = findNode(edge.target, $scope.currentNetwork.network.nodes);

					edge = new google.maps.Polyline({
						path: [
							new google.maps.LatLng(source.Latitude, source.Longitude),
							new google.maps.LatLng(target.Latitude, target.Longitude)
						],
						strokeColor: "#000000",
						strokeOpacity: 1.0,
						strokeWeight: 2,
						map: map
					});

					source.edges_source.push(edge);
					target.edges_target.push(edge);
				});
			};

			bindDrag = (marker, index) => {
				google.maps.event.addListener(marker, 'drag', (evt) => {
					const newLatLng = {
						lat: evt.latLng.lat(),
						lng: evt.latLng.lng()
					};

					$scope.currentNetwork.network.nodes[index].Latitude = newLatLng.lat;
					$scope.currentNetwork.network.nodes[index].Longitude = newLatLng.lng;

					updateEdgesPosition(index, newLatLng);
				});
			};

			updateEdgesPosition = (index, position) => {
				if ($scope.currentNetwork.network.nodes[index].edges_source) {
					$scope.currentNetwork.network.nodes[index].edges_source.forEach((edge) => {
						let targetPoint = edge.getPath().getArray()[1];

						edge.setPath([position, targetPoint]);
					});
				}

				if ($scope.currentNetwork.network.nodes[index].edges_target) {
					$scope.currentNetwork.network.nodes[index].edges_target.forEach((edge) => {
						let sourcePoint = edge.getPath().getArray()[0];

						edge.setPath([sourcePoint, position]);
					});
				}
			};

			findNode = (id, nodes) => {
				return nodes.find((node) => {
					node.edges_source = node.edges_source ? node.edges_source : [];
					node.edges_target = node.edges_target ? node.edges_target : [];

					return node.id === id;
				});
			};

			$scope.$watch('currentNetwork', (newValue, oldValue) => {
				if (newValue) {
					renderNetwork();
				}
			});

			initMap();
		}
	}
}
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

angular
	.module('uns')
	.factory('Utils', Utils);

function Utils() {
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
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', 'Utils'];

function HomeController($scope, Utils) {
	$scope.currentIndex;
	$scope.currentNetwork;
	$scope.files = [];
	$scope.openedFiles = [];
	$scope.options = {
		node: false,
		edge: false,
		running: false
	};

	init = () => {
		$('.button-collapse').sideNav({
			closeOnClick: true
		});
	};

	openFile = (index) => {
		if (isOpened(index)) {
			return;
		}

		$scope.openedFiles.push({
			name: $scope.files[index].name,
			file_index: index
		});

		$scope.currentIndex = $scope.openedFiles.length - 1;
		$scope.currentNetwork = $scope.files[index];

		$('.button-collapse').sideNav('hide');
	};

	closeFile = (index) => {
		$scope.openedFiles.splice(index, 1);

		$scope.currentIndex = $scope.openedFiles.length - 1;
		$scope.currentNetwork = $scope.files[$scope.currentIndex];
	};

	selectFile = (index) => {
		const fileIndex = $scope.openedFiles[index].file_index;

		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[fileIndex];
	};

	loadFile = (content) => {
		$scope.files.push({
			name: $('#file').prop('files')[0].name,
			network: Utils.parse(content)
		});

		$('#file').val('');
	};

	isOpened = (index) => {
		return $scope.openedFiles.find((file) => {
			return file.file_index === index;
		});
	};

	turnFeature = (feature) => {
		$scope.options[feature] = !$scope.options[feature];
	};

	$scope.properties = {
		"Número de nós": 1,
		"Número de enlaces": 1,
		"$\overline{d}$": 1,
		"SD APL": 1,
		"$\overline{c},km$": 1,
		"Assortatividade": 1,
		"Densidade": 1,
		"Diâmetro  ísico": 1,
		"Densidade por distância física": 1,
		"Con. natural": 1,
		"Raio espectral": 1,
		"$CC$": 1,
		"$I(G)$": 1,
		"$\mathcal{I(F)}$": 1,
		"PTLE": 1,
		"diam($G$)": 1,
		"Con. algébrica	": 1,
		"$\overline{c}$": 1,
		"Closeness máximo": 1
	};

	init();
	$scope.openFile = openFile;
	$scope.closeFile = closeFile;
	$scope.selectFile = selectFile;
	$scope.loadFile = loadFile;
	$scope.turnFeature = turnFeature;
}

angular
	.module('uns')
	.controller('MapController', MapController);

MapController.$inject = ['$scope', 'Utils'];

function MapController($scope, Utils) {
	const mapElement = document.getElementById('map.js');
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
};
