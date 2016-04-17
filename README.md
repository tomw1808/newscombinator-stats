# Summary
This repository is dedicated to provide some interactive statistics. The links come from submissions on Hacker News, Reddit, Inbound and others and were crawled by The Newscombinator. It provides (Keyword and other) Statistics of around 1 Million links, browseable and filterable in a nice manner. We use it internally, mostly. 

![newscombinator-stats](https://github.com/tomw1808/newscombinator-stats/blob/master/src/assets/images/demo.gif "Newscombinator Stats Demo")

A saying among data scientists is "Know you data". Statistics doesn't have to be that ugly, or? So this tool is used internally to get a better picture of the data in the index.

# Used Technologies
This frontend uses AngularJS and Material. It is basically the gulp-angular generator from yeoman.

On the backend there is a custom crawler, and a Lucene Index with a Solr Server on top. In addition, to filter the data for the [Smart-Filters](http://www.newscombinator.com/smartfilters), machine learning (LibLINEAR) is applied to the dataset. 

For the Stats-App, the Solr-Facetting is used in its newest incarnation: json.facet. This is supported by Solr >5 and you can read more about that [here](http://yonik.com/json-facet-api/).

# Demo

[Click here](http://tomw1808.github.io/newscombinator-stats/#/)

or

# Clone and install

    git clone...
    bower install
    npm install
    gulp serve
    
   
    
# Gaps and Problems
There are some gaps in the data in Jan/Feb 2016, where the database went down because of severe data loss. We couldn't crawl anything, nor save anything. After everything moved to new servers it is back up and running.

# Questions
contact me at thomas at newscombinator . com

checkout my other Projects.
