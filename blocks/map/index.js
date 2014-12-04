var map = null;
var L = require('leaflet');
L.Icon.Default.imagePath = '../../node_modules/leaflet/dist/images';

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
            address: {
                label: 'Address',
                type: 'string',
                value: '321 E Evelyn Ave, Mountain View, CA, 94041'
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
        }
    },
    attached: function () {
        self = this;

        //Convert to latitude/longitude
        var loc = new L.latLng(parseFloat(self.$data.attributes.latitude.value), parseFloat(self.$data.attributes.longitude.value));

        //Reset map
        if(map != null)
        {
            map.remove();
        }

        //Create map canvas with location and zoom
        map = L.map('map', {zoom: 11, zoomControl: false}).setView(loc, 11);

        //Create tiles for map
        //NOTE: OSM IS FOR TESTING PURPOSES ONLY - it is against their terms of use to use in the application
        //OSM - Do no not use in app - http://{s}.tile.osm.org/{z}/{x}/{y}.png
        //MapQuest OSM - Free to use in applications - http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg
        
        var tiles = new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
                attribution: "Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>",
                updateWhenIdle: true,
                reuseTiles: true,
                subdomains: '1234'
            });
        
        /*
        var tiles = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpeg', {
            attribution: 'Tiles by <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
            subdomains: '1234'
        }); 
        */
        map.addLayer(tiles);

        //Create marker and popup
        var marker = L.marker(loc);
        marker.bindPopup('<p> <strong>' + self.$data.attributes.locationName.value + '</strong> <br />' + self.$data.attributes.address.value + '</p>'
        ).openPopup();
        map.addLayer(marker);

        //Set map view
        map.invalidateSize();
        map.panTo(loc, { animate: true, duration: 1});
        map.setZoom(20, { animate:true })

    }
};