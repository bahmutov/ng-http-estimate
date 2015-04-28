(function httpEstimate(angular) {

  var STORE_NAME = 'http-estimate';
  var estimates = JSON.parse(localStorage.getItem(STORE_NAME) || '{}');

  function getEstimateScope() {
    var el = angular.element(document.querySelector('http-estimate'));
    var s = el.isolateScope() || el.scope();
    return s;
  }

  angular.module('http-estimate', [])
    .directive('httpEstimate', function () {
      return {
        restrict: 'E',
        scope: {},
        template: '<div id="http-estimate" ng-show="running" ' +
          'ng-class="{ overdue: overdue }">{{ timeRemaining }} ' +
          '<i class="fa fa-spinner fa-pulse"></i></div>',
        controller: ['$scope', '$interval', function ($scope, $interval) {

          $scope.running = false;

          $scope.$on('estimate', function (event, remaining) {
            if (typeof remaining === 'number') {
              console.log('received new estimate', remaining, 'ms');
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

        }]
      };
    })
    .config(['$provide', function ($provide) {
      $provide.decorator('$http', ['$delegate', '$rootScope', function ($delegate, $rootScope) {
        var _get = $delegate.get;

        $delegate.get = function (url) {
          $rootScope.$broadcast('estimate', estimates[url]);

          var started = Number(new Date());
          return _get.apply($delegate, arguments)
            .finally(function () {
              var finished = Number(new Date());
              console.log('took', finished - started);
              estimates[url] = finished - started;

              $rootScope.$broadcast('finished');

              localStorage.setItem(STORE_NAME, JSON.stringify(estimates));

              return this;
            });
        };
        return $delegate;
      }]);
    }]);

}(window.angular));
