var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments', 'btford.modal', 'akoenig.deckgrid']);
var backendUrl = "https://www.shopshopgo.com/";
var assetsUrl = 'http://localhost:9000/';
Stripe.setPublishableKey('pk_test_mfQJDA4oT57DLFi7l0HYu782');