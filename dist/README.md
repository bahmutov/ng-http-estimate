# ng-http-estimate

> Automatic $http request time estimates

[Demo][demo], [basic example][basic], [custom estimator][estimator],
[reporting accuracy][accuracy], [low-level][low-level]

[demo]: http://glebbahmutov.com/ng-http-estimate/
[basic]: http://glebbahmutov.com/ng-http-estimate/examples/basic
[estimator]: http://glebbahmutov.com/ng-http-estimate/examples/custom-estimator
[accuracy]: http://glebbahmutov.com/ng-http-estimate/examples/accuracy
[low-level]: http://glebbahmutov.com/ng-http-estimate/examples/low-level

    npm|bower install ng-http-estimate

Include 'dist/ng-http-estimate.js' script in your page and add dependency on 'http-estimate'

    angular.module('app', ['http-estimate']);

Place the loading element into the body, you can also style it

    <body>
        <http-estimate></http-estimate>
        ...
    </body>

The element will appear automatically on HTML requests and will show estimated remaining
time (if previously computed) or "loading ..." message. Optionally, include 'dist/ng-http-estimate.css'
file to get the default centered style.

![screenshot](screenshot.png)

## Features

* Measurements are saved in the local storage.
* The $http requests are automatically intercepted. If you want to disable intercept and
control the start / stop events, use config provider

```js
.config(function (httpEstimateProvider) {
  httpEstimateProvider.set({
    interceptHttp: false
  });
})
```

* You can pass your own estimator function via config provider. The function can
use built-in estimator and should return the wait time in milliseconds. For example:

```js
.config(function (httpEstimateProvider) {
  httpEstimateProvider.set({
    estimator: function (cacheEstimator, url) {
      console.log('need to estimate how long get request to', url, 'would take');
      var estimate = cacheEstimator(url);
      console.log('built-in cache estimator says', estimate);
      console.log('will trust it');
      return estimate;
    }
  });
})
```

* You can pass 'accuracy' function via config provider to receive result after a request
completes. Useful to collect analytics how accurate the measurements were

```js
.config(function (httpEstimateProvider) {
  httpEstimateProvider.set({
    estimator: function (cacheEstimator, url) {
      ...
    },
    accuracy: function (url, estimate, took) {
      console.log('estimated request to', url, 'to take', estimate, 'took', took, 'ms');
    }
  });
})
```

* Low level interface. You can inject 'httpEstimateLowLevel' into your application and call
the low-level methods `start(name)` and `stop(name)`. Great for custom duration estimation with
http intercepts disabled.

```js
.controller('demoController', function ($scope, httpEstimateLowLevel) {
  $scope.startLoad = function startLoad() {
    httpEstimateLowLevel.start('/foo/bar');
  };
  $scope.stopLoad = function stopLoad() {
    httpEstimateLowLevel.stop('/foo/bar');
  };
});
```

* Verbose console log output for debugging.

```js
.config(function (httpEstimateProvider) {
  httpEstimateProvider.set({
    verbose: true
  });
})
```

* Works fine with other $http interceptors, like [angular-loading-bar][angular-loading-bar],
for example see the [accuracy example][accuracy].

[angular-loading-bar]: http://chieffancypants.github.io/angular-loading-bar/

## Small print

Author: Gleb Bahmutov &copy; 2015

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/ng-http-esimate/issues) on Github
