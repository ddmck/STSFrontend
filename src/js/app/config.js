app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
    
  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'partials/welcome.html'
    })

    .state('products', {
      url: '/products',
      templateUrl: 'partials/products.html'
    })

    .state('products.new', {
      url: '/new',
      templateUrl: 'partials/new.html'
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: 'partials/hot.html'
    })

    .state('productDetail', {
      url: '/products/:productID',
      templateUrl: 'partials/product-detail.html',
      controller: function($scope, $stateParams, $http) {
        // get the id
        $scope.id = $stateParams.productID;
        $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
          $scope.product = data;
          window.scrollTo(0, 0);
        });

        // $(document).ready(function(){
        //   $(".dropdown-button").click(function() {
        //     $(".dropdown-menu").toggleClass("show-menu");
        //     $(".dropdown-menu > li").click(function(){
        //       $(".dropdown-menu").removeClass("show-menu");
        //     });
        //     $(".dropdown-menu.dropdown-select > li").click(function() {
        //       $(".dropdown-button").html($(this).html());
        //     });
        //   });
        // });


      }
    })

    .state('delivery', {
      url: '/delivery',
      templateUrl: "partials/delivery.html"
    })

    .state('returns', {
      url: '/returns',
      templateUrl: "partials/returns.html"
    })

    .state('stores-list', {
      url: '/stores-list',
      templateUrl: "partials/stores-list.html"
    })
      
  // catch all route
  // send users to the form page 
  $urlRouterProvider.otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });
})