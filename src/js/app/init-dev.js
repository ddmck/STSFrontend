var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments']);
var backendUrl = "http://localhost:3000/";
Stripe.setPublishableKey('pk_test_mfQJDA4oT57DLFi7l0HYu782');