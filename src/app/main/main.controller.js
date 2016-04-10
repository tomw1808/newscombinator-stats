(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(SolrRequest, $filter) {
        var vm = this;

        vm.keywords = [];
        vm.keywordsStore = [];

        vm.keywordTypes = [
            {typeValue: "general", typeName: "Any Document-Field", prefix: "", postfix: "", type: "text"},
            {typeValue: "linkTitle", typeName: "Link Title", prefix: "title_link:", postfix: "", type: "text"},
            {typeValue: "language", typeName: "Language (e.g. en)", prefix: "language:", postfix: "", type: "text"},
            {
                typeValue: "found_weekdays_ss",
                typeName: "Day of the Week (e.g. Sunday)",
                prefix: "found_weekdays_ss:",
                postfix: "",
                type: "select",
                values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            },
            {
                typeValue: "found_hours_is",
                typeName: "Hour of the Day (e.g. '14' for 2pm)",
                prefix: "found_hours_is:",
                postfix: "",
                type: "select",
                values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
            },
            {typeValue: "url", typeName: "Url", prefix: "url:", postfix: "", type: "text"},
            {
                typeValue: "source",
                typeName: "Source-Portal (e.g. reddit.com)",
                prefix: 'source_sites_ss:*',
                postfix: '*',
                type: "text",
                values: ["ycombinator.com", "reddit.com", "coinspotting.com", "firespotting.com", "sec.gov", "lobste.rs", "makerland.org", "slashdot.org", "soylendnews.org"]
            },
            {
                typeValue: "notSource",
                typeName: "Exclude Source-Portal",
                prefix: '-source_sites_ss:*',
                postfix: '*',
                type: "text"
            },
            {
                typeValue: "minPoints",
                typeName: "Min Upvotes",
                prefix: "num_total_points:[",
                postfix: " TO *]",
                type: "slider",
                step: 5,
                min: 0,
                max: 1000
            },
            {
                typeValue: "maxPoints",
                typeName: "Max Upvotes",
                prefix: "num_total_points:[* TO ",
                postfix: "]",
                type: "slider",
                step: 5,
                min: 0,
                max: 1000
            },
            {
                typeValue: "startDate",
                typeName: "Start Date",
                prefix: "created_at:[",
                postfix: " TO *]",
                type: "datepicker"
            },
            {
                typeValue: "endDate",
                typeName: "End Date",
                prefix: "created_at:[* TO ",
                postfix: " ]",
                type: "datepicker"
            }

        ];
        vm.keywordsAny = [];
        vm.keywordsLinkTitle = [];
        vm.keywordsUrl = "";
        vm.tags = [];


        vm.directivedata = {
            keywords: vm.keywords,
            keywordTypes: vm.keywordTypes
        };


        vm.addKeyword = function () {
            vm.keywords.push({type: vm.keywordTypes[0], keyword: ""});
        };


        vm.charts = [];
        vm.charts[0] = {};
        vm.charts[0].options = {
            chart: {
                lines: {
                    dispatch: {
                        elementClick: function (e) {
                            console.log(e)
                        }
                    }
                }, interactiveLayer: {
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
                text: 'Number of Documents per Points'
            },
            subtitle: {
                enable: true,
                text: 'This shows the number of documents that received a certain number of points (upvotes) or comments.',
                css: {
                    'text-align': 'center',
                    'margin': '10px 13px 0px 7px',
                    'font-size': '80%'
                }
            }
        };

        vm.charts[2] = {
            options: {
                chart: {
                    type: 'stackedAreaChart',
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
                    useVoronoi: false,
                    clipEdge: true,
                    duration: 100,
                    useInteractiveGuideline: true,
                    xAxis: {
                        expanded: true,
                        showMaxMin: true,
                        tickFormat: function (d) {
                            return d3.time.format('%B %Y')(new Date(d));
                        }

                    },
                    yAxis: {
                        tickFormat: function (d) {
                            return d3.format('s')(d);
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Number of Documents which landed on the Frontpage vs. Links which never made it there.'
                },
                subtitle: {
                    enable: true,
                    text: 'Between two Dates.',
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px',
                        'font-size': '80%'
                    }
                }
            }
        };
        vm.charts[3] = {
            options: {
                chart: {
                    type: 'pieChart',
                    height: 350,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: true,
                    duration: 1000,
                    labelThreshold: 1,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    },
                    // line chart events
                    pie: {
                        dispatch: {
                            elementClick: function (e) {
                                vm.keywords.push({
                                    type: $filter("filter")(vm.keywordTypes, {typeValue: 'language'})[0],
                                    keyword: e.data.key
                                });
                                vm.loadChart();
                            }
                        }
                    }
                },
                title: {
                    enable: true,
                    text: 'Language of the Documents found.'
                }
            }
        };
        vm.charts[4] = {
            options: {
                chart: {
                    type: 'pieChart',
                    height: 350,
                    x: function (d) {
                        return d.key;
                    },
                    y: function (d) {
                        return d.y;
                    },
                    showLabels: true,
                    duration: 1000,
                    labelThreshold: 1,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    },
                    // line chart events
                    pie: {
                        dispatch: {
                            elementClick: function (e) {
                                vm.keywords.push({
                                    type: $filter("filter")(vm.keywordTypes, {typeValue: 'source'})[0],
                                    keyword: e.data.key
                                });
                                vm.loadChart();
                            }
                        }
                    }
                }
            }
        };
        vm.charts[5] = {
            options: {
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
            }
        };

        vm.charts[0].data = [{values: [], key: 'Points'}, {values: [], key: 'Comments'}];

        vm.charts[2].data = [{values: [], key: 'On Frontpage'}, {values: [], key: 'Not On Frontpage'}];
        vm.charts[3].data = [];

        vm.keyword_charts = [];

        vm.loadChart = function () {

            var query1 = new SolrQuery();
            query1.setKeywords("*:*");
            query1.getImportancy().points = 5;
            query1.getImportancy().age = 0;
            query1.addFilterQuery("content_type:document");
            query1.setFilterQueryFromArray(vm.keywords);

            query1.addFacetTerms("keywords", "title_terms", 20, 1, undefined);
            query1.addFacetTerms("frontpage", "on_frontpage", 2, 0, "keywords", {blockParent: "content_type:sourceitem"});


            query1.addFacetTerms("language", "language", 6, 1);
            query1.addFacetTerms("baseurl", "baseurl", 10, 1, undefined, {blockParent: "content_type:sourceitem"});
            var solrReq_1 = new SolrRequest.Instance();
            solrReq_1.setQuery(query1);

            solrReq_1.loadNews().then(function () {
                vm.charts[0].data[0].values = [];
                vm.charts[0].data[1].values = [];
                vm.charts[2].data[0].values = [];
                vm.charts[2].data[1].values = [];
                vm.charts[3].data = [];
                vm.charts[4].data = [];
                vm.keyword_charts = [];
                vm.topResults = solrReq_1.getResults();
                console.log(vm.topResults);

                angular.forEach(solrReq_1.getFacets()["language"]["buckets"], function (value) {
                    vm.charts[3].data.push({key: value.val, y: value.count});
                });
                angular.forEach(solrReq_1.getFacets()["baseurl"]["buckets"], function (value) {
                    vm.charts[4].data.push({key: value.val, y: value.count});
                });
                angular.forEach(solrReq_1.getFacets()["keywords"]["buckets"], function (value) {
                    var chardata = [];
                    angular.forEach(value.frontpage.buckets, function (val_frontpage) {
                        if (val_frontpage.val == false) {
                            chardata.push({key: "Not on Frontpage", y: val_frontpage.count});
                        } else {
                            chardata.push({key: "On Frontpage", y: val_frontpage.count});
                        }
                    });
                    vm.keyword_charts.push({keyword: value, chartdata: chardata});

                });


            });

        };

        vm.loadChart();

    }
})();
