(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('documentsOnFrontpageChart',documentsOnFrontpageChart);

    /** @ngInject */
    function documentsOnFrontpageChart(SolrRequest) {
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
                    type: 'stackedAreaChart',
                    height: 500,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 70
                    },
                    x: function (d) {
                        return d[0];
                    },
                    y: function (d) {
                        return d[1];
                    },
                    duration: 1000,
                    useInteractiveGuideline: true,
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Number of Documents on Frontpage'
                },
                subtitle: {
                    enable: true,
                    text: 'This Chart shows the number of Documents which landed on the frontpage vs. the number of documents which never made it there.',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px',
                        'font-size': '80%'
                    }
                }
            };

            vm.chartdata =  [{values: [], key: 'On Frontpage'}, {values: [], key: 'Not On Frontpage'}];

            vm.loadChart = function () {

                var query1 = new SolrQuery();
                query1.setKeywords("*:*");
                query1.getImportancy().points = 0;
                query1.getImportancy().age = 0;
                query1.addFilterQuery("content_type:document");
                query1.setFilterQueryFromArray(vm.data.keywords);
                query1.addFacetRange("points", "num_total_points", 0, 500, 25, undefined, 0);
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "points", {blockParent: "content_type:sourceitem"});
                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["points"]["buckets"], function (value) {
                            if (value.frontpage !== undefined) {
                                angular.forEach(value.frontpage.buckets, function (value_fp) {
                                    if (value_fp.val === true) {
                                        vm.chartdata[0].values.push([value.val, value_fp.count]);
                                    } else {

                                        vm.chartdata[1].values.push([value.val, value_fp.count]);
                                    }
                                });
                            } else {
                                vm.chartdata[0].values.push([value.val, null]);
                                vm.chartdata[1].values.push([value.val, null]);
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
