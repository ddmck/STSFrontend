var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments', 'btford.modal']);
var backendUrl = "https://www.shopshopgo.com/";
var assetsUrl = 'https://s3-eu-west-1.amazonaws.com/fetchmyfashion/';
Stripe.setPublishableKey('pk_live_j9uqoLXHPhq1clGi5jDnIWpy');
