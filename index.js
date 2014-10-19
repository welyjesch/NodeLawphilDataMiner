var $ = require('cheerio')
var request = require('request')
var fs = require('fs-extra')
var util = require('util')


function getMonthCaseLinks(err, resp, html) {
    var case_links = []

    if (err) return console.error(err)

    var parsedHTML = $.load(html)
    var urlpath = resp.request.uri.href;

    parsedHTML('td a[href]').map(function(i, link) {
        var href = $(link).attr('href')
        if (!href.match('.html')) return
        var case_link = urlpath.slice(0, urlpath.length - 12) + href
        if (case_links.indexOf(case_link) == -1) {
            case_links.push(case_link)
        }
    })

    var case_links_filename = 'cases/' + parsedHTML('title').text().replace(/\D/g, '') + '/' + parsedHTML('title').text()
    fs.outputFile(case_links_filename, case_links.join('\n'), function(err) {
         if (err) console.log(err)
    })
}

function getMonthLinks(err, resp, html) {
    var month_links = []

    if (err) return console.error(err)

    var parsedHTML = $.load(html)
    var urlpath = resp.request.uri.href;

    parsedHTML('a.off').map(function(i, link) {
        var href = $(link).attr('href')
        if (!href.match('.html')) return
        var month_link = urlpath.slice(0, urlpath.length - 13) + href
        if (month_links.indexOf(month_link) == -1) {
            month_links.push(month_link)
        }
    })

    for (x in month_links) {
      request(month_links[x], getMonthCaseLinks)
    } 

    var month_link_filename = parsedHTML('title').text().replace(/\D/g, '') + '.txt'

    fs.outputFile('links/' + month_link_filename, month_links.join('\n'), function(err) {
        if (err) console.log(err)
    })
}

function getYearLinks(err, resp, html) {
    var year_links = []

    if (err) return console.error(err)

    var parsedHTML = $.load(html)

    parsedHTML('a.off_n1').map(function(i, link) {
        var href = $(link).attr('href')
        if (!href.match('.html')) return
        var year_link = domain + href
        year_links.push(year_link)
    })

    for (x in year_links) {
      // jbymu = jurisprudence (sorted) by year and its month urls
      request(year_links[x], getMonthLinks)
    } 
}

// start of scraping
fs.exists('cases', function (exists) {
  util.debug(exists ? "it's there" : "no passwd!");
  if (!exists) {
    var domain = 'http://www.lawphil.net/judjuris/'
    request(domain + 'judjuris.html', getYearLinks)
  } else {
    fs.readdir('cases', function(err, files) {
        console.log(files)
    })
  }
});

