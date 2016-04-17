(function () {
    'use strict';

    angular
        .module('newscombinatorKeywords')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($filter) {
        var vm = this;

        vm.keywords = [];

        vm.keywordTypes = [
            {typeValue: "general", typeName: "Any Document-Field", prefix: "", postfix: "", type: "text"},
            {typeValue: "notGeneral", typeName: "Exclude Keyword", prefix: "-(", postfix: ")", type: "text"},
            {typeValue: "linkTitle", typeName: "Link Title", prefix: "title_link:", postfix: "", type: "text"},
            {typeValue: "notLinkTitle", typeName: "Exclude Link Title", prefix: "-title_link:", postfix: "", type: "text"},
            {typeValue: "language", typeName: "Language (e.g. en)", prefix: "language:", postfix: "", type: "text"},
            {
                typeValue: "found_weekdays_ss",
                typeName: "Day of the Week (e.g. Sunday)",
                prefix: "found_weekdays_ss:",
                postfix: "",
                type: "select",
                values: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            }, {
                typeValue: "not_found_weekdays_ss",
                typeName: "NOT at that Day of the Week",
                prefix: "-found_weekdays_ss:",
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
        vm.directivedata = {
            keywords: vm.keywords,
            keywordTypes: vm.keywordTypes
        };

        vm.examplePickupRate = function () {

            vm.keywords.push({
                type: $filter("filter")(vm.keywordTypes, {typeValue: 'source'})[0],
                keyword: "https://news.ycombinator.com"
            });
            vm.keywords.push({
                type: $filter("filter")(vm.keywordTypes, {typeValue: 'linkTitle'})[0],
                keyword: "Show HN"
            });
            vm.keywords.push({
                type: $filter("filter")(vm.keywordTypes, {typeValue: 'startDate'})[0],
                date: new Date(2016,2,1)
            });

        };


        vm.addKeyword = function () {
            vm.keywords.push({type: vm.keywordTypes[0], keyword: ""});
        };


    }
})();
