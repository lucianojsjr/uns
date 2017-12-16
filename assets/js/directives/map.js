angular
	.module('uns')
	.directive('map', MapDirective);

MapDirective.$inject = ['Utils', 'UNSService'];

function MapDirective(Utils, UNSService) {
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
			let isDrawingEdge = false;
			let edgeToDraw;
			let sourceNode = -1;
			let targetNode = -1;

			$scope.map;
			$scope.view = 'roadmap';

			//TODO: IMPRIMIR PDF
			//TODO: AO DESENAHR EDGE SE CLICAR FORA DO MAPA, DELETAR EDGE

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

				addMapListener();
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

			getCity = (lat, lng, index) => {
				UNSService.getCityByCoord(lat, lng).then(function (data) {
					let country;

					if(!data || !data.length){
						return;
					}

					country = data[0].address_components.find((component) => {
						return component.types.indexOf('country') !== -1;
					});

					$scope.currentNetwork.network.nodes[index].Country = country.long_name;
				});
			};

			changeView = (view) => {
				$scope.view = view;

				if (view === 'source') {
					$scope.gml = $scope.currentNetwork ? Utils.getGML($scope.currentNetwork.network) : '';
					return;
				}

				$scope.map.setMapTypeId(view);
			};

			addMapListener = () => {
				$scope.map.addListener('click', (evt) => {
					addNode(evt);
				});

				$scope.map.addListener('mousemove', (evt) => {
					let sourcePoint;

					if (!isDrawingEdge) {
						return;
					}

					sourcePoint = edgeToDraw.getPath().getArray()[0];
					edgeToDraw.setPath([sourcePoint, evt.latLng]);
				});
			};

			addNode = (evt) => {
				let node;
				let marker;
				let index;

				if (!$scope.options.node) {
					return;
				}

				marker = new google.maps.Marker({
					position: evt.latLng,
					icon: markerIcon,
					draggable: true,
					map: $scope.map
				});

				node = Utils.getDefaultNode({
					id: $scope.currentNetwork.network.nodes.length,
					lat: evt.latLng.lat(),
					lng: evt.latLng.lng()
				});

				node.edges_source = [];
				node.edges_target = [];

				markers.push(marker);
				$scope.currentNetwork.network.nodes.push(node);
				index = $scope.currentNetwork.network.nodes.length - 1;

				bindDrag(marker, index);
				bindClick(marker, index);
				getCity(node.Latitude, node.Longitude, index);
			};

			addEdge = (sourceIndex, targetIndex, edge) => {
				let source;
				let target;
				let networkEdge;

				source = $scope.currentNetwork.network.nodes[sourceIndex];
				target = $scope.currentNetwork.network.nodes[targetIndex];

				if (findPath(source.id, target.id) !== -1) {
					edge.setMap(null);
					return;
				}

				networkEdge = Utils.getDefaultEdge({
					source_id: source.id,
					target_id: target.id
				});

				edges.push(edge);
				$scope.currentNetwork.network.edges.push(networkEdge);

				source.edges_source.push(edge);
				target.edges_target.push(edge);
			};

			bindClick = (marker, index) => {
				google.maps.event.addListener(marker, 'click', (evt) => {
					let newLatLng;
					let target;
					let sourcePosition;

					if (!$scope.options.edge) {
						return;
					}

					isDrawingEdge = true;

					if (sourceNode === -1) {
						sourceNode = index;
					}

					if (targetNode === -1 && sourceNode !== index) {
						targetNode = index;
						target = $scope.currentNetwork.network.nodes[targetNode];

						sourcePosition = edgeToDraw.getPath().getArray()[0];
						edgeToDraw.setPath([sourcePosition, {
							lat: target.Latitude,
							lng: target.Longitude
						}]);

						addEdge(sourceNode, targetNode, edgeToDraw);
						resetDrawing();
						return;
					}

					if (!edgeToDraw) {
						newLatLng = {
							lat: evt.latLng.lat(),
							lng: evt.latLng.lng()
						};

						edgeToDraw = new google.maps.Polyline({
							path: [
								new google.maps.LatLng(newLatLng.lat, newLatLng.lng),
								new google.maps.LatLng(newLatLng.lat, newLatLng.lng)
							],
							strokeColor: "#000000",
							strokeOpacity: 1.0,
							strokeWeight: 2,
							map: $scope.map
						});
					}
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
					bindClick(marker, index);
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

			findPath = (source, target) => {
				let path = -1;

				$scope.currentNetwork.network.edges.forEach((edge, index) => {
					if (edge.source === source && edge.target === target) {
						path = index;
					}
				});

				return path;
			};

			updateNetwork = (gml) => {
				try {
					$scope.currentNetwork.network = Utils.parse(gml);
				} catch (err) {
					console.log(err);
				}
			};

			resetDrawing = () => {
				isDrawingEdge = false;
				edgeToDraw = null;
				sourceNode = -1;
				targetNode = -1;
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