app.controller('UserSessionsController', ['$scope', '$state', function ($scope, $state) {
  console.log("Hey from users controller");
  $scope.$on('auth:login-error', function(ev, reason) { 
    $scope.error = reason.errors[0]; 
  });

  $scope.$on('auth:login-success', function(ev){
    $state.go('products.new')
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
