(function httpEstimate(angular) {
  'use strict';

  var STORE_NAME = 'http-estimate';
  var estimates = JSON.parse(localStorage.getItem(STORE_NAME) || '{}');
  var startTimes = {}; // by name

  function getEstimateScope() {
    var el = angular.element(document.querySelector('http-estimate'));
    var s = el.isolateScope() || el.scope();
    return s;
  }

  function httpEstimateController($scope, $interval, config) {
    $scope.running = false;

    $scope.$on('estimate', function (event, remaining) {
      if (typeof remaining === 'number') {
        if (config.verbose) {
          console.log('received new estimate', remaining, 'ms');
        }

        $scope.running = true;
        $scope.overdue = false;
        $scope.timeRemaining = Math.round(remaining / 1000) + ' seconds';

        var stop = $interval(function () {
          if (!$scope.running && stop) {
            $interval.cancel(stop);
            stop = undefined;
          } else {
            // TODO use finish time, because interval might not be exactly 1 second
            remaining -= 1000;
            $scope.timeRemaining = Math.round(remaining / 1000) + ' seconds';
            if (remaining < 0) {
              $scope.overdue = true;
              $scope.timeRemaining = Math.abs(Math.round(remaining / 1000)) + ' seconds';
            }
          }
        }, 1000);
      } else {
        $scope.running = true;
        $scope.timeRemaining = 'loading ...';
      }
    });

    $scope.$on('finished', function () {
      $scope.running = false;
    });

  }

  function getCachedEstimate(url) {
    return estimates[url];
  }

  function estimateRequest(config, name) {
    var estimate;

    if (typeof config.estimator === 'function') {
      estimate = config.estimator(getCachedEstimate, name);
    } else {
      estimate = getCachedEstimate(name);
    }
    return estimate;
  }

  function httpEstimateDecorator($delegate, $rootScope, config, httpEstimateLowLevel) {
    var _get = $delegate.get;

    $delegate.get = function (url) {
      if (config.interceptHttp) {
        httpEstimateLowLevel.start(url);
      }

      var p = _get.apply($delegate, arguments);
      p.finally(function () {
        if (config.interceptHttp) {
          httpEstimateLowLevel.stop(url);
        }
        return p;
      });
      return p;
    };
    return $delegate;
  }

  function httpEstimateLowLevel($rootScope, config) {
    return {
      start: function (name) {
        if (!name || typeof name !== 'string') {
          throw new Error('Expected request name, got ' + name);
        }
        if (config.verbose) {
          console.log('low level start', name);
        }

        var estimate = estimateRequest(config, name);

        if (config.verbose) {
          console.log('low level estimate for', name, estimate);
        }

        $rootScope.$broadcast('estimate', estimate);
        startTimes[name] = Number(new Date());
      },
      stop: function (name) {
        if (!name || typeof name !== 'string') {
          throw new Error('Expected request name, got ' + name);
        }

        if (config.verbose) {
          console.log('low level stop', name);
        }

        $rootScope.$broadcast('finished');

        if (startTimes[name]) {
          var took = Number(new Date()) - startTimes[name];

          if (config.verbose) {
            console.log(name, 'took', took);
          }

          var previousEstimate = estimates[name];
          estimates[name] = took;
          localStorage.setItem(STORE_NAME, JSON.stringify(estimates));
          if (typeof config.accuracy === 'function' && previousEstimate) {
            config.accuracy(name, previousEstimate, took);
          }
        }
      }
    };
  }

  angular.module('http-estimate', [])
    .directive('httpEstimate', function () {
      return {
        restrict: 'E',
        scope: {},
        template: '<div id="http-estimate" ng-show="running" ' +
          'ng-class="{ overdue: overdue }">{{ timeRemaining }} ' +
          '<i class="fa fa-spinner fa-pulse"></i></div>',
        controller: ['$scope', '$interval', 'httpEstimate', httpEstimateController]
      };
    })
    .config(['$provide', function ($provide) {
      $provide.decorator('$http', [
        '$delegate', '$rootScope', 'httpEstimate', 'httpEstimateLowLevel', httpEstimateDecorator
      ]);
    }])
    .provider('httpEstimate', function () {
      var config = {
        estimator: undefined,
        accuracy: undefined,
        verbose: false,
        interceptHttp: true
      };
      return {
        set: function (options) {
          options = options || {};
          config.estimator = options.estimator || config.estimator;
          config.accuracy = options.accuracy || config.accuracy;
          config.verbose = options.verbose || config.verbose;
          config.interceptHttp = typeof options.interceptHttp !== 'undefined' ?
            options.interceptHttp : config.interceptHttp;
        },
        $get: function () {
          return config;
        }
      };
    })
    .service('httpEstimateLowLevel', [
      '$rootScope', 'httpEstimate', httpEstimateLowLevel
    ]);

}(window.angular));
