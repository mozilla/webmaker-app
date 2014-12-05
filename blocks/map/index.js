var L = require('leaflet');

module.exports = {
    className: 'map',
    template: require('./index.html'),
    data: {
        name: 'Map',
        icon: '/images/blocks_map.png',
        map: null,
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
        var map = self.$data.map;

        L.Icon.Default.imagePath = '/images';

        //Convert to latitude/longitude
        var loc = new L.latLng(parseFloat(self.$data.attributes.latitude.value), parseFloat(self.$data.attributes.longitude.value));

        //Reset map
        if(map != null)
        {
            map.remove();
        }
        //Create map canvas with location and zoom
        map = L.map('map_' + self.$index, {zoom: 11, zoomControl: false}).setView(loc, 11);


        //Create tiles for map
        //NOTE: OSM IS FOR TESTING PURPOSES ONLY - it is against their terms of use to use in the application
        //OSM - Do no not use in app - http://{s}.tile.osm.org/{z}/{x}/{y}.png
        //MapQuest OSM - Free to use in applications - http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg
        
        var tiles = new L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
                attribution: "Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>",
                updateWhenIdle: true,
                reuseTiles: true,
                subdomains: '1234',
            });
        map.addLayer(tiles);

        //Center view on marker and popup when popup is opened
        map.on('popupopen', function(e) {
            var px = map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
            px.y -= e.popup._container.clientHeight/2 // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
            map.panTo(map.unproject(px),{animate: true}); // pan to new center
        });

        //Create marker for location and popup for location info
        var marker = L.marker(loc);
        marker.bindPopup('<p> <strong>' + self.$data.attributes.locationName.value + '</strong> <br />' + self.$data.attributes.address.value + '</p>');
        map.addLayer(marker);
        marker.openPopup();

        //Set map view and zoom in
        map.invalidateSize();
        map.panTo(loc, { animate: true, duration: 1});
        map.setZoom(20, { animate:true });

    }

};