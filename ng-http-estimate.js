(function httpEstimat(angular) {

  var estimates = {};

  angular.module('http-estimate', [])
    .config(['$provide', function ($provide) {
      $provide.decorator('$http', ['$delegate', function ($delegate) {
        var _get = $delegate.get;

        $delegate.get = function (url) {
          console.log('http.get', arguments);
          if (estimates[url]) {
            var s = angular.element(document.querySelector('http-estimate')).isolateScope();
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
        template: '<div>{{ timeRemaining }}</div>',
        controller: ['$scope', function ($scope) {
          $scope.$on('estimate', function (event, data) {
            console.log('received new estimate', data, 'ms');
            $scope.timeRemaining = Math.round(data / 1000) + ' seconds';
          });
        }]
      };
    });

}(window.angular));
