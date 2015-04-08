var resolve = function(file) {
  return __dirname + '/src/js/lib/' + file + '.js';
};

module.exports = 
  {
    files: [
      resolve('jquery'),
      resolve('jquery.cookie'),
      resolve('angular'),
      resolve('angular-ui-router'),
      resolve('ngStorage'),
      resolve('angular-sanitize'),
      resolve('angular-modal'),
      resolve('angular-deckgrid'),
      resolve('showdown'),
      resolve('markdown'),
      resolve('angular-cookie'),
      resolve('ng-token-auth'),
      resolve('fastclick'),
      resolve('modernizr'),
      resolve('foundation.min'),
      resolve('placeholder'),
      resolve('ng-infinite-scroll'),
      resolve('lodash.min'),
      resolve('inflection.min'),
      resolve('angular-payments'),
      resolve('google-analytics'),
      resolve('selectize.min'),
      resolve('selectize')
    ]
  }