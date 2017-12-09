let unsModule = angular.module('uns', ['ui.router', 'ui.bootstrap']);

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
}

angular
	.module('uns')
	.directive('map', MapDirective);

MapDirective.$inject = ['Utils'];

function MapDirective(Utils) {
	return {
		restrict: 'EA',
		scope: true,
		templateUrl: 'views/map.html',
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

			let markers = [];
			let edges = [];

			$scope.map;
			$scope.view = 'roadmap';
			$scope.gml;

			//TODO: ADICIONAR NOVO NÒ
			//TODO: ADICIONAR LINK ENTRE ELES
			//TODO: CRIAR VALORES DEFAULT PARA LINK E NÓS
			//TODO: ATUALIZAR ARQUIVO
			//TODO: CRIAR NOVO ARQUIVO

			initMap = () => {
				$scope.map = new google.maps.Map(mapElement, {
					center: {
						lat: -8.05428,
						lng: -34.8813
					},
					zoom: 6,
					mapTypeId: $scope.view,
					disableDefaultUI: true
				});

				addNodeListener();
			};

			setMapOnAll = (map) => {
				markers.forEach((marker) => {
					marker.setMap(map);
				});

				edges.forEach((edge) => {
					edge.setMap(map);
				});
			};

			clearMap = () => {
				setMapOnAll(null);
				markers = [];
			};

			changeView = (view) => {
				$scope.view = view;

				if (view === 'source') {
					$scope.gml = $scope.currentNetwork ? Utils.getGML($scope.currentNetwork.network) : '';
					return;
				}

				$scope.map.setMapTypeId(view);
			};

			addNodeListener = () => {
				$scope.map.addListener('click', (evt) => {
					if (!$scope.options.node) {
						return;
					}

					let marker = new google.maps.Marker({
						position: evt.latLng,
						icon: markerIcon,
						draggable: true,
						map: $scope.map
					});

					markers.push(marker);
				});
			};

			renderNetwork = () => {
				clearMap();

				if(!$scope.currentNetwork.network || !$scope.currentNetwork.network.nodes){
					return;
				}

				renderNodes();
				renderEdges();
			};

			renderNodes = () => {
				let marker;

				$scope.currentNetwork.network.nodes.forEach((node, index) => {
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

					markers.push(marker);
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
						map: $scope.map
					});

					edges.push(edge);

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

			$scope.$watch('gml', (newValue, oldValue) => {
				if (newValue) {
					console.log(newValue);
					console.log(Utils.parse(newValue + ""));
				}
			});

			initMap();
			$scope.changeView = changeView;
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
	.factory('UNSService', UNSService);

UNSService.$inject = ['$http', '$q'];

function UNSService($http, $q) {
	let options = {
		key: '&key=AIzaSyDknfIyIe2z1fnRTkaJmCF6Jw3Np536mRs',
		size: 'size=1200x500',
		zoom: '&zoom=3',
		map_type: '&maptype='
	};

	getPaths = (node) => {
		let paths = '';

		if (node.edges_source) {
			node.edges_source.forEach((edge) => {
				let start = edge.getPath().getArray()[0];
				let end = edge.getPath().getArray()[1];

				path = `&path=color:0x000000|weight:2|${start.lat()},${start.lng()}|${end.lat()},${end.lng()}`;
				paths += path;
			});
		}

		if (node.edges_target) {
			node.edges_target.forEach((edge) => {
				let start = edge.getPath().getArray()[0];
				let end = edge.getPath().getArray()[1];

				path = `&path=color:0x000000|weight:2|${start.lat()},${start.lng()}|${end.lat()},${end.lng()}`;
				paths += path;
			});
		}

		return paths;
	};

	getMapImageURL = (config, network) => {
		let markers = '';
		let paths = '';

		if (!network || (!network.nodes && !network.edges)) {
			return `https://maps.googleapis.com/maps/api/staticmap?${options.size}${options.zoom}${options.map_type}&center=Brooklyn${options.key}`;
		}

		options.map_type = config.map_type ? (options.map_type + config.map_type)
			: (options.map_type + 'roadmap');

		network.nodes.forEach((node) => {
			let marker = `&markers=${node.Latitude},${node.Longitude}`;

			markers += marker;
			paths += getPaths(node);
		});

		console.log(`https://maps.googleapis.com/maps/api/staticmap?${options.size}${options.zoom}${options.map_type}${markers}${options.key}`);

		return `https://maps.googleapis.com/maps/api/staticmap?${options.size}${options.zoom}${options.map_type}${markers}${paths}${options.key}`;
	};


	return {
		getMapImageURL: getMapImageURL
	};
}
angular
	.module('uns')
	.factory('Utils', Utils);

function Utils() {
	parse = (gml) => {
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

		json = json.replace(/^(\s*)"node"/gm, (all, indent) => {
			return (indent + '"node[' + (i++) + ']"');
		});

		i = 0;

		json = json.replace(/^(\s*)"edge"/gm, (all, indent) => {
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

		forIn(parsed.graph, (key, value) => {

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
	};

	stringify = (graph, options) => {
		if (typeof graph.toJSON === 'function') {
			graph = graph.toJSON();
		}

		options = options || {};

		let nodes = graph.nodes || [];
		let edges = graph.edges || [];
		let indent1 = (typeof options.indent === 'string' ? options.indent : '    ');
		let indent2 = '        ';
		let lines = ['graph ['];

		addAttribute = (key, value, indent) => {

			if (isObject(value)) {
				lines.push(indent + key + ' [');

				forIn(value, (key, value) => {
					addAttribute(key, value, indent + indent1);
				});

				lines.push(indent + ']');
			}
			else {
				lines.push(indent + attribute(key, value));
			}
		};

		forIn(graph, (key, value) => {
			if (key !== 'nodes' && key !== 'edges') {
				addAttribute(key, value, indent1);
			}
		});

		if (options) {
			forIn(options, (key, value) => {
				addAttribute(key, value, indent1);
			});
		}

		nodes.forEach((node) => {

			lines.push(indent1 + 'node [');

			addAttribute('id', node.id, indent2);
			addAttribute('label', node.label, indent2);

			lines.push(indent1 + ']');
		});

		edges.forEach((edge) => {

			lines.push(indent1 + 'edge [');

			addAttribute('source', edge.source, indent2);
			addAttribute('target', edge.target, indent2);
			addAttribute('label', edge.label, indent2);

			lines.push(indent1 + ']');
		});

		lines.push(']');

		return lines.join('\n');
	};

	getGML = (network) => {
		let graph = {};
		let options = {};

		Object.keys(network).forEach(function (key) {
			if (key === 'nodes' || key === 'edges') {
				graph[key] = network[key];
				return;
			}

			options[key] = network[key];
		});

		return stringify(graph, options);
	};

	isObject = (value) => {
		return (value && Object.prototype.toString.call(value) === '[object Object]');
	};

	forIn = (object, callback) => {
		Object.keys(object).forEach((key) => {
			callback(key, object[key]);
		});
	};

	attribute = (key, value) => {
		if (typeof value === 'boolean') {
			value = Number(value);
		} else {
			value = JSON.stringify(value);
		}

		value = value || "null";

		return (key + ' ' + value);
	};

	getDefaultNode = (info) => {
		return {
			id: info.id,
			label: `node${info.id}`,
			Country: info.country,
			Internal: 1,
			Latitude: info.lat,
			Longitude: info.lng,
			Population: 0
		};
	};

	return {
		parse: parse,
		stringify: stringify,
		getGML: getGML,
		getDefaultNode: getDefaultNode
	};
};

angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', '$uibModal', 'Utils', 'UNSService'];

function HomeController($scope, $uibModal, Utils, UNSService) {
	const buttonCollapse = $('.button-collapse');

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
		buttonCollapse.sideNav({
			closeOnClick: true
		});
	};

	newFile = () => {
		const modalInstance = $uibModal.open({
			templateUrl: 'views/modal-new-file.html',
			controller: 'NewFileController'
		});

		modalInstance.result.then((data) => {
			data = data.replace(/ /g, '_');

			$scope.files.push({
				name: `${data}.gml`,
				network: {}
			});
		});
	};

	openFile = (index) => {
		$scope.currentIndex = index;
		$scope.currentNetwork = $scope.files[index];

		buttonCollapse.sideNav('hide');
	};

	loadFile = (content) => {
		const file = $('#file');

		$scope.files.push({
			name: file.prop('files')[0].name,
			network: Utils.parse(content)
		});

		file.val('');
	};

	downloadFile = (index) => {
		const fileIndex = index || $scope.currentIndex;
		const file = $scope.files[fileIndex];
		const gml = Utils.getGML(file.network) || '';
		const link = document.createElement('a');
		const blob = new Blob([gml],
			{type: 'text/plain'});

		link.download = file.name;
		link.href = window.URL.createObjectURL(blob);
		link.onclick = (e) => {
			const that = this;

			setTimeout(() => {
				window.URL.revokeObjectURL(that.href);
			}, 1500);
		};

		link.click();
		link.remove();
	};

	exportMap = () => {
		let a = document.createElement('a');
		let network = $scope.currentNetwork ? $scope.currentNetwork.network : null;

		a.href = UNSService.getMapImageURL({
			map_type: $scope.map.getMapTypeId()
		}, network);
		a.download = "map.png";

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	turnFeature = (feature) => {
		$scope.options[feature] = !$scope.options[feature];

		if (feature === 'node') {
			$scope.options['edge'] = false;
			return;
		}

		if (feature === 'edge') {
			$scope.options['node'] = false;
			return;
		}

		$scope.options[feature] = !$scope.options[feature];
	};

	init();
	$scope.newFile = newFile;
	$scope.openFile = openFile;
	$scope.loadFile = loadFile;
	$scope.downloadFile = downloadFile;
	$scope.exportMap = exportMap;
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
