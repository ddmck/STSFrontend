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