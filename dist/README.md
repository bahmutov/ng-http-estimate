# local-angular-development

You do not need a server to do local Angular development.
Simple static file with local vendor libraries (like angularjs itself),
plus compiled templates, plus mock http E2E backend is enough.

## installation

You can run the example without any tools, but git:


```sh
git clone https://github.com/bahmutov/local-angular-development.git
cd local-angular-development/dist
```

open `index.html` in the browser. Should display simple list of names.

## building example

Requires [nodejs](http://nodejs.org/), [bower](http://bower.io/) and [grunt](http://gruntjs.com/).

```sh
npm install
bower install
grunt
```

This builds the local page and Angular example app inside *dist/* folder.
You can open `dist/index.html` as a local file in the browser and it should work.

## templates

The best angular practice is to have separate template files, linked to directives
via `templateUrl` parameter, for example see [names.js](src/names/names.js)
and [names.tpl.html](src/names/names.tpl.html).
Usually this would mean separate Ajax call. In this example all HTML templates are
compiled into JavaScript using [grunt-html2js](https://github.com/karlgoldstein/grunt-html2js)
plugin

```js
// compile all .tpl.html files into single module
html2js: {
  main: {
    options: {
      base: 'src',
      module: '<%= pkg.name %>.templates'
    },
    src: [ 'src/**/*.tpl.html' ],
    dest: 'tmp/<%= pkg.name %>.templates.js'
  }
}
```

Then concatenate the produced JavaScript file with the rest of the code, it will look
something like this:

```js
angular.module('local-angular-development.templates', ['names/names.tpl.html']);
angular.module("names/names.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("names/names.tpl.html",
    "<div>\n" +
    "  <ul>\n" +
    "    <li ng-repeat=\"name in names\">{{name}}</li>\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);
// names directive depends on the combined template module
var m = angular.module('names', ['local-angular-development.templates']);

function directive() {
  return {
    restrict: 'E',
    templateUrl: 'names/names.tpl.html',
    scope: {},
    controller: ['$scope', '$http', controller]
  };
}
...
```

You can see the entire produced file
[dist/local-angular-development.js](dist/local-angular-development.js)

## Ajax data

Frontend has nothing to show without data coming from backend.

For example [names](src/names/names.js) directive asks for list of names

```js
function controller($scope, $http) {
  $scope.names = [];
  $http.get('/api/names')
    .then(function (result) {
      $scope.names = result.data.names;
    });
}
```

Just running backend to serve data is wasteful. You can easily serve mock data
using [ngMockE2E.$httpBackend](http://docs.angularjs.org/api/ngMockE2E.$httpBackend).
This is different from the [ngMock.$httpBackend](http://docs.angularjs.org/api/ngMock.$httpBackend)!

*ngMockE2E.$httpBackend* is there to just serve data, without validating
number of requests. One can easily put it directly inside the
[index.html](https://github.com/bahmutov/local-angular-development/blob/master/index.html#L19)

```js
angular.module('tester', ['local-angular-development', 'ngMockE2E'])
  .run(function ($httpBackend) {
    $httpBackend.whenGET('/api/names')
    .respond({
      names: ['joe', 'john', 'adam']
    });
  });
```

## Watch and livereload

My favorite benefit from local development is the automatic browser reload on
any source change, thanks to [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch).
Any time any source file or main HTML page changes, grunt will rebuild the `dist` folder
and will ask the browser to reload the page:

```sh
grunt watch
```

```js
// Gruntfile.js
watch: {
  all: {
    options: {
      livereload: 35729
    },
    files: ['src/**/*.js', 'src/**/*.html', 'index.html'],
    tasks: ['build']
  }
}
```

I had to include the live reload script at the end of the
[index.html](https://github.com/bahmutov/local-angular-development/blob/master/index.html#L33)

```html
<script src="http://localhost:35729/livereload.js"></script>
```

## live demo via gh-pages

Because the entire page runs statically, you can have the `dist` folder hosted on Github
via *gh-pages* branch right away. For example, this project's live demo is at
[http://glebbahmutov.com/local-angular-development/](http://glebbahmutov.com/local-angular-development/)
because I have top level domain name *glebbahmutov.com* pointing at *bahmutov.github.io*.


There is a [grunt-gh-pages](https://github.com/tschaub/grunt-gh-pages)
and we can configure it directly against the `dist` folder

```js
'gh-pages': {
  options: {
    base: '<%= destination_dir %>'
  },
  src: [
    'index.html',
    'README.md',
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'local-angular-development.js'
  ]
}
```

I usually run `grunt gh-pages` manually whenever I think the demo should be
redeployed.

## Related

* [ng-wedge](https://github.com/bahmutov/ng-wedge) - intercept and mock HTTP calls on a live website WITHOUT
using mock $httpBackend or modifying the website or installing extensions.

### author

Follow Gleb Bahmutov [@twitter](https://twitter.com/bahmutov),
see his projects at [glebbahmutov.com](http://glebbahmutov.com/)
