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

  $scope.signOutClick = function() {
    $scope.signOut();
    $state.go('account.signIn');
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

app.controller('UserRecoveryController', ['$stateParams','$state', '$scope', '$auth', function($stateParams, $state, $scope, $auth){
  $scope.handlePwdResetBtnClick = function() {
    $auth.requestPasswordReset($scope.passwordResetForm)
      .success(function(resp) { 
        $scope.error = "You'll receive an email with a link shortly"
      })
      .error(function(resp) { 
        $scope.error = resp.errors[0];
      });
  };

  $scope.handleUpdatePasswordBtnClick = function() {
    $auth.updatePassword($scope.changePasswordForm)
      .then(function(resp) {
        $scope.error = "Password Updated"
      })
      .catch(function(resp) {
        $scope.error = resp.data.errors[0];
      });
  };

  $scope.handleDestroyAccountBtnClick = function() {
    $auth.destroyAccount()
      .then(function(resp) {
        $state.go('welcome')
      })
      .catch(function(resp) {
        $scope.error = resp.data.errors[0];
      });
  };

  $scope.handleUpdateAccountBtnClick = function() {
    $auth.updateAccount($scope.updateAccountForm)
      .then(function(resp) {
        $scope.result = "Details updated successfully";
      })
      .catch(function(resp) { 
        if (resp.data.errors.name)
          {
            $scope.nameError = resp.data.errors.name[0]
          }else{
            $scope.emailError = resp.data.errors.email[0]
          };
      });
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
  $scope.myGenders = [{id: 0, name: "All"},{id: 1, name: "Mens"},{id: 2, name: "Womens"}];

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setGender = function(gender) {
    var changed;
    if ( gender === "1") {
      changed = Filters.setFilter("gender", 1);
      ga('send', 'event', 'filters', 'selectGender', 'male');
    } else if ( gender === "2") {
      changed = Filters.setFilter("gender", 2);
    } else if ( gender === undefined || gender == 0 ){
      changed = Filters.removeFilter("gender");
    }
    $localStorage.gender = Filters.getFilters().gender
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('CategoryController', ['$scope', 'Filters', 'Products', 'Categories', '$rootScope', function($scope, Filters, Products, Categories, $rootScope){
  var changed;
  Categories.fetchCategories();
  $scope.catId = Filters.getFilters().category;
  $scope.myCats = [{id: 0, name: "All"}].concat(Categories.list());
  $scope.$on("catsLoaded", function(){
    $scope.myCats = [{id: 0, name: "All"}].concat(Categories.list());
  });


  $scope.categories = Categories

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setCategory = function(cat_id){
    if (cat_id === undefined || cat_id == 0) {
      changed = Filters.removeFilter("category");
    } else {
      changed = Filters.setFilter("category", parseInt(cat_id));
      ga('send', 'event', 'filters', 'selectCategory', cat_id);
      $rootScope.$broadcast('stylesLoaded');
    }
    
    if (changed) {
      Filters.removeFilter("subCategory");
      Filters.removeFilter("style");
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);


app.controller('SubCategoryController', ['$scope', 'Filters', 'Products', 'Categories', 'SubCategories', function($scope, Filters, Products, Categories, SubCategories){
  SubCategories.fetchSubCategories();
  $scope.mySubCats = [{id: 0, name: "All"}].concat(SubCategories.availablelist());
  $scope.$on("subCatsLoaded", function(){
    $scope.mySubCats = [{id: 0, name: "All"}].concat(SubCategories.availablelist());
  });

  $scope.subCategories = SubCategories;

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setSubCat = function(sub_cat_id){
    if (sub_cat_id === undefined || sub_cat_id == 0) {
      Filters.removeFilter("subCategory");
    } else {
      Filters.setFilter("subCategory", parseInt(sub_cat_id));
    }
    Products.resetProducts(true);
    Products.fetchProducts();
  };
}]);

app.controller('StylesController', ['$scope', 'Filters', 'Products', 'Categories', 'Styles', function($scope, Filters, Products, Categories, Styles){
  var changed;
  $scope.styleId = Filters.getFilters().style;
  Styles.fetchStyles();
  $scope.myStyles = [{id: 0, name: "All"}].concat(Styles.availableList());
  $scope.$on("stylesLoaded", function(){
    $scope.myStyles = [{id: 0, name: "All"}].concat(Styles.availableList());
  });

  $scope.styles = Styles;
  $scope.filters = Filters;

  $scope.myConfig = {
    create: false,
    valueField: 'id',
    labelField: 'name',
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };

  $scope.setStyle = function(style_id){
    if (style_id === undefined || style_id == 0) {
      changed = Filters.removeFilter("style");
    } else {
      changed = Filters.setFilter("style", parseInt(style_id));
      ga('send', 'event', 'filters', 'selectStyle', style_id);
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('ColorController', ['$scope', 'Filters', 'Products', 'Colors', function($scope, Filters, Products, Colors){
  var changed;
  $scope.colorId = Filters.getFilters().color;
  Colors.fetchColors();
  $scope.myColors = [{id: 0, name: "All"}].concat(Colors.list());
  $scope.$on("colorsLoaded", function(){
    $scope.myColors = [{id: 0, name: "All"}].concat(Colors.list());
  });

  $scope.colors = Colors;
  
  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setColor = function(color_id){
    if (color_id === undefined || color_id == 0) {
      changed = Filters.removeFilter("color");
    } else {
      changed = Filters.setFilter("color", parseInt(color_id));
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('BrandDropdownController', ['$scope', 'Filters', 'Products', 'Brands', '$http', function($scope, Filters, Products, Brands, $http){
  var changed;
  $scope.brandId = Filters.getFilters().brand;

  Brands.fetchBrands();
  $scope.myBrands = [{id: 0, name: "All"}].concat(Brands.brands);
  
  $scope.$on("brandsLoaded", function(){
    $scope.myBrands = [{id: 0, name: "All"}].concat(Brands.brands)
  });

  $scope.brands = Brands;
  
  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setBrand = function(brand_id){
    if (brand_id === undefined || brand_id == 0) {
      changed = Filters.removeFilter("brand");
    } else {
      changed = Filters.setFilter("brand", parseInt(brand_id));
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  }; 
}]);

app.controller('MaterialController', ['$scope', 'Filters', 'Products', 'Materials', function($scope, Filters, Products, Materials){
  
  $scope.materials = [];
  Materials.fetchMaterials();
  $scope.myMaterials = [{id: 0, name: "All"}].concat(Materials.list());
  $scope.filters = Filters;

  $scope.$on("materialsLoaded", function(){
    $scope.myMaterials = [{id: 0, name: "All"}].concat(Materials.list())
  });

  $scope.myConfig = {
    create: false,
    valueField: 'id',
    labelField: 'name',
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };
  
  $scope.setMaterial = function(mtrl_id){
    if (mtrl_id === undefined || mtrl_id == 0) {
      changed = Filters.removeFilter("material");
    } else {
      changed = Filters.setFilter("material", parseInt(mtrl_id));
      ga('send', 'event', 'filters', 'selectMaterial', mtrl_id);
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
    
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
  var changed;
  $scope.sort = Filters.getFilters().sort;
  $scope.Filters = Filters;
  $scope.mySorts = [{id: 0, name: "Name A-Z", value: "first_letter, asc"},{id: 1, name: "Name Z-A", value: "first_letter, desc"},{id: 2, name: "Price Low-High", value: "display_price, asc"},{id: 2, name: "Price High-Low", value: "display_price, desc"}];

  $scope.myConfig = {
    create: false,
    valueField: 'value',
    labelField: 'name',
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };


  $scope.setSort = function(sort){
    changed = Filters.setFilter("sort", sort);
    ga('send', 'event', 'filters', 'sort', sort);
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
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

app.controller("BrandController", ["Meta", "$scope", "$http", "$stateParams", "Products", "Filters", "$state", function(Meta, $scope, $http, $stateParams, Products, Filters, $state){
  Products.resetProducts();
  Filters.resetAll();
  Filters.setFilter('brand', $stateParams.id);
  $scope.category = $stateParams.category;
  Filters.setFilter('category', $stateParams.catID);
  Products.fetchProducts()
  $http.get(backendUrl + 'brands/' + $stateParams.brandId + '.json', {async: true}).success(function(data){
    $scope.brand = data;
    $scope.checkIfFeaturedCategorySet($scope);
    
    if ($stateParams.catID){
      Meta.set("title", $scope.brand.name + " " + $scope.category + " at Fetch My Fashion");
      Meta.set("description", "Shop " + $scope.brand.name + " " + $scope.category + " at Fetch My Fashion, All Your Favourite Stores In One Place");
    }else{
      Meta.set("title", $scope.brand.name + " at Fetch My Fashion");
      Meta.set("description", "Shop " + $scope.brand.name + " at Fetch My Fashion, All Your Favourite Stores In One Place");
    }
  })

  $scope.checkIfFeaturedCategorySet = function($scope){
    $scope.brand.featured_categories = _.reject($scope.brand.featured_categories, function(n) {
                                       return _.contains(n.name, $scope.category)
                                       });
  };

  $scope.onCatPage = function(){
    return !!$scope.category;
  }
}]);


app.controller('AuthModalCtrl', function (authModal) {
  this.closeMe = authModal.deactivate;
})

