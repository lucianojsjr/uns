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

			//TODO: ADICIONAR NOVO NÒ
			//TODO: ADICIONAR LINK ENTRE ELES
			//TODO: CRIAR VALORES DEFAULT PARA LINK E NÓS
			//TODO: IMPRIMIR PDF
			//TODO: BUSCAR CIDADE

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

				if (!$scope.currentNetwork.network || !$scope.currentNetwork.network.nodes) {
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

			updateNetwork = (gml) => {
				try {
					$scope.currentNetwork.network = Utils.parse(gml);
				} catch (err) {
					console.log(err);
				}
			};

			$scope.$watch('currentNetwork.network', (newValue, oldValue) => {
				if (newValue) {
					renderNetwork();
				}
			});

			$scope.$watch('gml', (newValue, oldValue) => {
				if (newValue) {
					updateNetwork(newValue);
				}
			});


			initMap();
			$scope.changeView = changeView;
		}
	}
}