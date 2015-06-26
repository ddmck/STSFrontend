app.factory('Filters', ['$location', function($location){
  // Hacky way to prevent location being set to empty string causing refresh
  var filters = {};
  var lastResetFrom;
  return {
    getFilters: function(){
      return filters;
    },
    setFilter: function(name, value){
      var changed = filters[name] !== value
      filters[name] = value;
      return changed;
    },
    removeFilter: function(name){
      var changed = !!filters[name]
      delete filters[name];
      return changed;
    },
    useQuery: function(query){
      filters = query;
    },
    resetAll: function(hard){
      if (hard) {
        
        filters = {gender: filters.gender};
        lastResetFrom = $location.absUrl();
      } else if (lastResetFrom !== $location.absUrl()) {
        filters = {gender: filters.gender};
        lastResetFrom = $location.absUrl();
      } 
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

app.factory('Categories', [ '$http', '$rootScope', function($http, $rootScope){
  var categories = [];
  var loaded = false;
  return {
    fetchCategories: function(dataHolder){
      $http.get(backendUrl + 'categories.json', {async: true}).success(function(data){
        categories = data;
        if (!loaded) { $rootScope.$broadcast('catsLoaded'); loaded = true; }
        if (!!dataHolder) {$rootScope.$broadcast('categoriesReceived', dataHolder);}
      });
    },
    list: function(){
      return categories;
    },
    addCount: function(newArr){
      var array = [];
      _.map(categories, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('catsLoaded');
    }
  };
}]);

app.factory('Colors', [ '$http', '$rootScope', function($http, $rootScope){
  var colors = [];
  var loaded = false;
  return {
    fetchColors: function(dataHolder){
      $http.get(backendUrl + 'colors.json', {async: true}).success(function(data){
        colors = data;
        if (!loaded) {$rootScope.$broadcast('colorsLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('colorsReceived', dataHolder);}
      });
    },
    list: function(){
      return colors;
    },
    addCount: function(newArr){
      var array = [];
      _.map(colors, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('colorsLoaded');
    }
  };
}]);

app.factory('Materials', [ '$http', '$rootScope', function($http, $rootScope){
  var materials = [];
  var loaded = false;
  return {
    fetchMaterials: function(dataHolder){
      $http.get(backendUrl + 'materials.json', {async: true}).success(function(data){
        materials = data;
        if (!loaded) {$rootScope.$broadcast('materialsLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('materialsReceived', dataHolder);}
      });
    },
    list: function(){
      return materials;
    },
    addCount: function(newArr){
      var array = [];
      _.map(materials, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('materialsLoaded');
    }
  };
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

app.factory('Styles', [ '$http', 'Filters', '$rootScope', function($http, Filters, $rootScope){
  var styles = [];
  var loaded = false;
  return {
    fetchStyles: function(dataHolder){
      $http.get(backendUrl + 'styles.json', {async: true}).success(function(data){
        styles = data;
        if (!loaded) {$rootScope.$broadcast('stylesLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('stylesReceived', dataHolder);}
      });
    },
    list: function(){
      return styles;
    },
    availableList: function(){
      return _.filter(styles, function(style){
        return style.category_id == Filters.getFilters().category;
      });
    },
    addCount: function(newArr){
      var array = [];
      _.map(styles, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('stylesLoaded');
    }
  };
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

app.factory('Products', ['$http', 'Filters', '$location', 'Colors', 'Brands', '$rootScope', 'Materials', 'Categories', 'Styles', function($http, Filters, $location, Colors, Brands, $rootScope, Materials, Categories, Styles){
  var query = $location.search();
  Filters.useQuery(query);
  var factory = this;
  var products = [];
  var page = 1;
  var searching = true;
  var scrollActive = false;
  var lastScrollLocation = 0;
  var lastResetFrom;
  return {
    setLastScrollLocation: function(y) {
      lastScrollLocation = y
    },
    getLastScrollLocation: function() {
      return lastScrollLocation
    },
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
    resetProducts: function(hard){
      if (hard) {
        products = [];
        scrollActive = false;
        lastResetFrom = $location.absUrl();
        page = 1
        lastScrollLocation = 0
      } else if ($location.absUrl() !== lastResetFrom) {
        products = [];
        scrollActive = false;
        lastResetFrom = $location.absUrl();
        page = 1;
        lastScrollLocation = 0;
      } else {
        lastScrollLocation = lastScrollLocation;
      }
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
                                                    material_id: Filters.getFilters().material,
                                                    style_id: Filters.getFilters().style,
                                                    on_sale: true,
                                                    out_of_stock: false
                                                  }, 
                                                  sort: Filters.getFilters().sort, 
                                                  search_string: Filters.getFilters().searchString
                                                  
                                                }}).success(function(data){
                                                  if (data.colors && data.colors.length > 0) {
                                                    Colors.fetchColors(data.colors);
                                                  }
                                                  if (data.categories && data.categories.length > 0) {
                                                    Categories.fetchCategories(data.categories);
                                                  }
                                                  if (data.materials && data.materials.length > 0) {
                                                    Materials.fetchMaterials(data.materials);
                                                  }
                                                  if (data.brands && data.brands.length > 0) {
                                                    Brands.fetchBrands(data.brands);
                                                  }
                                                  if (data.styles && data.styles.length > 0) {
                                                    Styles.fetchStyles(data.styles);                                                  }
                                                  if (data.products.length > 0) {
                                                    products = products.concat(data.products);
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

app.factory('MoreLikeThis', ['$http', '$rootScope', function($http, $rootScope){
  var moreLikeThis = [];
  return {
    getMoreLikeThis: function(){
      return moreLikeThis;
    },
    fetchMoreLikeThis: function(item){
      searching = true;
      $http.get(backendUrl + 'more_like_this.json', { async: true, 
                                                      params: {
                                                        id: item.id
                                                      } 
                                                    })
                                                    .success(function(data){
                                                      moreLikeThis = [];
                                                      moreLikeThis = moreLikeThis.concat(data);
                                                      moreLikeThis = _.reject(moreLikeThis, {'id': item.id})
                                                      $rootScope.$broadcast('moreLikeThisLoaded')
                                                    });
    }
  };
}]);

app.factory('Brands', ['$http', '$rootScope', function($http, $rootScope){
  var o = {};
  o.brands = [];
  o.loaded = false;
  o.fetchBrands = function(dataHolder){
    $http.get(backendUrl + 'brands.json', { async: true }).success(function(data){
      o.brands = data;
      if (!o.loaded) {$rootScope.$broadcast('brandsLoaded'); o.loaded = true;}
      if (!!dataHolder) {$rootScope.$broadcast('brandsReceived', dataHolder);}     
    });
  };

  o.formattedList = function(){
    return _.groupBy(o.brands, function(br){
      return br.name[0].toLowerCase();
    });
  };

  o.list = function(){
    return o.brands;
  };

  o.addCount = function(newArr){
    var array = [];
    _.map(o.brands, function(n){
      _.forEach(newArr, function(v){
        if (v.name == n.name){
          n.count = v.count;
          n.displayName = n.name + ' ' + '(' + n.count + ')';
        }
      });
      if (!n.count){
        n.count = 0;
        n.displayName = n.name;
      }
    });
    $rootScope.$broadcast('brandsLoaded');
  };

  return o;
}]);

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
