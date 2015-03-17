app.factory('Filters', ['$location', function($location){
  // Hacky way to prevent location being set to empty string causing refresh
  var filters = {};

  return {
    getFilters: function(){
      return filters;
    },
    setFilter: function(name, value){
      filters[name] = value;
    },
    removeFilter: function(name){
      delete filters[name];
    },
    useQuery: function(query){
      filters = query;
    },
    resetAll: function(){
      filters = {gender: filters.gender};
    }         
  };
}]);


app.factory('Trends', [ '$http', 'Products', 'Filters', function($http, Products, Filters){
  var trends = [];
  return {
    fetchTrends: function(){
      $http.get(backendUrl + 'features.json', {async: true}).success(function(data){
        trends = data;
      });
    },
    list: function(){
      return trends;
    }
  }
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

app.factory('Colors', [ '$http', function($http){
  var colors = [];
  return {
    fetchColors: function(){
      $http.get(backendUrl + 'colors.json', {async: true}).success(function(data){
        colors = data;
      });
    },
    list: function(){
      return colors;
    }

  }
}]);

app.factory('Stores', [ '$http', function($http){
  var stores = [];
  return {
    fetchStores: function(){
      $http.get(backendUrl + 'stores.json', {async: true}).success(function(data){
        stores = data;
      });
    },
    list: function(){
      return stores;
    },
    listStoresForProducts: function(products){
      var storeIDs = _.map(products, function(p){
        return p.store_id
      });
      storeIDs = _.uniq(storeIDs);
      var s = _.filter(stores, function(str){
        return (_.indexOf(storeIDs, str.id) > -1)
      });
      return s;
    },
    calcStdDeliveryPrice: function(store, products){
      var productsForStore = _.filter(products, function(p){
        return (p.store_id === store.id)
      });
      var totalSpendForStore = 0;
      _.forEach(productsForStore, function(p){
        totalSpendForStore += parseFloat(p.display_price);
      });
      if (parseFloat(store.free_delivery_threshold) < totalSpendForStore){
        return 0
      } else {
        return store.standard_price
      }
    }
  }
}]);

app.factory('Deliveries', ['$localStorage', function($localStorage){
  if (!$localStorage.deliveries){
    $localStorage.deliveries = [];
  };
  return {
    list: function(){
      return $localStorage.deliveries
    },
    addDelivery: function(delivery, store){
      delivery = JSON.parse('{' + delivery + '}');
      var holdingArr = _.reject($localStorage.deliveries, function(d){
        return (d.store == store.id);
      });
      if (delivery.type) {
        holdingArr.push(delivery);
      }
      $localStorage.deliveries = holdingArr;
    }, 
    reset: function(){
      $localStorage.deliveries = [];
    },
    total: function(){
      if ($localStorage.deliveries.length > 0) {
        var total = 0;
         _.forEach($localStorage.deliveries, function(n) { 
          total += n.price; 
        });
        return total;
      } else {
        return 0;
      }
      
    }
  }
}])


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
        return subCat.category_id == Filters.getFilters().category
      })
    }
  }
}]);

app.factory('Styles', [ '$http', 'Filters', function($http, Filters){
  var styles = [];
  return {
    fetchStyles: function(){
      $http.get(backendUrl + 'styles.json', {async: true}).success(function(data){
        styles = data;
        console.log(styles);
      });
    },
    list: function(){
      return styles;
    },
    availableList: function(){
      return _.filter(styles, function(style){
        return style.category_id == Filters.getFilters().category
      })
    }
  }
}]);

app.factory('Orders', [ '$http', function($http){
  var orders = [];
  return {
    fetchOrders: function(){
      $http.get(backendUrl + 'api/orders.json', {async: true}).success(function(data){
        orders = data;
      });
    },
    list: function(){
      return orders;
    }
  }
}]);

app.factory('WishlistItems', [ '$http', '$localStorage', function($http, $localStorage){
  var wishlistItems = [];
  $http.get(backendUrl + 'api/wishlist_items.json').success(function(data){
        wishlistItems = data;
  });
  return {
    update: function(array) {
      $localStorage.wishlistItems = array;
    },
    fetchWishlistItemProducts: function(){
      $http.get(backendUrl + 'api/wishlist_items.json').success(function(data){
        wishlistItems = data;
      });
    },
    listProducts: function(){
      return _.map(wishlistItems, function(wl){
        return wl.product
      });
    },
    list: function(){
      return wishlistItems;
    },
    wishedFor: function(productId){
      var ans =  _.find(wishlistItems, function(wl){
        return wl.product.id == productId;
      })
      return !(ans === undefined);
    },
    addToWishlistItems: function(product){
      
      var wli = _.find(wishlistItems, function(wl){
        return wl.product.id === product.id;
      })
      if ( wli === undefined ) {
        $http.post(backendUrl + 'api/wishlist_items.json', {async: true, params: {
                                                                              product_id: product.id 
                                                                              }})
          .success(function(data){
            wishlistItems.push(data)
          });
        
      } else {

        $http.delete(backendUrl + 'api/wishlist_items/' + wli.id + '.json', {async: true})
          .success(function(data){
            wishlistItems = _.reject(wishlistItems, function(wl){
              return wl.id === wli.id
            })
          })

      }
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
    listStores: function(){
      return stores;
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
  var scrollActive = false;
  return {
    scrollActive: function(){
      return scrollActive;
    },
    setScrollActive: function(val){
      scrollActive = val;
    },
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
      scrollActive = false;
    },
    resetPage: function(){
      page = 1;
    },
    addProducts: function(newProducts){
      products = products.concat(newProducts);
    },
    fetchProducts: function(){
      searching = true;
      $http.get(backendUrl + 'products.json', { async: true, 
                                                params: {
                                                  page: page.toString(), 
                                                  filters: {
                                                    gender_id: Filters.getFilters().gender,
                                                    brand_id: Filters.getFilters().brand, 
                                                    category_id: Filters.getFilters().category, 
                                                    sub_category_id: Filters.getFilters().subCategory,
                                                    color_id: Filters.getFilters().color,
                                                    style_id: Filters.getFilters().style
                                                  }, 
                                                  sort: Filters.getFilters().sort, 
                                                  search_string: Filters.getFilters().searchString
                                                  
                                                }}).success(function(data){
                                                  if (data.length > 0) {
                                                    products = products.concat(data);
                                                    page += 1;
                                                    scrollActive = true;
                                                    searching = false;
                                                  } else {
                                                    scrollActive = false;
                                                    searching = false;
                                                  }
       
      });
    },
    currentlySearching: function(){
      return searching;
    }
  };
}]);

app.factory('Brands', ['$http', function($http){
  var o = {}
  o.brands = [];
  o.fetchBrands = function(){
    $http.get(backendUrl + 'brands.json', { async: true }).success(function(data){
      o.brands = _.groupBy(data, function(br){
        return br.name[0].toLowerCase();
      });
    });
  }

  o.list = function(){
    return o.brands;
  }

  return o
}])

app.factory('Meta', function(){
  content = {};
  return {
    content: function(){
      return content;
    },
    set: function(setter, value){
      content[setter] = value;
    }
  }
});

app.factory('authModal', function (btfModal) {
  return btfModal({
    controller: 'AuthModalCtrl',
    controllerAs: 'modal',
    templateUrl: assetsUrl + 'partials/auth-modal.html'
  });
})
