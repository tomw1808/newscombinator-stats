(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('hoursChart', hoursChart);

    /** @ngInject */
    function hoursChart(SolrRequest) {
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
        function ChartController($scope, $filter) {

            var vm = this;

            vm.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 450,
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
                    multibar: {
                        dispatch: {
                            elementClick: function (e) {
                                vm.data.keywords.push({
                                    type: $filter("filter")(vm.data.keywordTypes, {typeValue: 'found_hours_is'})[0],
                                    keyword: e.data[0]
                                });
                                $scope.$apply();
                                vm.loadChart();
                            }

                        }
                    },
                    duration: 1000,
                    useInteractiveGuideline: true,
                    reduceXTicks: false,
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Hour of the day chart'
                },
                subtitle: {
                    enable: true,
                    text: 'This chart shows at which time of the day how many documents landed on the frontpage and which ones not.',
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

                query1.addFacetTerms("hours_of_the_day", "found_hours_is", 24, 1, undefined, undefined, {index: "asc"});
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "hours_of_the_day", {blockParent: "content_type:sourceitem"});
                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                console.log(query1);
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["hours_of_the_day"]["buckets"], function (value) {
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

            $scope.$watch("vm.data.keywords", vm.loadChart, true);
            $scope.$watch("vm.data", vm.loadChart);

        }

    }

})();
