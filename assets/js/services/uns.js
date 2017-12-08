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