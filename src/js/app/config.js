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