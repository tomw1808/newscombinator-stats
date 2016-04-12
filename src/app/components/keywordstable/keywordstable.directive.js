(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .directive('keywordsTable', dateChart);

    /** @ngInject */
    function dateChart(SolrRequest) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/keywordstable/keywordstable.html',
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
            vm.chartoptions = {
                chart: {
                    type: 'pieChart',
                    height: 150,
                    width: 150,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: false,
                    duration: 1000,
                    labelThreshold: 1,
                    labelSunbeamLayout: true,
                    showLegend: false
                }

            };

            vm.keywordsdata = [];

            vm.addKeyword = function (word) {

                vm.data.keywords.push({
                    type: $filter("filter")(vm.data.keywordTypes, {typeValue: 'general'})[0],
                    keyword: word
                });

                //$scope.$apply();
                vm.loadChart();
            };

            vm.loadChart = function () {

                vm.loading = true;
                var query1 = new SolrQuery();
                query1.setKeywords("*:*");
                query1.getImportancy().points = 5;
                query1.getImportancy().age = 0;
                query1.addFilterQuery("content_type:document");
                query1.addFilterQuery("on_frontpage:1");
                query1.setFilterQueryFromArray(vm.data.keywords);

                query1.setRows(20);
                query1.addFacetTerms("keywords", "title_terms", 30, 1);
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "keywords", {blockParent: "content_type:sourceitem"});

                var solrReq_1 = new SolrRequest.Instance();
                solrReq_1.setQuery(query1);
                solrReq_1.loadNews().then(function () {

                    vm.loading = false;
                    vm.topResults = solrReq_1.getResults();
                    vm.keywordsdata = [];
                    if (solrReq_1.getFacets().count > 0) {

                        angular.forEach(solrReq_1.getFacets()["keywords"]["buckets"], function (value) {
                            var chardata = [];
                            angular.forEach(value.frontpage.buckets, function (val_frontpage) {
                                if (val_frontpage.val == false) {
                                    chardata.push({key: "Not on Frontpage", y: val_frontpage.count});
                                } else {
                                    chardata.push({key: "On Frontpage", y: val_frontpage.count});
                                }
                            });
                            vm.keywordsdata.push({keyword: value, chartdata: chardata});

                        });

                    }
                });

                query1 = new SolrQuery();
                query1.setKeywords("*:*");
                query1.getImportancy().points = 5;
                query1.getImportancy().age = 0;
                query1.addFilterQuery("on_frontpage:0");
                query1.setFilterQueryFromArray(vm.data.keywords);

                query1.setRows(20);
                query1.addFacetTerms("keywords", "title_terms", 30, 1);
                query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "keywords", {blockParent: "content_type:sourceitem"});

                var solrReq_2 = new SolrRequest.Instance();
                solrReq_2.setQuery(query1);
                solrReq_2.loadNews().then(function () {

                    vm.topResults_non_fp = solrReq_2.getResults();
                    vm.keywordsdata_non_fp = [];
                    if (solrReq_2.getFacets().count > 0) {

                        angular.forEach(solrReq_2.getFacets()["keywords"]["buckets"], function (value) {
                            var chardata = [];
                            angular.forEach(value.frontpage.buckets, function (val_frontpage) {
                                if (val_frontpage.val == false) {
                                    chardata.push({key: "Not on Frontpage", y: val_frontpage.count});
                                } else {
                                    chardata.push({key: "On Frontpage", y: val_frontpage.count});
                                }
                            });
                            vm.keywordsdata_non_fp.push({keyword: value, chartdata: chardata});

                        });

                    }
                });
            };

            var loadChartTimeout;

            function loadChartDelayed() {

                vm.loading = true;
                if (loadChartTimeout !== undefined) {
                    $timeout.cancel(loadChartTimeout);
                }
                loadChartTimeout = $timeout(vm.loadChart, 1500);
            }

            $scope.$watch("vm.data", loadChartDelayed, true);
        }

    }

})();
