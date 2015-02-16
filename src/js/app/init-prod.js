var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments']);
var backendUrl = "https://www.shopshopgo.com/";
Stripe.setPublishableKey('pk_live_j9uqoLXHPhq1clGi5jDnIWpy');
