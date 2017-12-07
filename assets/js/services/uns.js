angular
	.module('uns')
	.factory('UNSService', UNSService);

UNSService.$inject = ['$http', '$q'];

function UNSService($http, $q) {
	const KEY = 'AIzaSyDknfIyIe2z1fnRTkaJmCF6Jw3Np536mRs';

	getMapImageURL = (network) => {
		return 'https://maps.googleapis.com/maps/api/staticmap?size=512x512&zoom=15&center=Brooklyn&style=feature:road.local%7Celement:geometry%7Ccolor:0x00ff00&style=feature:landscape%7Celement:geometry.fill%7Ccolor:0x000000&style=element:labels%7Cinvert_lightness:true&style=feature:road.arterial%7Celement:labels%7Cinvert_lightness:false&key=' + KEY;
	};


	return {
		getMapImageURL: getMapImageURL
	};
}