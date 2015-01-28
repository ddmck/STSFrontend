app.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('FetchMyFashion')
    .setStorageCookieDomain('')
    .setNotify(true, true);
});

app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
    
  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'partials/welcome.html',
      controller: function($scope, localStorageService, WishlistItems){
        if (localStorageService.get("gender")){
          $scope.msg = "Welcome back!";
        } else {
          $scope.msg = "Fashion Delivered Without the Wait";
        };
        $scope.wishlist = WishlistItems;
      }
    })

    .state('basket', {
      url: '/basket',
      templateUrl: 'partials/basket.html',
      controller: function($scope, localStorageService, Basket){
        $scope.basket = Basket;
        Basket.fetchBasketItemProducts();
        $scope.removeFromBasket = function(product){
          Basket.removeFromBasketItems(product);
        };
      }
    })

    .state('pay', {
      url: '/pay',
      templateUrl: 'partials/pay.html',
      controller: function($scope, localStorageService, Basket){

      }
    })

    .state('account', {
      url: '/account',
      templateUrl: 'partials/account.html'
    })

    .state('account.signIn', {
      url: '/sign-in',
      templateUrl: 'partials/sign-in.html',
      controller: "UserSessionsController"
    })

    .state('account.signUp', {
      url: '/sign-up',
      templateUrl: 'partials/sign-up.html',
      controller: "UserRegistrationsController"
    })

    .state('products', {
      abstract: true,
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

    .state('products.saved', {
      url: '/saved',
      templateUrl: 'partials/saved.html',
      controller: function($scope, WishlistItems){
        $scope.wishlist = WishlistItems;
        WishlistItems.fetchWishlistItemProducts();
        $scope.removeFromWishlist = function(product){
          WishlistItems.removeFromWishlistItems(product);
        };
      }
    })

    .state('categoryView', {
      url: '/products/:gender/{catID}-{category}',
      templateUrl: 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        console.log($stateParams);
        console.log(Products);
        console.log(Filters);
        Products.resetProducts();
        Products.resetPage();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', $stateParams.gender);
        Products.fetchProducts();
      }
    })

    .state('productDetail', {
      url: '/products/:productID',
      templateUrl: 'partials/product-detail.html',
      controller: function($scope, $stateParams, $http, Basket) {
        // get the id
        $scope.showMenu = false;
        $scope.id = $stateParams.productID;
        $scope.size = null;
        $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
          $scope.product = data;
          window.scrollTo(0, 0);
        });

        $scope.toggleMenu = function(){
          $scope.showMenu = !$scope.showMenu;
        };

        $scope.selectSize = function(size){
          $scope.size = size;
          $scope.showMenu = false;
          $scope.product.selectedSize = size;
        };

        $scope.addToBasket = function(){
          Basket.addToBasketItems($scope.product);
          console.log(Basket.list());
        };
      }
    })

    .state('search', {
      url: '/search?searchString&category',
      templateUrl: "partials/search-results.html",
      controller: function($scope, $stateParams, Products){
        $scope.searchString = $stateParams.searchString;
        Products.resetProducts();
        Products.resetPage();
        Products.fetchProducts();
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
  $urlRouterProvider
    .when('/products', 'products/new')
    .otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });
})

