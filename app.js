(function app(angular) {
  'use strict';

  var namesUrl = '/api/names';
  var names = ['joe', 'john', 'adam'];

  angular.module('demo', ['http-estimate', 'ngMockE2E'])
    .config(function (httpEstimateProvider) {
      httpEstimateProvider.set({
        estimator: function (cacheEstimator, url) {
          console.log('need to estimate how long get request to', url, 'would take');
          var estimate = cacheEstimator(url);
          console.log('built-in cache estimator says', estimate);
          console.log('will trust it');
          return estimate;
        },
        accuracy: function (url, estimate, took) {
          console.log('estimated request to', url, 'to take', estimate, 'took', took, 'ms');
        }
      });
    })
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
          names: names
        });
    })
    .controller('demoController', function ($scope, $http, $timeout, httpEstimateLowLevel) {
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

      $scope.fetchUseSuccessNames = function fetchUseSuccessNames() {
        $scope.loading = true;
        $scope.names = [];
        $http.get(namesUrl)
          .success(function (data) {
            $scope.names = data;
          })
          .finally(function () {
            $scope.loading = false;
          });
      };

      $scope.startLoad = function startLoad() {
        console.log('manual start load');
        $scope.loading = true;
        $scope.names = [];
        httpEstimateLowLevel.start(namesUrl);
      };

      $scope.stopLoad = function stopLoad() {
        console.log('manual stop load');
        $scope.loading = false;
        $scope.names = names;
        httpEstimateLowLevel.stop(namesUrl);
      };

      $timeout(function () {
        $scope.fetchNames();
      });
    });
}(window.angular));
