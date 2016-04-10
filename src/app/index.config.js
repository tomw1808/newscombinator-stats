(function() {
  'use strict';

  angular
    .module('newscombinatorKeywords')
    .config(config);

  /** @ngInject */
  function config($logProvider, $mdThemingProvider) {
    // Enable log
    $logProvider.debugEnabled(true);
    $mdThemingProvider.theme('default');
  }

})();
