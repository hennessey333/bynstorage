'use strict';
/* global instantsearch */

var where = $('#geocomplete').val();
var when = $('#daterange').val();

var search = instantsearch({
  appId: 'JZD3EA97SB',
  apiKey: 'e8bf94e0fd17d490c4ff903737db98a5',
  indexName: 'byns',
  urlSync: true
});
// var search = instantsearch({
//   appId: 'latency',
//   apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
//   indexName: 'airbnb',
//   urlSync: true
// });

// search.addWidget(
//   instantsearch.widgets.searchBox({
//     container: '#geocomplete',
//     placeholder: 'Search by Location',
//     autofocus: false,
//     poweredBy: false
//   })
// );

// search.addWidget(
//   instantsearch.widgets.searchBox({
//     container: '#daterange',
//     placeholder: 'Search by Date',
//     autofocus: false,
//     poweredBy: false
//   })
// );

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

var hitTemplate =
  '<div class="hit col-sm-3">' +
  '<div class="pictures-wrapper">' +
    '<img class="picture" style="width: 150px; height: 150px" src="{{photos}}" />' +
    /*'<img class="profile" src="{{user.user.thumbnail_url}}" />' +*/
  '</div>' +
  '<div class="infos">' +
  '<h6 class="media-heading">{{name}} | {{size} | {{price}}<br/>{{location}}</h6>' +
  '</div>' +
  '</div>';

var noResultsTemplate = '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    hitsPerPage: 12,
    templates: {
      empty: noResultsTemplate,
      item: hitTemplate
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    scrollTo: '#results',
    cssClasses: {
      root: 'pagination',
      active: 'active'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#room_types',
    attributeName: 'type',
    operator: 'or',
    cssClasses: {item: ['col-sm-3']},
    limit: 10
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    pips: false,
    tooltips: {format: function(rawValue) {return '$' + parseInt(rawValue)}}
  })
  );


search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#size',
    attributeName: 'size',  // change this to distance when their is an attribute for it in the data
    pips: false,
    tooltips: {format: function(rawValue) {return parseInt(rawValue)}}
  })
  );


// search.addWidget(
//   instantsearch.widgets.googleMaps({
//     container: document.querySelector('#map')
//   })
// );

var customMapWidget = {
  //_autocompleteContainer: document.getElementById('where'),
  //_mapContainer: document.getElementById('map'),
  markers: [],

  // Transform one hit to a Google Maps marker
  _hitToMarker: function(hit) {
    console.log("hit", hit)
    var marker = new google.maps.Marker({
      //position: {lat: hit._geoloc.lat, lng: hit._geoloc.lng},
      position: new google.maps.LatLng(hit._geoloc.lat, hit._geoloc.lng),
      map: this._map,
      title: hit.name
    });

    var infowindow = new google.maps.InfoWindow({
      content: hit.name
    });
    var map = this._map
    // Add an info popup when clicking on the marker.
    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });

    return marker;
  },

  init: function(params) {
    this._helper = params.helper;
    var initialLocation = new google.maps.LatLng(37.7749, -122.4194); // SF
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        });
    }
    // Initialize the map
    var mapOptions = {
              // How zoomed in you want the map to start at (always required)
              zoom: 6,

              // The latitude and longitude to center the map (always required)
              center: initialLocation,

              // How you would like to style the map. 
              // This is where you would paste any style found on Snazzy Maps.
              styles: [
              {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                {
                  "saturation": 36
                },
                {
                  "color": "#ffffff"
                },
                {
                  "lightness": 40
                }
                ]
              },
              {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                {
                  "visibility": "simplified"
                },
                {
                  "color": "#000000"
                },
                {
                  "lightness": 16
                },
                {
                  "saturation": "6"
                }
                ]
              },
              {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                {
                  "visibility": "off"
                }
                ]
              },
              {
                "featureType": "administrative",
                "elementType": "geometry.fill",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 20
                },
                {
                  "saturation": "-22"
                },
                {
                  "visibility": "off"
                }
                ]
              },
              {
                "featureType": "administrative",
                "elementType": "geometry.stroke",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 17
                },
                {
                  "weight": 1.2
                },
                {
                  "saturation": "-50"
                },
                {
                  "visibility": "off"
                }
                ]
              },
              {
                "featureType": "landscape",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#262626"
                },
                {
                  "lightness": 20
                }
                ]
              },
              {
                "featureType": "landscape.natural.landcover",
                "elementType": "geometry",
                "stylers": [
                {
                  "visibility": "off"
                },
                {
                  "color": "#808080"
                }
                ]
              },
              {
                "featureType": "landscape.natural.terrain",
                "elementType": "geometry.fill",
                "stylers": [
                {
                  "visibility": "on"
                },
                {
                  "color": "#888888"
                },
                {
                  "saturation": "0"
                },
                {
                  "gamma": "0.28"
                },
                {
                  "lightness": "0"
                }
                ]
              },
              {
                "featureType": "landscape.natural.terrain",
                "elementType": "labels.icon",
                "stylers": [
                {
                  "visibility": "on"
                },
                {
                  "color": "#ffffff"
                }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 21
                }
                ]
              },
              {
                "featureType": "poi",
                "elementType": "labels.icon",
                "stylers": [
                {
                  "visibility": "off"
                },
                {
                  "color": "#000000"
                }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.fill",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 17
                }
                ]
              },
              {
                "featureType": "road.highway",
                "elementType": "geometry.stroke",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 29
                },
                {
                  "weight": 0.2
                }
                ]
              },
              {
                "featureType": "road.arterial",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 18
                }
                ]
              },
              {
                "featureType": "road.local",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 16
                }
                ]
              },
              {
                "featureType": "transit",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 19
                }
                ]
              },
              {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                {
                  "color": "#000000"
                },
                {
                  "lightness": 17
                }
                ]
              }
              ]
          };

          // Get the HTML DOM element that will contain your map 
          // We are using a div with id="map" seen below in the <body>
          var mapElement = document.getElementById('map');

          // Create the Google Map using our element and options defined above
          this._map = new google.maps.Map(mapElement, mapOptions);

    // this._map = new google.maps.Map(
    //     this._mapContainer,
    //     {zoom: 1, center: new google.maps.LatLng(0, 0)}
    // );
  },

  render: function(params) {
    // Clear markers
    this.markers.forEach(function (marker) {
      marker.setMap(null)
    });

    // Transform hits to Google Maps markers
    this.markers = params.results.hits.map(this._hitToMarker.bind(this));

    var bounds = new google.maps.LatLngBounds();

    // Make sure we display the good part of the maps
    this.markers.forEach(function(marker) {
      bounds.extend(marker.getPosition());
    });

    this._map.fitBounds(bounds);
  }
};

search.addWidget(customMapWidget);

search.start();
