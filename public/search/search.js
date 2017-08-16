'use strict';
/* global instantsearch */

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

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#geocomplete'
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#daterange'
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

var hitTemplate =
  '<div class="hit col-sm-3">' +
  '<div class="pictures-wrapper">' +
    '<img class="picture" src="{{photos}}" />' +
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
    container: '#distance',
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


search.start();
