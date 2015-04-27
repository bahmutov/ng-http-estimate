angular.module('demo', ['http-estimate', 'ngMockE2E'])
  .config(function ($provide) {
    // delay mock backend responses by 1 second
    var DELAY_MS = 1000;
    $provide.decorator('$httpBackend', function ($delegate) {
      var proxy = function(method, url, data, callback, headers) {
        var interceptor = function() {
          var _this = this, _arguments = arguments;
          var delay = typeof arguments[1] === 'object' &&
            Array.isArray(arguments[1].names) ? DELAY_MS * arguments[1].names.length : 0;

          setTimeout(function() {
            // return result to the client AFTER delay
            callback.apply(_this, _arguments);
            DELAY_MS += 1000;
          }, delay);
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
        names: ['joe', 'john', 'adam']
      });
  })
  .controller('demoController', function ($scope, $http) {
    $scope.names = [];

    $scope.fetchNames = function fetchNames() {
      $scope.loading = true;
      $scope.names = [];
      $http.get('/api/names')
        .then(function (response) {
          $scope.names = response.data.names;
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.fetchNames();
  });
