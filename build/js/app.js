// app.js
// create our angular app and inject ngAnimate and ui-router 
// =============================================================================
var app = angular.module('App', ['ui.router']);

// configuring our routes 
// =============================================================================
app.config(function($stateProvider, $urlRouterProvider) {
    
  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'partials/welcome.html'
    })
      
      
  // catch all route
  // send users to the form page 
  $urlRouterProvider.otherwise('/welcome');
})