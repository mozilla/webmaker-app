module.exports = {
    className: 'map',
    template: require('./index.html'),
    data: {
        name: 'Map',
        icon: '/images/blocks_map.png',
        attributes: {
            latitude: {
                label: 'Latitude',
                type: 'double',
                value: '0.0'
            },
            longitude: {
                label: 'Longitude',
                type: 'double',
                value: '0.0'
            },
            address: {
                label: 'Address',
                type: 'string',
                value: 'The Pond Road',
            },
        }
    },
    attached: function () {
        var L = require('leaflet');
        L.Icon.Default.imagePath = '../../node_modules/leaflet/dist/images/';
        var map = L.map('map').setView([43.07265,-89.400929], 10);
        
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }
};