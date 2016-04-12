(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('weekdayChart', weekdayChart);

    /** @ngInject */
    function weekdayChart(SolrRequest) {
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

            var dayNameToInt = {
                'Monday': 0,
                'Tuesday': 1,
                'Wednesday': 2,
                'Thursday': 3,
                'Friday': 4,
                'Saturday': 5,
                'Sunday': 6
            };
            var intDayToStringDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            vm.addKeyword = function(objKeyword) {
                this.data.keywords.push(objKeyword);
            };

            vm.options = {
                chart: {
                    type: 'multiBarChart',
                    height: 500,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 50,
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
                                    type: $filter("filter")(vm.data.keywordTypes, {typeValue: 'found_weekdays_ss'})[0],
                                    keyword: intDayToStringDay[e.data[0]]
                                });
                                $scope.$apply();
                                vm.loadChart();
                            }

                        }
                    },
                    duration: 1000,
                    useInteractiveGuideline: true,
                    xAxis: {
                        tickValues: [0, 1, 2, 3, 4, 5, 6],
                        tickFormat: function (d) {
                            return intDayToStringDay[d];
                        },
                        axisLabel: 'Days of the Week'
                    },
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        },
                        axisLabel: 'Number of Documents'
                    },
                    sortDescending: false
                },
                title: {
                    enable: true,
                    text: 'Weekday Chart'
                },
                subtitle: {
                    enable: true,
                    text: 'This charts shows on which weekday how many submitted links were upvotes until the frontpage and how many never made it there. It is sorted from the highest amount per weekday to the lowest. Sidenote: If you select documents which are posted on e.g. Monday, then you can see when the documents have been crossposted as well.',
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

                query1.addFacetTerms("day_of_the_week", "found_weekdays_ss", 7, 1, undefined, undefined, {count:"desc"});
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "day_of_the_week", {blockParent: "content_type:sourceitem"});
                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["day_of_the_week"]["buckets"], function (value, key) {
                            if (value.frontpage !== undefined) {
                                angular.forEach(value.frontpage.buckets, function (value_fp) {
                                    if (value_fp.val === true) {
                                        vm.chartdata[0].values.push([dayNameToInt[value.val], value_fp.count]);
                                    } else {
                                        vm.chartdata[1].values.push([dayNameToInt[value.val], value_fp.count]);
                                    }
                                });
                            } else {
                                vm.chartdata[0].values.push([dayNameToInt[value.val], null]);
                                vm.chartdata[1].values.push([dayNameToInt[value.val], null]);
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
