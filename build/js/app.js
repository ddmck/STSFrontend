var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'ui.router', 'ng-token-auth', 'ipCookie', 'LocalStorageModule']);
var backendUrl = "http://localhost:3000/";
// var backendUrl = "https://www.shopshopgo.com/";
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
      }
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
  $urlRouterProvider.otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });
})


app.directive('ngNavBar', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/nav-bar-template.html',
    replace: true,
    transclude: true,
    compile: function() {
      var menuToggle = $('#js-mobile-menu').unbind();
      $('#js-navigation-menu').removeClass("show");

      menuToggle.on('click', function(e) {
        e.preventDefault();
        $('#js-navigation-menu').slideToggle(function(){
          if($('#js-navigation-menu').is(':hidden')) {
            $('#js-navigation-menu').removeAttr('style');
          }
        });
      });
    }
  }
});

app.directive('ngCallouts', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/callouts-template.html',
    replace: true,
    transclude: true,
    compile: function(){
      $(document).foundation('equalizer', 'reflow');
    }
  }
});

app.directive('ngFooter', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/footer-template.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngSizeDropdown', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/size-dropdown.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngProductDetails', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/product-details.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngProductList', function(){
  return {
    restrict: "A",
    templateUrl: 'templates/product-list.html',
    replace: true,
    transclude: true
  }
});
app.factory('Filters', ['$location', function($location){
  // Hacky way to prevent location being set to empty string causing refresh
  var filters = {};

  return {
    getFilters: function(){
      return filters;
    },
    setFilter: function(name, value){
      filters[name] = value;
      // $location.search(name, value);
    },
    removeFilter: function(name){
      delete filters[name];
      if (_.isEmpty(filters)) {
        $location.url($location.path())
      } else {
        $location.search(name, null);
      }
    },
    useQuery: function(query){
      filters = query;
      if (_.isEmpty(filters)) {
        $location.url($location.path())
      } else {
        $location.search(filters);
      }
    },
    resetAll: function(){
      filters = {};
      $location.url($location.path())
    }         
  };
}]);

app.factory('Categories', [ '$http', function($http){
  var categories = [];
  return {
    fetchCategories: function(){
      $http.get('http://localhost:3000/categories.json', {async: true}).success(function(data){
        categories = data;
      });
    },
    list: function(){
      return categories;
    }

  }
}]);

app.factory('SubCategories', [ '$http', 'Filters', function($http, Filters){
  var subCategories = [];
  return {
    fetchSubCategories: function(){
      $http.get('http://localhost:3000/sub_categories.json', {async: true}).success(function(data){
        subCategories = data;
      });
    },
    list: function(){
      return subCategories;
    },
    availableList: function(){
      return _.filter(subCategories, function(subCat){
        return subCat.category_id === Filters.getFilters().category
      })
    }
  }
}]);

app.factory('WishlistItems', [ '$http', 'localStorageService', function($http, localStorageService){
  if (!localStorageService.get("wishlistItems")){
    localStorageService.set("wishlistItems", [])
  };
  var products = [];
  return {
    update: function(array) {
      localStorageService.set("wishlistItems", array);
    },
    fetchWishlistItemProducts: function(){
      products = [];
      var wishlistItems = localStorageService.get("wishlistItems");
      _.forEach(wishlistItems, function(item){
        $http.get('http://localhost:3000/products/' + item + '.json').success(function(data){
          products.push(data);
        });
      });
    },
    listProducts: function(){
      return products;
    },
    list: function(){
      return localStorageService.get("wishlistItems");
    },
    addToWishlistItems: function(product){
      var wishlistItems = localStorageService.get("wishlistItems");
      wishlistItems.push(product.id);
      localStorageService.set("wishlistItems", wishlistItems);
    },
    removeFromWishlistItems: function(product){
      var wishlistItems = localStorageService.get("wishlistItems");
      wishlistItems = _.reject(wishlistItems, function(n){
        return n == product.id
      });
      localStorageService.set("wishlistItems", wishlistItems)
      products = _.reject(products, function(p){
        return p === product;
      })   
    }
  }
}]);

app.factory('Basket', [ '$http', 'localStorageService', function($http, localStorageService){
  if (!localStorageService.get("basketItems")){
    localStorageService.set("basketItems", [])
  };
  var products = [];
  return {
    update: function(array) {
      localStorageService.set("basketItems", array);
    },
    fetchBasketItemProducts: function(){
      products = [];
      var basketItems = localStorageService.get("basketItems");
      _.forEach(basketItems, function(item){
        $http.get('http://localhost:3000/products/' + item.productId + '.json').success(function(data){
          products.push(data);
        });
      });
    },
    listProducts: function(){
      return products;
    },
    list: function(){
      return localStorageService.get("basketItems");
    },
    total: function(){
      var result = 0.0;
      _.forEach(products, function(p){
        result += parseFloat(p.display_price)
      });
      return result
    },
    addToBasketItems: function(product){
      var basketItems = localStorageService.get("basketItems");
      var productWithSize = { 
        productId: product.id,
        sizeId: product.selectedSize.id 
      }
      basketItems.push(productWithSize);
      localStorageService.set("basketItems", basketItems);
    },
    removeFromBasketItems: function(product){
      var basketItems = localStorageService.get("basketItems");
      basketItems = _.reject(basketItems, function(n){
        return n == product.id
      });
      localStorageService.set("basketItems", basketItems)
      products = _.reject(products, function(p){
        return p === product;
      })   
    }
  }
}]);

app.factory('Products', ['$http', 'Filters', '$location', function($http, Filters, $location){
  var query = $location.search();
  Filters.useQuery(query);
  var factory = this;
  var products = [];
  var page = 1;
  var searching = true;
  return {
    getProducts: function(){
      return products;
    },
    currentPage: function(){
      return page;
    },
    currentlySearching: function(){
      return searching;
    },
    enumeratePage: function(){
      page += 1;
    },
    resetProducts: function(){
      products = [];
    },
    resetPage: function(){
      page = 1;
    },
    addProducts: function(newProducts){
      products = products.concat(newProducts);
    },
    fetchProducts: function(){
      searching = true;
      $http.get('http://localhost:3000/products.json', {async: true, params: {page: page.toString(), gender: Filters.getFilters().gender, category: Filters.getFilters().category, sub_category: Filters.getFilters().subCategory, search_string: Filters.getFilters().searchString}}).success(function(data){
        products = products.concat(data);
        scrollActive = true;
        searching = false;
      });
    }
  };
}]);
app.controller('UserSessionsController', ['$scope', function ($scope) {
  console.log("Hey from users controller");
  $scope.$on('auth:login-error', function(ev, reason) { 
    $scope.error = reason.errors[0]; 
  });

  $scope.$on('auth:login-success', function(ev){
    $('#signInModal').foundation('reveal', 'close');
  });
  $scope.handleLoginBtnClick = function() {
    $auth.submitLogin($scope.loginForm)
      .then(function(resp) {

      })
      .catch(function(resp) { 
        // handle error response
      });
  };
}]);

app.controller('UserRegistrationsController', ['$scope', '$auth', function($scope, $auth) {
  $scope.$on('auth:registration-email-success', function(ev, message){
    $('#signUpModal').foundation('reveal', 'close');
    console.log(message);
    $auth.submitLogin({
      email: $scope.registrationForm.email,
      password: $scope.registrationForm.password
    });
  });

  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm)
      .then(function(resp) { 
        
      })
      .catch(function(resp) { 
        
      });
    };
}]);


app.controller('ProductsController',  ['$http', '$state', 'Filters', 'Products', 'WishlistItems', 'localStorageService', function($http, $state, Filters, Products, WishlistItems, localStorageService){
  console.log("Cookie for gender: " + localStorageService.get("gender"))
  this.scrollActive = false;
  var scrollActive = this.scrollActive;
  var productCtrl = this;
  productCtrl.products = Products;
  // WishlistItems.fetchWishlistItems();

  this.filters = Filters;
  
  // Products.fetchProducts();

  $http.get(backendUrl + 'products.json', {async: true, params: { 
                                page: Products.currentPage().toString(), 
                                gender: this.filters.getFilters().gender, 
                                category: this.filters.getFilters().category,
                                sub_category: this.filters.getFilters().subCategory, 
                                search_string: this.filters.getFilters().searchString}
                              }).success(function(data){
    productCtrl.products.addProducts(data);
    scrollActive = true;
  });

  this.viewProduct = function(product) {
    $state.go('productDetail', {productID: product.id})
  };

  this.addToWishlist = function(product){
    var currWishlist = WishlistItems.list();
    if (_.indexOf(currWishlist, product.id) != -1) {
      var currWishlist = _.reject(currWishlist, function(n){
        return n == product.id
      });
      WishlistItems.update(currWishlist);
    } else {
      WishlistItems.addToWishlistItems(product);
    }
    
  };

  // this.wishFor = function(product, userId){
  //   if (!userId) {
  //     $('#signInModal').foundation('reveal', 'open');
  //   } else if (_.some(WishlistItems.list(), { 'product_id': product.id })){
  //      index = _.findIndex(WishlistItems.list(), { 'product_id': product.id })
  //      wishlistItem = WishlistItems.list()[index]
  //      $http.delete(backendUrl + 'wishlist_items/' + wishlistItem.id + '.json', {
  //      } ).success(function(data){
  //       WishlistItems.fetchWishlistItems();
  //      });
  //   } else {
  //     $http.post(backendUrl + 'wishlist_items.json', {wishlist_item: {
  //       product_id: product.id
  //     }} ).success(function(data){
  //       WishlistItems.fetchWishlistItems();
  //     });  
  //   }
    
  // }; 

  this.checkIfWishedFor = function(product_id){
    return _.indexOf(WishlistItems.list(), product_id) != -1;
  },                           


  this.openLink = function(product, userId){

    window.open(product.url,'_blank');
    if (!userId) {
      $('#signUpModal').foundation('reveal', 'open');
    }
  };

  this.nextPage = function(products){
    if (scrollActive === true) {
      scrollActive = false;
      Products.enumeratePage();
      
      $http.get(backendUrl + 'products.json', {async: true, params: {page: Products.currentPage().toString(), gender: this.filters.getFilters().gender, category: this.filters.getFilters().category, sub_category: Filters.getFilters().subCategory, search_string: Filters.getFilters().searchString}}).success(function(data){
        productCtrl.products.addProducts(data);
        scrollActive = true;
      });
    }
  };
}]);

app.controller('GenderController', ['$scope', 'Filters', 'Products', 'localStorageService', function($scope, Filters, Products, localStorageService){
  $scope.setGender = function(gender) {
    if ( gender === "mens") {
      Filters.setFilter("gender", "male");
    } else if ( gender === "womens") {
      Filters.setFilter("gender", "female");
    } else if ( gender === "" ){
      Filters.removeFilter("gender")
    }
    localStorageService.set("gender", Filters.getFilters().gender)
    Products.resetProducts();
    Products.resetPage()
    Products.fetchProducts();
  };
}]);

app.controller('CategoryController', ['$scope', 'Filters', 'Products', 'Categories', function($scope, Filters, Products, Categories){
  
  $scope.categories = [];
  Categories.fetchCategories();
  $scope.categories = Categories;
  $scope.filters = Filters;
  console.log($scope.categories);
  $scope.setCategory = function(cat_id){
    if (cat_id === "") {
      Filters.removeFilter("category");
    } else {
      Filters.setFilter("category", parseInt(cat_id));
    }
    Filters.removeFilter("subCategory");
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('SubCategoryController', ['$scope', 'Filters', 'Products', 'Categories', 'SubCategories', function($scope, Filters, Products, Categories, SubCategories){
  $scope.subCategories = SubCategories;
  $scope.subCategories.fetchSubCategories();
  $scope.filters = Filters;

  $scope.setSubCat = function(sub_cat_id){
    if (sub_cat_id === "") {
      Filters.removeFilter("subCategory");
    } else {
      Filters.setFilter("subCategory", parseInt(sub_cat_id));
    }
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('SearchController', ['$state', 'Filters', 'Products', 'Categories', function($state, Filters, Products, Categories){
  this.updateSearch = function(searchString){
    if (searchString === null || searchString === undefined || searchString === '' || searchString === ' ') {
      return
    } else {
      Filters.resetAll();
      Filters.setFilter("searchString", searchString);
      Products.resetProducts();
      Products.resetPage();
      Products.fetchProducts();
      $state.go('search', {searchString: searchString})
    }
  }

  this.findCat = function(searchString){
    Filters.removeFilter("category");
    Filters.removeFilter("subCategory");
    var words = searchString.toLowerCase().split(" ");
    _(words).forEach(function(word){
      if (Filters.getFilters().category === undefined) {
        _(Categories.list()).forEach(function(category){
          if (Filters.getFilters().category === undefined) {
            if (category.name === word){
              Filters.setFilter("category", parseInt(category.id));
            } else if (category.name.substring(0, category.name.length - 1) === word) {
              Filters.setFilter("category", parseInt(category.id));
            }
          }
        });
      }
    });
    
  };

}]);

app.controller('ToggleController', ['$scope', function($scope){
  $scope.open = false;

  $scope.toggle = function(){
    $scope.open = !$scope.open;
  } 
}]);

