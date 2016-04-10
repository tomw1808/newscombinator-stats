(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('documentsPerPointsChart',documentsPerPointsChart);

    /** @ngInject */
    function documentsPerPointsChart(SolrRequest) {
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
                    lines: {
                        dispatch: {
                            elementClick: function (e) {
                                console.log(e)
                            }
                        }
                    },
                    interactiveLayer: {
                        tooltip: {
                            contentGenerator: function (d) {
                                var lowerNumber = (d.value) + " to " + (d.value + 25);

                                return '<h3>Number of Documents</h3>' +
                                    '<br />' + d.series[0].value + ' Links with ' + (lowerNumber) + ' ' + d.series[0].key +
                                    '<br />' + d.series[1].value + ' Links with ' + (lowerNumber) + ' ' + d.series[1].key;
                            }
                        }
                    },

                    type: 'lineChart',
                    height: 400,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 80,
                        left: 70
                    },
                    x: function (d) {
                        return d.x;
                    },
                    xAxis: {
                        axisLabel: '#Documents with #Points/#Comments across Aggregators (Ycombinator, Reddit,...)',
                        rotateLabels: -45
                    },
                    y: function (d) {
                        return d.y;
                    },
                    useInteractiveGuideline: true,
                    duration: 1000,
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Number of Documents per Points/Comments'
                },
                subtitle: {
                    enable: true,
                    text: 'This shows the number of documents that received a certain number of points (upvotes) or comments. It is in 25 increments (0-24, 25-49,...)',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px',
                        'font-size': '80%'
                    }
                }
            };

            vm.chartdata = [{values: [], key: 'Points'}, {values: [], key: 'Comments'}];

            vm.loadChart = function () {

                var query1 = new SolrQuery();
                query1.setKeywords("*:*");
                query1.getImportancy().points = 0;
                query1.getImportancy().age = 0;
                query1.addFilterQuery("content_type:document");
                query1.setFilterQueryFromArray(vm.data.keywords);
                query1.addFacetRange("points", "num_total_points", 0, 500, 25, undefined, 0);
                query1.addFacetRange("comments", "num_total_comments", 0, 500, 25, undefined, 0);
                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                solrReq_1.loadNews().then(function () {

                    vm.chartdata[0].values = [];
                    vm.chartdata[1].values = [];
                    if (solrReq_1.getFacets().count > 0) {
                        angular.forEach(solrReq_1.getFacets()["points"]["buckets"], function (value) {
                            vm.chartdata[0].values.push({x: value.val, y: value.count});
                        });
                        angular.forEach(solrReq_1.getFacets()["comments"]["buckets"], function (value) {
                            vm.chartdata[1].values.push({x: value.val, y: value.count});
                        });

                    }
                });
            };

            $scope.$watch("vm.data.keywords", vm.loadChart, true);
            $scope.$watch("vm.data", vm.loadChart);

        }

    }

})();
