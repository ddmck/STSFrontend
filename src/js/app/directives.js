app.directive('ngNavBar', function(){
  return {
    restrict: 'A',
    templateUrl: 'templates/nav-bar-template.html',
    replace: true,
    transclude: true
  }
})