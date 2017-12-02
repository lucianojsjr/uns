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