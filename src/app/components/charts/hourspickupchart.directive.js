(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('hoursPickupChart', hoursPickupChart);

    /** @ngInject */
    function hoursPickupChart(SolrRequest) {
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
                    type: 'multiChart',
                    height: 500,
                    margin: {
                        top: 20,
                        right: 60,
                        bottom: 50,
                        left: 70
                    },
                    duration: 1000,
                    reduceXTicks: false,
                    useInteractiveGuideline: true,
                    bars1: {
                        stacked: true,
                        dispatch: {
                            elementClick: function(e) {
                                var found = false;
                                angular.forEach(vm.data.keywords, function(value) {
                                    if(value.type.typeValue == 'found_hours_is') {
                                        found = true;
                                        value.keyword = e.data.x;
                                    }

                                });
                                if(!found) {
                                    vm.data.keywords.push({
                                        type: $filter("filter")(vm.data.keywordTypes, {typeValue: 'found_hours_is'})[0],
                                        keyword: e.data.x
                                    });
                                }
                                //$scope.$apply();
                                vm.loadChart();
                            }
                        }
                    },
                    yAxis1: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        },
                        axisLabel: 'Number of Documents'
                    },
                    yAxis2: {
                        tickFormat: function (d) {
                            return d+"%";
                        },
                        axisLabel: 'Pickup Rate'
                    },
                    xAxis: {

                        axisLabel: 'Hours of the Day'
                    }
                },
                title: {
                    enable: true,
                    text: 'Hour of the day chart'
                },
                subtitle: {
                    enable: true,
                    text: 'This chart shows at which time of the day how many submitted links landed on the frontpage and which ones not. If documents are submitted twice and one time it reaches the frontpage and one time it will not make it there, it will be counted twice.',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px',
                        'font-size': '80%'
                    }
                }
            };

            vm.chartdata = [{values: [], key: 'On Frontpage', yAxis:1, type:'bar'}, {values: [], key: 'Not On Frontpage', yAxis:1, type:'bar'}, {values: [], key: 'Pickup Rate', yAxis:2, type:'line'}];

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
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    vm.chartdata[2].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["hours_of_the_day"]["buckets"], function (value) {
                            if (value.frontpage !== undefined) {
                                var on_frontpage = 0;
                                var not_on_frontpage = 0;

                                angular.forEach(value.frontpage.buckets, function (value_fp) {
                                    if (value_fp.val === true) {
                                        vm.chartdata[0].values.push({x :value.val, y:value_fp.count});
                                        on_frontpage = value_fp.count;
                                    } else {
                                        vm.chartdata[1].values.push({x :value.val, y:value_fp.count});
                                        not_on_frontpage = value_fp.count;
                                    }
                                });

                                vm.chartdata[2].values.push({x: value.val, y: Math.round((on_frontpage / (not_on_frontpage+on_frontpage))*100)});
                            } else {
                                vm.chartdata[0].values.push({x :value.val, y:0});
                                vm.chartdata[1].values.push({x :value.val, y:null});
                                vm.chartdata[2].values.push({x :value.val, y:null});
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
