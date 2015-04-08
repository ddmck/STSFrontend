
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

    .state('trends', {
      url: '/trends',
      templateUrl: assetsUrl + 'partials/trends.html',
      controller: 'TrendsController'
    })


    .state('trendView', {
      url: '/trends/:slug',
      templateUrl: assetsUrl + 'partials/trend-view.html',
      controller: 'TrendController'
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
        Filters.resetAll();
        Products.fetchProducts();
      }
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: assetsUrl + 'partials/hot.html'
    })

    .state('products.saved', {
      url: '/saved',
      templateUrl: assetsUrl + 'partials/saved.html',
      controller: function($scope, WishlistItems, $auth, authModal){
        var callback = function(){
          return function(){
            $scope.wishlist = WishlistItems;
            WishlistItems.fetchWishlistItemProducts();
          }
          
        }
        var cb = callback()
        if ($auth.user.id) {
          cb()
        } else {

          var unsubscribe = $scope.$on('auth:login-success', function(ev){
            cb();
            authModal.deactivate();
            unsubscribe();
          })
          authModal.activate()

        }
        
        $scope.addToWishlist = function(product){
          WishlistItems.addToWishlistItems(product);
        };

        $scope.sendEvent = function(product){
          ga('send', 'event', 'products', 'sentToRetailer', product.name);
        };
      }
    })

    .state('categoryView', {
      url: '/products/:gender/{catID:[0-9]+}-{category}',
      templateUrl: assetsUrl + 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        var genderVar;
        if ( $stateParams.gender === "male") {
          genderVar = "1";
        } else if ( $stateParams.gender === "female") {
          genderVar = "2";
        }
        $scope.category = $stateParams.category;
        Products.resetProducts();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', genderVar);
        Products.fetchProducts();
      }
    })

    .state('brands', {
      url: '/brands',
      templateUrl: assetsUrl + "partials/brands-index.html",
      controller: function($scope, Brands){
        $scope.brands = Brands;
        $scope.brands.fetchBrands();
      }
    })

    .state('brandView', {
      url: '/brands/{id:[0-9]+}-{brandId}',
      templateUrl: assetsUrl + "partials/brands-view.html",
      controller: "BrandController"
    })

    .state('brandCatView', {
      url: '/brands/{id:[0-9]+}-{brandId}/{catID:[0-9]+}-{category}',
      templateUrl: assetsUrl + "partials/brands-cat-view.html",
      controller: "BrandController"
    })

    .state('productDetail', {
      url: '/products/{productID:[0-9]+}-{slug}',
      templateUrl: assetsUrl + 'partials/product-detail.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.productID === "") {
          $state.go('products.new');
        }
      },
      controller: "ProductDetailController"
    })

    .state('search', {
      url: '/search?searchString&category',
      templateUrl: assetsUrl + "partials/search-results.html",
      controller: function($scope, $stateParams, Products){
        $scope.searchString = $stateParams.searchString;
        Products.resetProducts();
        Products.fetchProducts();
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
    .otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
})

app.run(function($rootScope, $location, Meta) {

  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    ga('send', 'pageview', $location.path());
    Meta.set("url", $location.protocol() + '://' + $location.host() + $location.path());
  });
})
