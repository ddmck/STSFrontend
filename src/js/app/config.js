
app.config(function($stateProvider, $urlRouterProvider, $authProvider, $locationProvider, $sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from outer templates domain.
    assetsUrl + '**'
  ]);

  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: assetsUrl + 'partials/welcome.html',
      controller: function($scope, $localStorage, WishlistItems, Meta){
        if ($localStorage.gender){
          $scope.msg = "Welcome back!";
        } else {
          $scope.msg = "All The Best Stores - One Basket";
        };
        Meta.set.title = "Welcome";
        $scope.wishlist = $localStorage.wishlistItems;
        var animationDelay = 2500;
 
        animateHeadline($('.cd-headline'));
         
        function animateHeadline($headlines) {
          $headlines.each(function(){
            var headline = $(this);
            //trigger animation
            setTimeout(function(){ hideWord( headline.find('.is-visible') ) }, animationDelay);
            //other checks here ...
          });
        }

        function hideWord($word) {
          var nextWord = takeNext($word);
          switchWord($word, nextWord);
          setTimeout(function(){ hideWord(nextWord) }, animationDelay);
        }
         
        function takeNext($word) {
          return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
        }
         
        function switchWord($oldWord, $newWord) {
          $oldWord.removeClass('is-visible').addClass('is-hidden');
          $newWord.removeClass('is-hidden').addClass('is-visible');
        }
      }
    })

    .state('basket', {
      url: '/basket',
      templateUrl: assetsUrl + 'partials/basket.html',
      controller: 'BasketController'
    })

    .state('pay', {
      abstract: true,
      url: '/pay',
      templateUrl: assetsUrl + 'partials/pay.html',
      controller: 'PaymentsController'
    })

    .state('mens', {
      url: '/mens',
      templateUrl: assetsUrl + 'partials/mobile-mens-categories.html',
      controller: 'MobileCatController'
    })

    .state('womens', {
      url: '/womens',
      templateUrl: assetsUrl + 'partials/mobile-womens-categories.html',
      controller: 'MobileCatController'
    })

    .state('pay.you', {
      url: '/you',
      templateUrl: assetsUrl + 'partials/you.html',
      controller: function($scope, $state, $localStorage){
        $scope.goToSignIn = function(){
          $localStorage.returnTo = "pay.address";
          $state.go("account.signIn");
        }, 
        $scope.goToSignUp = function(){
          $localStorage.returnTo = "pay.address";
          $state.go("account.signUp");
        }
      }
    })

    .state('pay.address', {
      url: '/address',
      templateUrl: assetsUrl + 'partials/address.html', 
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.submitAddress = function(addressForm) {
          $localStorage.address = addressForm;
          console.log(addressForm);
          $state.go('pay.billing')
        }
      }
    })

    .state('pay.billing', {
      url: '/billing',
      templateUrl: assetsUrl + 'partials/billing.html',
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.handleStripe = function(status, response){
          if(response.error) {
            $scope.billingForm.error = response.error;
          } else {
            // got stripe token, now charge it or smt
            $localStorage.token = response.id;
            $localStorage.last4 = $scope.number.slice(-4);
            $state.go('pay.confirmation')
          }
        };
        $scope.clear = function(){
          $localStorage.token = null;
        }
      }
    })

    .state('pay.confirmation', {
      url: '/confirmation',
      templateUrl: assetsUrl + 'partials/confirmation.html',
      controller: function($scope, $localStorage, $http, Basket, Deliveries){
        $scope.basket = Basket;
        $scope.deliveries = Deliveries;      
        Basket.fetchBasketItemProducts();
        $scope.localStorage = $localStorage;
        $scope.submitOrder = function(){
          $http.post(backendUrl + "api/orders.json", {order: {
            token: $localStorage.token,
            basket: $localStorage.basketItems,
            deliveries: $localStorage.deliveries,
            address: $localStorage.address
          }});
        } 
      }
    })

    .state('orders', {
      url: '/orders',
      templateUrl: assetsUrl + 'partials/orders.html',
      controller: 'OrdersController'
    })

    .state('account', {
      abstract: true,
      url: '/account',
      templateUrl: assetsUrl + 'partials/account.html'
    })

    .state('account.signIn', {
      url: '/sign-in',
      templateUrl: assetsUrl + 'partials/sign-in.html',
      controller: "UserSessionsController"
    })

    .state('account.signUp', {
      url: '/sign-up',
      templateUrl: assetsUrl + 'partials/sign-up.html',
      controller: "UserRegistrationsController"
    })

    .state('products', {
      abstract: true,
      url: '/products',
      templateUrl: assetsUrl + 'partials/products.html'
    })

    .state('products.new', {
      url: '/new',
      templateUrl: assetsUrl + 'partials/new.html',
      controller: function(Filters, Products){
        Products.resetProducts();
        Products.resetPage();
        Filters.resetAll();
      }
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: assetsUrl + 'partials/hot.html'
    })

    .state('products.saved', {
      url: '/saved',
      templateUrl: assetsUrl + 'partials/saved.html',
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
      templateUrl: assetsUrl + 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        $scope.category = $stateParams.category;
        Products.resetProducts();
        Products.resetPage();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', $stateParams.gender);
      }
    })

    .state('productDetail', {
      url: '/products/:productID',
      templateUrl: assetsUrl + 'partials/product-detail.html',
      controller: "ProductDetailController"
    })

    .state('search', {
      url: '/search?searchString&category',
      templateUrl: assetsUrl + "partials/search-results.html",
      controller: function($scope, $stateParams, Products){
        $scope.searchString = $stateParams.searchString;
        Products.resetProducts();
        Products.resetPage();
        Products.fetchProducts();
        Products.enumeratePage();
      }
    })

    .state('delivery', {
      url: '/delivery',
      templateUrl: assetsUrl + "partials/delivery.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('returns', {
      url: '/returns',
      templateUrl: assetsUrl + "partials/returns.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('about', {
      url: '/about',
      templateUrl: assetsUrl + "partials/about.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pricePromise', {
      url: '/price-promise',
      templateUrl: assetsUrl + "partials/price-promise.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('stores-list', {
      url: '/stores-list',
      templateUrl: assetsUrl + "partials/stores-list.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('contact', {
      url: '/contact',
      templateUrl: assetsUrl + "partials/contact.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('terms', {
      url: '/terms',
      templateUrl: assetsUrl + "partials/terms.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('privacy', {
      url: '/privacy',
      templateUrl: assetsUrl + "partials/privacy.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })
      
  // catch all route
  // send users to the form page 
  $urlRouterProvider
    .when('/products', 'products/new')
    .when('/account', 'account/sign-in')
    .when('/pay', 'pay/ypu')
    .otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
})

app.run(function($rootScope, $location) {
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    ga('send', 'pageview', $location.path());
  });
})
