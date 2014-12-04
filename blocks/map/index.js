var map = null;

module.exports = {
    className: 'map',
    template: require('./index.html'),
    data: {
        name: 'Map',
        icon: '/images/blocks_map.png',
        attributes: {
            locationName: {
                label: 'Location Name',
                type: 'string',
                value: 'Mozilla'
            },
            latitude: {
                label: 'Latitude',
                type: 'number',
                value: '37.387444'
            },
            longitude: {
                label: 'Longitude',
                type: 'number',
                value: '-122.061019'
            },
            address: {
                label: 'Address',
                type: 'string',
                value: '321 E Evelyn Ave, Mountain View, CA, 94041',
            },
        }
    },
    attached: function () {
        

        //Grab bindings
        self = this;
        var L = require('leaflet');
        L.Icon.Default.imagePath = "../../node_modules/leaflet/dist/images";


        //Grab location
        var loc = new L.latLng(parseFloat(self.$data.attributes.latitude.value), parseFloat(self.$data.attributes.longitude.value));

        //Remove map if it's already drawn
        if(map != null)
            map.remove();


        //Set map view
        map = L.map('map').setView(loc, 16);

        //Center when popup marker is placed
        map.on('popupopen', function(e) {
            var px = map.project(e.popup._latlng);
            px.y -= e.popup._container.clientHeight/2 
            map.panTo(map.unproject(px),{animate: true}); 
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        //Create popup marker
        var marker = L.marker(loc).addTo(map);
        marker.bindPopup("<p> <strong>" + self.$data.attributes.locationName.value + "</strong> <br />" + self.$data.attributes.address.value + "</p>"
                        ).openPopup();


    }
};