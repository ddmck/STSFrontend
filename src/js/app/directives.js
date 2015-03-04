app.directive('ngNavBar', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/nav-bar-template.html',
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
      $('.nav-link a').on('click', function(e) {
        e.preventDefault();
        $('#js-navigation-menu').slideToggle(function(){
          if($('#js-navigation-menu').is(':hidden')) {
            $('#js-navigation-menu').removeAttr('style');
            window.scrollTo(0,0);
          }
        });
      });
    }
  }
});

app.directive('ngCallouts', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/callouts-template.html',
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
    templateUrl: assetsUrl + 'templates/footer-template.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngSizeDropdown', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/size-dropdown.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngProductDetails', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/product-details.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngProductList', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/product-list.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTitle', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-title.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaDescription', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-description.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterCard', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:card" content="product">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterSite', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:site" content="@FetchMyFashion">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterTitle', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:title" content="{{ meta.content().title || "Fetch My Fashion | All Your Shopping On One Site" }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterDescription', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:description" content="{{ meta.content().description || "Shop all of your favourite brands at Fetch My Fashion" }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterCreator', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:creator" content="@FetchMyFashion">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterImage', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:image" content="{{ meta.content().imageUrl }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterPrice', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:data1" content="{{ meta.content().displayPrice }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterPriceLabel', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:label1" content="Price">',
    replace: true,
    transclude: true
  }
});