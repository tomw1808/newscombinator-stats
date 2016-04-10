(function() {
  'use strict';

  angular
    .module('newscombinatorKeywords')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
