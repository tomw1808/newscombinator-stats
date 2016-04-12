(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('dateChart',dateChart);

    /** @ngInject */
    function dateChart(SolrRequest) {
        var directive = {
            restrict: 'E',
            template: '<nvd3 options="vm.options" data="vm.chartdata"></nvd3>',
            scope: {
                data: '='
            },
            controller: ChartController,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        /** @ngInject */
        function ChartController($scope, $filter, $timeout) {

            var vm = this;

            vm.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 500,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 100,
                        left: 70
                    },
                    x: function (d) {
                        return d[0];
                    },
                    y: function (d) {
                        return d[1];
                    },
                    multibar: {
                      dispatch: {
                          elementClick: function(e){
                              var found = false;
                              angular.forEach(vm.data.keywords, function(value) {
                                  if(value.date !== undefined && value.type.typeValue == 'startDate' && value.date instanceof Date) {
                                      found = true;
                                      value.date = e.data[0];
                                  }

                              });
                              if(!found) {
                                  vm.data.keywords.push({
                                      type: $filter("filter")(vm.data.keywordTypes, {typeValue: 'startDate'})[0],
                                      date: e.data[0]
                                  });
                              }
                              $scope.$apply();
                              vm.loadChart();
                          }
                      }
                    },
                    useVoronoi: false,
                    clipEdge: false,
                    duration: 1000,
                    useInteractiveGuideline: true,
                    xAxis: {
                        expanded: true,
                        showMaxMin: true,

                        rotateLabels: -45,
                        tickFormat: function (date) {
                            return "From "+d3.time.format('%b %d, %Y')(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
                        }

                    },
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        },
                        axisLabel: 'Number of Documents'
                    }
                },
                title: {
                    enable: true,
                    text: 'Date Chart'
                },
                subtitle: {
                    enable: true,
                    text: 'How many submitted links landed on the frontpage between two specific dates? Click in the chart to change the start-date.',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px',
                        'font-size': '80%'
                    }
                }
            };

            vm.chartdata = [{values: [], key: 'On Frontpage'}, {values: [], key: 'Not On Frontpage'}];

            vm.loadChart = function () {

                var query1 = new SolrQuery();
                query1.setKeywords("*:*");
                query1.getImportancy().points = 0;
                query1.getImportancy().age = 0;
                query1.addFilterQuery("content_type:document");
                query1.setFilterQueryFromArray(vm.data.keywords);
                var startDate = '2015-01-01T00:00:00Z';
                var endDate = new Date().toISOString();
                angular.forEach(vm.data.keywords, function(value) {
                    if(value.type.typeValue == 'startDate' && value.date instanceof Date) {
                        startDate = value.date.toISOString();
                    }
                    if(value.type.typeValue == 'endDate'  && value.date instanceof Date) {
                        endDate = value.date.toISOString();
                    }
                });

                query1.addFacetRange("date", "created_at", startDate, endDate, "+1MONTH", undefined, 0);
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "date", {blockParent: "content_type:sourceitem"});
                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["date"]["buckets"], function (value) {
                            if (value.frontpage !== undefined) {
                                angular.forEach(value.frontpage.buckets, function (value_fp) {
                                    if (value_fp.val === true) {
                                        vm.chartdata[0].values.push([new Date(value.val), value_fp.count]);
                                    } else {
                                        vm.chartdata[1].values.push([new Date(value.val), value_fp.count]);
                                    }
                                });
                            } else {
                                vm.chartdata[0].values.push([new Date(value.val), null]);
                                vm.chartdata[1].values.push([new Date(value.val), null]);
                            }
                        });

                    }
                });
            };

            var loadChartTimeout;

            function loadChartDelayed() {
                if(loadChartTimeout !== undefined) {
                    $timeout.cancel(loadChartTimeout);
                }
                loadChartTimeout = $timeout(vm.loadChart, 550);
            }

            $scope.$watch("vm.data", loadChartDelayed, true);
        }

    }

})();
