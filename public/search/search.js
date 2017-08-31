'use strict';
/* global instantsearch */
var where = $('#geocomplete').val();
var when = $('#daterange').val();

var lat = $('#lat').val();
var lng = $('#lng').val();
var geolocation = lat + ',' + lng;

var range = when.split('-');
var start = new Date(range[0]).getTime();
var end = new Date(range[1]).getTime();

$('input').change(function() {
  where = $('#geocomplete').val();
  when = $('#daterange').val();

  lat = $('#lat').val();
  lng = $('#lng').val();
  geolocation = lat + ',' + lng;

  range = when.split('-');
  start = new Date(range[0]).getTime();
  end = new Date(range[1]).getTime();
})

var search = instantsearch({
  appId: 'JZD3EA97SB',
  apiKey: 'e8bf94e0fd17d490c4ff903737db98a5',
  indexName: 'byns',
  urlSync: true,
  searchParameters: {
  //     //'getRankingInfo': true,
  filters: `start < ${start} AND end > ${end}`,
    //}, 
    aroundLatLng: geolocation,
  //     aroundRadius: 100
}
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
'<a id="modal-wrapper" href="#" data-id="{{objectID}}" data-bynref="{{bynref}}" data-toggle="modal" data-target="#targetBynModal" style="text-decoration: none; color: black"><div class="pictures-wrapper" onmouseover=highlightMarker(this) onmouseout=highlightMarker(this)>' +
'<img class="picture" style="border: 3px solid #b9b9b9; border-radius: 7px; width: 150px; height: 150px" src="{{photos}}" />' +
/*'<img class="profile" src="{{user.user.thumbnail_url}}" />' +*/
'</div>' +
'<div class="infos" style="padding-top: 5px">' +
'<h6 class="media-heading" style="text-align: center; color: #696969">{{type}} | {{size}} sqft | ${{price}}/month</h6>' +
'</div></a>' +
'</div>';

function toggleColor(marker) {
  if (!marker.getIcon()) {
    marker.setIcon('https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_white.png');
  } else {
    marker.setIcon(null)
  }
      // if (marker.getAnimation()) {
      //   marker.setAnimation(null);
      // } else {
      //   marker.setAnimation(google.maps.Animation.BOUNCE);
      // }
    }

    function highlightMarker(arg) {
      var index = $('.pictures-wrapper').index(arg);
      toggleColor(markers[index]);
    }

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
    pips: false
  })
      );


// search.addWidget(
//   instantsearch.widgets.googleMaps({
//     container: document.querySelector('#map')
//   })
// );
var markers = [];
var customMapWidget = {
  //_autocompleteContainer: document.getElementById('where'),
  //_mapContainer: document.getElementById('map'),
  //markers: [],

  // Transform one hit to a Google Maps marker
  _hitToMarker: function(hit) {
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
              zoom: 12,
              zoomControl: true,

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
    markers.forEach(function (marker) {
      marker.setMap(null)
    });

    // Transform hits to Google Maps markers
    markers = params.results.hits.map(this._hitToMarker.bind(this));
    var query = new google.maps.Marker({
      //position: {lat: hit._geoloc.lat, lng: hit._geoloc.lng},
      position: new google.maps.LatLng(lat, lng),
      map: this._map,
      title: 'Queried Location'
    });
    query.setIcon('https://raw.githubusercontent.com/Concept211/Google-Maps-Markers/master/images/marker_blue.png');
    markers.push(query);

    var bounds = new google.maps.LatLngBounds();

    // Make sure we display the good part of the maps
    markers.forEach(function(marker) {
      bounds.extend(marker.getPosition());
    });


    this._map.fitBounds(bounds);
  }

};

search.addWidget(customMapWidget);

search.start();

    // $(document).ready(function() {
    //   console.log("test")
    //   // make a .hover event
    //   $('.pictures-wrapper').hover(

    //     // mouse in
    //     function () {
    //       console.log("here")
    //       // first we need to know which <div class="marker"></div> we hovered
    //       var index = $('.pictures-wrapper').index(this);
    //       console.log("index", index)
    //       markers[index].toggleBounce();
    //     },
    //     // mouse out
    //     function () {
    //       // first we need to know which <div class="marker"></div> we hovered
    //       var index = $('.pictures-wrapper').index(this);
    //       markers[index].toggleBounce();
    //     }

    //   );
    // });

