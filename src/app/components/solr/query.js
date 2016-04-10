/**
 * Created by Thomas on 01.04.2016.
 */

'use strict';

function SolrQuery() {
    this.importancy = {
        'points': 2.5,
        'age': 2.5
    };
    this.filterQuery = [];
    this.facetQuery = {};
    this.fromDate = null;
    this.toDate = null;

    this.keywords = '';
    this.rows = 10;

}

SolrQuery.prototype.setRows = function (rows) {
    this.rows = rows;
};

SolrQuery.prototype.setFilterQuery = function (name, filterQuery) {
    this.filterQueries[name] = filterQuery;
};

SolrQuery.prototype.getFilterQueries = function () {
    return this.filterQueries
};

SolrQuery.prototype.getRows = function () {
    return this.rows;
};


SolrQuery.prototype.getHttpRequestParamObject = function () {
    var objParams = {
        'q': this.getQueryString(),
        'rows': this.rows
    };

    objParams = this.getFilterQueryObject(objParams);

    if (this.facetQuery !== {}) {
        objParams.facetting = this.getFacetQueryJson();
    }
    return objParams;
};

SolrQuery.prototype.getQueryString = function () {
    var queryString = '';
    if (this.importancy.points !== 0 || this.importancy.age !== 0) {
        queryString += '( ';
        if (this.importancy.points > 0) {
            queryString += '_val_:"log(add(1,num_total_points))"^' + this.importancy.points * 3 + ' ';
        }

        if (this.importancy.age > 0) {
            queryString += '_val_:"recip(ms(NOW/HOUR,created_at),3.16e-11,2700,1)"^' + this.importancy.age + ' ';
        }

        queryString += ' )';

    }


    if (this.keywords.length > 0) {
        queryString += ' ' + this.keywords + ' ';
    }

    return queryString;
};


SolrQuery.prototype.getFilterQueryObject = function (objParams) {

    var filterQueryObject = objParams || {};
    var filterQueryKeyInt = 0;
    for (var i = 0; i < this.filterQuery.length; i++) {
        filterQueryObject['fq[' + filterQueryKeyInt + ']'] = this.filterQuery[i];
        filterQueryKeyInt++;
    }

    if (this.fromDate instanceof Date || this.toDate instanceof Date) {
        var queryString = 'created_at:[';
        if (this.fromDate instanceof Date) {
            queryString += this.fromDate.toISOString();
        } else {
            queryString += '*';
        }
        queryString += ' TO ';

        if (this.toDate instanceof Date) {
            queryString += this.toDate.toISOString();
        } else {
            queryString += '*';
        }
        queryString += ']';

        filterQueryObject['fq[' + filterQueryKeyInt + ']'] = queryString;
        filterQueryKeyInt++;
    }

    return filterQueryObject;
};

SolrQuery.prototype.solrEscape = function (inputValue) {
    var match = ['\\', '+', '-', '&', '|', '!', '(', ')', '{', '}', '[', ']', '^', '~', '*', '?', ':', '"', ';', ' '];
    var replace = ['\\\\', '\\+', '\\-', '\\&', '\\|', '\\!', '\\(', '\\)', '\\{', '\\}', '\\[', '\\]', '\\^', '\\~', '\\*', '\\?', '\\:', '\\"', '\\;', '\\ '];

    for (var i = 0; i < match.length; i++) {
        inputValue = inputValue.replace(match[i], replace[i]);
    }

    return inputValue;

};

SolrQuery.prototype.setFilterQueryFromArray = function (arrayValues) {

    var query1 = this;
    angular.forEach(arrayValues, function (value) {
        if (value.keyword == "") {
            return;
        }
        if (value.type.type == 'text') {
            query1.addFilterQuery(value.type.prefix + query1.solrEscape(value.keyword) + value.type.postfix);
        } else if (value.type.type == 'datepicker') {
            query1.addFilterQuery(value.type.prefix + value.keyword.toISOString() + value.type.postfix);
        } else if (value.type.type == 'slider') {
            query1.addFilterQuery(value.type.prefix + value.keyword + value.type.postfix);
        } else if (value.type.type == 'select') {
            query1.addFilterQuery(value.type.prefix + value.keyword + value.type.postfix);
        }

        if (value.type.override !== undefined) {
            vm[value.type.override] = value.keyword;
        }
    });
};


SolrQuery.prototype.addFilterQuery = function (filter) {
    //do nothing if entity is already in the list
    for (var i = 0; i < this.filterQuery.length; i++) {
        if (this.filterQuery[i] == filter) {
            return false;
        }
    }

    this.filterQuery.push(filter);
    return true;
};

SolrQuery.prototype.getFacetQueryJson = function () {
    return JSON.stringify(this.facetQuery);
};

SolrQuery.prototype.addFacetTerms = function (name, field, limit, mincount, parent, domain, sort) {

    var facetQuery = {};
    facetQuery.type = "terms";
    facetQuery.field = field;
    if (limit !== undefined && limit >= 0) {
        facetQuery.limit = limit;
    }
    if (mincount !== undefined && mincount >= 0) {
        facetQuery.mincount = mincount;
    }
    if (domain !== undefined) {
        facetQuery.domain = domain;
    }
    if (sort !== undefined) {
        facetQuery.sort = sort;
    }

    if (parent !== undefined && this.facetQuery[parent] !== undefined) {
        if (this.facetQuery[parent].facet == undefined) {
            this.facetQuery[parent].facet = {};
        }
        this.facetQuery[parent]["facet"][name] = facetQuery;
    } else {
        this.facetQuery[name] = facetQuery;
    }
};

SolrQuery.prototype.addFacetRange = function (name, field, start, end, gap, limit, mincount, parent) {

    var facetQuery = {};
    facetQuery.type = "range";
    facetQuery.field = field;
    facetQuery.start = start;
    facetQuery.end = end;
    facetQuery.gap = gap;
    if (limit !== undefined && limit >= 0) {
        facetQuery.limit = limit;
    }
    if (mincount !== undefined && mincount >= 0) {
        facetQuery.mincount = mincount;
    }

    if (parent !== undefined && this.facetQuery[parent] !== undefined) {
        this.facetQuery[parent]["facet"][name] = facetQuery;
    } else {
        this.facetQuery[name] = facetQuery;
    }
};
SolrQuery.prototype.addFacetFunction = function (fieldName, functionName, parent) {
    if (parent !== undefined && this.facetQuery[parent] !== undefined) {
        this.facetQuery[parent]["facet"][fieldName] = functionName;
    }
};

SolrQuery.prototype.removeFilterQueryByIndex = function (index) {
    if (this.filterQuery[index] !== undefined) {
        this.filterQuery.splice(index, 1);
    }
};

SolrQuery.prototype.getFilterQueryIndexFromString = function (string) {
    for (var i = 0; i < this.filterQuery.length; i++) {
        if (this.filterQuery[i] === string) {
            return i;
        }
    }
};

SolrQuery.prototype.setKeywords = function (keywords) {
    if (keywords === undefined || keywords.length <= 0) {
        this.keywords = "*:*"
    } else {
        this.keywords = keywords;
    }
};
SolrQuery.prototype.getImportancy = function () {
    return this.importancy;
};


SolrQuery.prototype.resetQuery = function () {

    this.importancy = {
        'points': 2.5,
        'age': 2.5
    };
    this.filterQuery = [];
    this.fromDate = null;
    this.toDate = null;

    this.keywords = '';
    this.rows = 10;

};


