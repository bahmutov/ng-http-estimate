(function httpEstimat(angular) {

  var estimates = {};

  function getEstimateScope() {
    var s = angular.element(document.querySelector('http-estimate')).isolateScope();
    return s;
  }

  angular.module('http-estimate', [])
    .config(['$provide', function ($provide) {
      $provide.decorator('$http', ['$delegate', function ($delegate) {
        var _get = $delegate.get;

        $delegate.get = function (url) {
          console.log('http.get', arguments);
          if (estimates[url]) {
            var s = getEstimateScope();
            if (s) {
              s.$broadcast('estimate', estimates[url]);
            }
          }

          var started = Number(new Date());
          return _get.apply($delegate, arguments)
            .finally(function () {
              var finished = Number(new Date());
              console.log('took', finished - started);
              estimates[url] = finished - started;

              var s = getEstimateScope();
              if (s) {
                s.$broadcast('finished');
              }

              return this;
            });
        };
        return $delegate;
      }]);
    }])
    .directive('httpEstimate', function () {
      return {
        restrict: 'E',
        scope: {},
        template: '<div id="http-estimate" ng-show="running" ng-class="{ overdue: overdue }">{{ timeRemaining }}</div>',
        controller: ['$scope', '$interval', function ($scope, $interval) {

          $scope.running = false;

          $scope.$on('estimate', function (event, remaining) {
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
                }
              }
            }, 1000);
          });

          $scope.$on('finished', function () {
            $scope.running = false;
          });

        }]
      };
    });

}(window.angular));
