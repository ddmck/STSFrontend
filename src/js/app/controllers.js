app.controller('UserSessionsController', ['$scope', '$state', '$auth', '$localStorage', 'authModal', 'WishlistItems', function ($scope, $state, $auth, $localStorage, authModal, WishlistItems) {
  $scope.$on('auth:login-error', function(ev, reason) { 
    $scope.error = reason.errors[0]; 
  });

  $scope.$on('auth:login-success', function(ev){
    ga('send', 'event', 'users', 'signedIn');
    WishlistItems.fetchWishlistItemProducts()
    if ($localStorage.returnTo) {
      $state.go($localStorage.returnTo);
      delete $localStorage.returnTo;
    } else if (authModal.active()) {
      return
    } else { 
      $state.go('products.new');
    }
        
  });
  $scope.handleLoginBtnClick = function() {
    $auth.submitLogin($scope.loginForm)
      .then(function(resp) {
        
      })
      .catch(function(resp) { 
       //$scope.error = resp;
      });
  };

  $scope.loginClick = function() {
    $scope.submit = true;
    if ($scope.login.$valid){
      $scope.handleLoginBtnClick();
    }
  };
}]);

app.controller('UserRegistrationsController', ['$scope', '$state', '$auth', '$localStorage', function($scope, $state, $auth, $localStorage) {
  $scope.$on('auth:registration-email-error', function(ev, reason) { 
    $scope.error = reason.errors.full_messages[0];
  });

  $scope.$on('auth:registration-email-success', function(ev, message){
    ga('send', 'event', 'users', 'signedUp');
    $auth.submitLogin({
      email: $scope.registrationForm.email,
      password: $scope.registrationForm.password
    });
  });

  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm)
      .then(function(resp) {
        // ga('send', 'event', 'users', 'signUp'); 
      })
      .catch(function(resp) { 
        //$scope.error = resp
      });
    };

  $scope.buttonClick = function() {
    $scope.submitted = true;
    if ($scope.registration.$valid){
      $scope.handleRegBtnClick();
    }
  };
}]);

app.controller('TrendsController', ['$state', '$scope', 'Trends','Filters', function($state, $scope, Trends, Filters){
  $scope.trends = []
  Trends.fetchTrends();
  $scope.trends = Trends;
  $scope.trend = Trends.list();

}]);

app.controller('TrendController', ['$http', '$stateParams', '$scope', 'Products', 'Filters', 'Trends', 'Meta', function($http, $stateParams, $scope, Products, Filters, Trends, Meta){
  Products.resetProducts();
  Products.resetPage();
  Filters.resetAll();
  Filters.removeFilter('gender');
  $http.get(backendUrl + 'features/' + $stateParams.slug + '.json').success(function(data){
    $scope.trend = data;
    if ($scope.trend.gender_id) Filters.setFilter("gender", $scope.trend.gender_id);
    if ($scope.trend.brand_id) Filters.setFilter("brand", $scope.trend.brand_id);
    if ($scope.trend.search_string) Filters.setFilter("searchString", $scope.trend.search_string);
    if ($scope.trend.category_id) Filters.setFilter("category", $scope.trend.category_id);
    Meta.set("title", "Check out " + data.title + " and other trends at Search The Sales");
    Meta.set("description", data.copy);
    Meta.set("imageUrl", data.image_url);
    Products.fetchProducts();
  });
}]);

app.controller('ProductsController',  ['$scope', '$http', '$state', 'Filters', 'Products', 'WishlistItems', '$localStorage', 'authModal', '$auth', function($scope, $http, $state, Filters, Products, WishlistItems, $localStorage, authModal, $auth){
  var productCtrl = this;
  productCtrl.products = Products;
  // WishlistItems.fetchWishlistItems();
  this.filters = Filters;

  this.viewProduct = function(product) {
    $state.go('productDetail', {productID: product.id})
  };

  this.addToWishlist = function(product){
    var callback = function(product){
      return function(){
        WishlistItems.addToWishlistItems(product);
        ga('send', 'event', 'products', 'addToWishlist', product.name);
      }
    }

    var cb = callback(product)

    if ($auth.user.id) {
      cb();
    } else {

      var unsubscribe = $scope.$on('auth:login-success', function(ev){
        cb();
        authModal.deactivate();
        unsubscribe();
      })
      authModal.activate();
      ga('send', 'event', 'users', 'askedToSignIn', 'adding to wishlist');
    }
    
  };

  this.checkIfWishedFor = function(product_id){
    return WishlistItems.wishedFor(product_id);
  },                           


  this.openLink = function(product, userId){

    window.open(product.url,'_blank');
    if (!userId) {
      $('#signUpModal').foundation('reveal', 'open');
    }
  };

  this.nextPage = function(products){

    if (Products.scrollActive() === true) {
      ga('send', 'event', 'products', 'viewPage', Products.currentPage());
      Products.setScrollActive(false);
      Products.fetchProducts()
    }
  };

  $scope.sendEvent = function(product){
    ga('send', 'event', 'products', 'sentToRetailer', product.name);
  };
}]);

app.controller('GenderController', ['$scope', 'Filters', 'Products', '$localStorage', function($scope, Filters, Products, $localStorage){
  $scope.genderId = Filters.getFilters().gender;

  $scope.setGender = function(gender) {
    if ( gender === "1") {
      Filters.setFilter("gender", 1);
      ga('send', 'event', 'filters', 'selectGender', 'male');
    } else if ( gender === "2") {
      Filters.setFilter("gender", 2);
      ga('send', 'event', 'filters', 'selectGender', 'female');
    } else if ( gender === "" ){
      Filters.removeFilter("gender")
    }
    $localStorage.gender = Filters.getFilters().gender
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
  $scope.setCategory = function(cat_id){
    if (cat_id === "") {
      Filters.removeFilter("category");
    } else {
      Filters.setFilter("category", parseInt(cat_id));
      ga('send', 'event', 'filters', 'selectCategory', cat_id);
    }
    Filters.removeFilter("subCategory");
    Filters.removeFilter("style");
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

app.controller('StylesController', ['$scope', 'Filters', 'Products', 'Categories', 'Styles', function($scope, Filters, Products, Categories, Styles){
  $scope.styles = Styles;
  $scope.styles.fetchStyles();
  $scope.filters = Filters;
  $scope.setStyle = function(style_id){
    if (style_id === "") {
      Filters.removeFilter("style");
    } else {
      Filters.setFilter("style", parseInt(style_id));
      ga('send', 'event', 'filters', 'selectStyle', style_id);
    }
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('ColorController', ['$scope', 'Filters', 'Products', 'Colors', function($scope, Filters, Products, Colors){
  
  $scope.colors = [];
  Colors.fetchColors();
  $scope.colors = Colors;
  $scope.filters = Filters;
  $scope.setColor = function(color_id){
    if (color_id === "") {
      Filters.removeFilter("color");
    } else {
      Filters.setFilter("color", parseInt(color_id));
      ga('send', 'event', 'filters', 'selectColor', color_id);
    }
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('MaterialController', ['$scope', 'Filters', 'Products', 'Materials', function($scope, Filters, Products, Materials){
  
  $scope.materials = [];
  Materials.fetchMaterials();
  $scope.materials = Materials;
  $scope.filters = Filters;
  $scope.setMaterial = function(mtrl_id){
    if (mtrl_id === "") {
      Filters.removeFilter("material");
    } else {
      Filters.setFilter("material", parseInt(mtrl_id));
      ga('send', 'event', 'filters', 'selectMaterial', mtrl_id);
    }
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('MobileCatController', ['$scope', 'Categories', function($scope, Categories){
  Categories.fetchCategories();
  $scope.categories = Categories;

}]);

app.controller('SearchController', ['$state', 'Filters', 'Products', 'Categories', '$localStorage', function($state, Filters, Products, Categories, $localStorage){
  this.updateSearch = function(searchString){
    if (searchString === null || searchString === undefined || searchString === '' || searchString === ' ') {
      return
    } else {
      cat = Filters.getFilters().category;
      Filters.resetAll();
      Filters.setFilter("category", cat);
      Filters.setFilter("searchString", searchString);
      $state.go('search', {searchString: searchString});
      ga('send', 'event', 'products', 'search', searchString);
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

app.controller('SortController', ['$scope', 'Filters', 'Products', function($scope, Filters, Products){
  $scope.Filters = Filters;
  $scope.sorters = [
    {
      name: "Name A-Z",
      val: "first_letter, asc"
    },
    {
      name: "Name Z-A",
      val: "first_letter, desc"
    },
    {
      name: "Price Low-High",
      val: "display_price, asc"
    },
    {
      name: "Price High-Low",
      val: "display_price, desc"
    }
  ];

  $scope.setSort = function(sort){
    Filters.setFilter("sort", sort);
    ga('send', 'event', 'filters', 'sort', sort);
    Products.resetProducts();
    Products.resetPage();
    Products.fetchProducts();
  };
}]);

app.controller('ProductDetailController', ['$scope', '$stateParams', '$http', 'Meta', 'WishlistItems', '$auth', 'authModal','$localStorage', function($scope, $stateParams, $http, Meta, WishlistItems, $auth, authModal, $localStorage){
  // get the id
  $scope.showMenu = false;
  $scope.id = $stateParams.productID;
  $scope.size = null;

  $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
    $scope.product = data;
    Meta.set("title", $scope.product.brand_name + " " + $scope.product.name + " at Search The Sales");
    Meta.set("description", "Shop " + $scope.product.name + " by " + $scope.product.brand_name + " at Search The Sales, All Your Favourite Stores In One Place");
    $scope.currentImg = data.large_image_url || data.image_url;
    Meta.set("imageUrl", $scope.currentImg);
    Meta.set("displayPrice", $scope.product.display_price);
    Meta.set("id", $scope.product.id);
    Meta.set("slug", $scope.product.slug);
    var sizes = _.map($scope.product.sizes, function(size){ return size.name }).join(" | ");
    Meta.set("sizes", sizes);
    $scope.getStoreDetails($scope.product);
    window.scrollTo(0, 0);
  });

  $scope.addToWishlist = function(product){
    var callback = function(product){
      return function(){
        WishlistItems.addToWishlistItems(product);
        ga('send', 'event', 'products', 'addToWishlist', product.name);
      }
    }

    var cb = callback(product)

    if ($auth.user.id) {
      cb();
    } else {

      var unsubscribe = $scope.$on('auth:login-success', function(ev){
        cb();
        authModal.deactivate();
        unsubscribe();
      })
      authModal.activate();
      ga('send', 'event', 'users', 'askedToSignIn', 'adding to wishlist');
    }
    
  };

  $scope.checkIfWishedFor = function(){
    return WishlistItems.wishedFor($scope.id);
  };

  $scope.toggleMenu = function(){
    $scope.showMenu = !$scope.showMenu;
  };

  $scope.setProductImg = function(imgUrl) {
    $scope.currentImg = imgUrl;
  };

  $scope.selectSize = function(size){
    $scope.size = size;
    $scope.showMenu = false;
    $scope.product.selectedSize = size;
  };

  $scope.setButtonMsg = function(inBasket){
    if (!inBasket) {
      $scope.msg = "Adding to Basket";
    } else {
      $scope.msg = "Removing from Basket";
    }
  };

  $scope.getStoreDetails = function(product){
    $http.get(backendUrl + 'stores/' + product.store_id + '.json', {async: true}).success(function(data){
      $scope.storeDetails = data
    })
  };

  $scope.sendEvent = function(){
    ga('send', 'event', 'products', 'sentToRetailer', $scope.product.name);
  };
}]);

app.controller("HeadController", ["Meta", "$scope", function(Meta, $scope){
  $scope.meta = Meta;
}]);

app.controller("BrandController", ["Meta", "$scope", "$http", "$stateParams", "Products", "Filters", function(Meta, $scope, $http, $stateParams, Products, Filters){
  Products.resetProducts();
  Products.resetPage();
  Filters.resetAll();
  Filters.setFilter('brand', $stateParams.id);
  Products.fetchProducts()
  $http.get(backendUrl + 'brands/' + $stateParams.brandId + '.json', {async: true}).success(function(data){
    $scope.brand = data;
    Meta.set("title", $scope.brand.name + " at Search The Sales");
    Meta.set("description", "Shop " + $scope.brand.name + " at Search The Sales, All Your Favourite Stores In One Place");
  })
}]);


app.controller('AuthModalCtrl', function (authModal) {
  this.closeMe = authModal.deactivate;
})

