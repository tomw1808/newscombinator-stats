(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .factory('SolrRequest', solrRequestFactory);

    /** @ngInject */
    function solrRequestFactory($http) {
        function SolrRequest() {

            this.start = 0;
            this.siteState = {loading: false};
            this.expanded = {};
            this.numFound = 0;
            this.maxScore = 0;

            this.news = [];
            this.results = [];
            this.documentIds = [];
            this.facets = {};

            this.solrQuery = new SolrQuery();

        }

        SolrRequest.prototype.setQuery = function (solrQuery) {
            if (!(solrQuery instanceof SolrQuery)) {
                throw "SolrRequest needs a SolrQuery!";
            }

            this.solrQuery = solrQuery;

        };


        SolrRequest.prototype.getLoading = function () {
            return this.siteState.loading;
        };

        SolrRequest.prototype.moreToLoad = function () {
            return this.numFound > this.results.length;
        };

        SolrRequest.prototype.getExpanded = function () {
            return this.expanded;
        };

        SolrRequest.prototype.loadNews = function () {
            var self = this;
            if (this.siteState.loading !== true) {
                this.siteState.loading = true;

                return $http({
                    method: 'GET',
                    url: "http://www.newscombinator.com/api/statistics",
                    params: this.solrQuery.getHttpRequestParamObject()
                }).then(function (result) {

                    self.results = result.data.response.docs;
                    for (var i = 0; i < self.results.length; i++) {
                        self.documentIds.push(self.results[i].id);
                    }
                    self.expanded = result.data.expanded || {};
                    self.facets = result.data.facets || {};
                    self.start = result.data.response.docs.length;
                    self.numFound = result.data.response.numFound;
                    self.maxScore = result.data.response.maxScore;
                    self.siteState.loading = false;
                }, function (errorResponse) {
                    console.error(errorResponse);
                    self.siteState.loading = false;
                });
            }
        };

        SolrRequest.prototype.getResults = function () {
            return this.results;
        };
        SolrRequest.prototype.getFacets = function () {
            return this.facets;
        };

        SolrRequest.prototype.nextPage = function () {
            var self = this;
            if (this.siteState.loading !== true && this.start > 0 && this.documentIds.length < this.numFound) {
                this.siteState.loading = true;

                var params = QueryService.getHttpRequestParamObject();
                params.start = this.start;
                $http({
                    method: 'GET',
                    url: ENV.searchEndpoint + 'search/',
                    params: params
                }).then(function (result) {
                    var items = result.data.response.docs;
                    for (var i = 0; i < items.length; i++) {
                        if (self.documentIds.indexOf(items[i].id) === -1) {
                            this.results.push(items[i]);
                            self.documentIds.push(items[i].id);
                        }
                    }
                    //angular.extend(this.results, response.response.docs);
                    angular.extend(this.expanded, result.data.expanded);
                    angular.extend(this.facets, result.data.facets);
                    self.start = this.results.length;
                    self.siteState.loading = false;

                }, function (errorResponse) {
                    console.error(errorResponse);
                    self.siteState.loading = false;
                });
            }
        };

        SolrRequest.prototype.reset = function () {
            this.start = 0;
            this.siteState = {loading: false};
            this.expanded = {};
            this.numFound = 0;
            this.maxScore = 0;

            this.news = [];
            this.results = [];
            this.documentIds = [];
        };

        return {
            Instance: SolrRequest
        }
    }
})();