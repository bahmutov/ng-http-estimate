(function app(angular) {

  var namesUrl = '/api/names';
  var names = ['joe', 'john', 'adam'];

  angular.module('demo', ['http-estimate', 'ngMockE2E'])
    .config(function ($provide) {
      var DELAY_MS = 3000;
      $provide.decorator('$httpBackend', function ($delegate) {
        var proxy = function(method, url, data, callback, headers) {
          var interceptor = function() {
            var _this = this, _arguments = arguments;
            setTimeout(function() {
              callback.apply(_this, _arguments);
            }, DELAY_MS);
          };
          return $delegate.call(this, method, url, data, interceptor, headers);
        };
        for(var key in $delegate) {
          proxy[key] = $delegate[key];
        }
        return proxy;
      });
    })
    .run(function ($httpBackend) {
      $httpBackend.whenGET('/api/names')
        .respond({
          names: names
        });
    })
    .controller('demoController', function ($scope, $http, $timeout) {
      $scope.names = [];

      $scope.fetchNames = function fetchNames() {
        $scope.loading = true;
        $scope.names = [];
        $http.get(namesUrl)
          .then(function (response) {
            $scope.names = response.data.names;
          })
          .finally(function () {
            $scope.loading = false;
          });
      };

      $timeout(function () {
        $scope.fetchNames();
      });
    });
}(window.angular));
