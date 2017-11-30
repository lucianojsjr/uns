angular
	.module('uns')
	.controller('HomeController', HomeController);

HomeController.$inject = ['$scope', 'Utils'];

function HomeController($scope, Utils) {
	let currentIndex;
	const mapElement = document.getElementById('map');
	const markerIcon = {
		path: google.maps.SymbolPath.CIRCLE,
		scale: 4,
		strokeColor: '#000000',
		fillColor: 'orange',
		fillOpacity: 1,
	};

	$scope.map;
	$scope.files = [];
	$scope.openedFiles = [];
	$scope.options = {
		node: false,
		edge: false,
		running: false
	};

	init = () => {
		$scope.map = new google.maps.Map(mapElement, {
			center: {
				lat: -8.05428,
				lng: -34.8813
			},
			zoom: 6,
			disableDefaultUI: true
		});

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
	};

	closeFile = (index) => {
		$scope.openedFiles.splice(index, 1);
	};

	loadFile = (content) => {
		$scope.files.push({
			name: $('#file').prop('files')[0].name,
			network: Utils.parse(content)
		});

		$('#file').val('');
	};

	renderNetwork = (index) => {
		if (currentIndex === index) {
			return;
		}

		currentIndex = index;
		$scope.currentFile = $scope.files[currentIndex];

		renderNodes();
		renderEdges();
	};

	renderNodes = () => {
		let marker;

		$scope.currentFile.network.nodes.forEach((node, index) => {
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
	};

	renderEdges = () => {
		let edge;

		$scope.currentFile.network.edges.forEach((edge, index) => {
			let source;
			let target;

			source = findNode(edge.source, $scope.currentFile.network.nodes);
			target = findNode(edge.target, $scope.currentFile.network.nodes);

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
	};

	bindDrag = (marker, index) => {
		google.maps.event.addListener(marker, 'drag', (evt) => {
			const newLatLng = {
				lat: evt.latLng.lat(),
				lng: evt.latLng.lng()
			};

			$scope.currentFile.network.nodes[index].Latitude = newLatLng.lat;
			$scope.currentFile.network.nodes[index].Longitude = newLatLng.lng;

			updateEdgesPosition(index, newLatLng);
		});
	};

	updateEdgesPosition = (index, position) => {
		if ($scope.currentFile.network.nodes[index].edges_source) {
			$scope.currentFile.network.nodes[index].edges_source.forEach((edge) => {
				let targetPoint = edge.getPath().getArray()[1];

				edge.setPath([position, targetPoint]);
			});
		}

		if ($scope.currentFile.network.nodes[index].edges_target) {
			$scope.currentFile.network.nodes[index].edges_target.forEach((edge) => {
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

	isOpened = (index) => {
		return $scope.openedFiles.find((file) => {
			return file.file_index === index;
		});
	};

	turnFeature = (feature) => {
		$scope.options[feature] = !$scope.options[feature];
	};

	$scope.showMenu = true;
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
	$scope.loadFile = loadFile;
	$scope.turnFeature = turnFeature;
	$scope.renderNetwork = renderNetwork;
}
