'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
  .state('volunteer', {
    url: '/volunteer',
    template: '<volunteer></volunteer>'
  });
};
