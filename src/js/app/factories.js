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
      $http.get(backendUrl + 'categories.json', {async: true}).success(function(data){
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
      $http.get(backendUrl + 'sub_categories.json', {async: true}).success(function(data){
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

app.factory('WishlistItems', [ '$http', '$localStorage', function($http, $localStorage){
  if (!$localStorage.wishlistItems){
    $localStorage.wishlistItems = [];
  };
  var products = [];
  return {
    update: function(array) {
      $localStorage.wishlistItems = array;
    },
    fetchWishlistItemProducts: function(){
      products = [];
      var wishlistItems = $localStorage.wishlistItems;
      _.forEach(wishlistItems, function(item){
        $http.get(backendUrl + 'products/' + item + '.json').success(function(data){
          products.push(data);
        });
      });
    },
    listProducts: function(){
      return products;
    },
    list: function(){
      return $localStorage.wishlistItems;
    },
    addToWishlistItems: function(product){
      var wishlistItems = $localStorage.wishlistItems;
      wishlistItems.push(product.id);
      $localStorage.wishlistItems = wishlistItems;
    },
    removeFromWishlistItems: function(product){
      var wishlistItems = $localStorage.wishlistItems;
      wishlistItems = _.reject(wishlistItems, function(n){
        return n == product.id
      });
      $localStorage.wishlistItems = wishlistItems;
      products = _.reject(products, function(p){
        return p === product;
      })   
    }
  }
}]);

app.factory('Basket', [ '$http', '$localStorage', function($http, $localStorage){
  if (!$localStorage.basketItems){
    $localStorage.basketItems = [];
  };
  var products = [];
  return {
    update: function(array) {
      $localStorage.basketItems = array;
    },
    fetchBasketItemProducts: function(){
      products = [];
      var basketItems = $localStorage.basketItems;
      _.forEach(basketItems, function(item){
        $http.get(backendUrl + 'products/' + item.productId + '.json').success(function(data){
          data.selectedSize = _.find(data.sizes, function(size){
            return size.id === item.sizeId
          });
          products.push(data);        
        });
      });
    },
    listProducts: function(){
      return products;
    },
    list: function(){
      return $localStorage.basketItems;
    },
    total: function(){
      var result = 0.0;
      _.forEach(products, function(p){
        result += parseFloat(p.display_price)
      });
      return result
    },
    addToBasketItems: function(product){
      var basketItems = $localStorage.basketItems;
      var productWithSize = { 
        productId: product.id,
        sizeId: product.selectedSize.id 
      }
      basketItems.push(productWithSize);
      $localStorage.basketItems = basketItems;
    },
    removeFromBasketItems: function(product){
      var basketItems = $localStorage.basketItems;
      basketItems = _.reject(basketItems, function(n){
        return n.productId == product.id
      });
      $localStorage.basketItems = basketItems;
      products = _.reject(products, function(p){
        return p === product;
      })   
    }, 
    inBasketItems: function(productID){
      return _.some(products, { 'id': productID });
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
      $http.get(backendUrl + 'products.json', {async: true, params: {page: page.toString(), gender: Filters.getFilters().gender, category: Filters.getFilters().category, sub_category: Filters.getFilters().subCategory, sort: Filters.getFilters().sort, search_string: Filters.getFilters().searchString}}).success(function(data){
        products = products.concat(data);
        scrollActive = true;
        searching = false;
      });
    }
  };
}]);