// ==UserScript==
// @name         Tweetdeck Userscript
// @namespace    http://web.tweetdeck.com/
// @version      2.1.3.3
// @description  Add a trending topics column to tweetdeck
// @include      https://web.tweetdeck.com/*
// @run-at       document-end
// @updateURL    http://www.willhawker.com/sites/default/files/js/tampermonkey.user.js
// @copyright    2012+, William Hawker (willhawker.com)
// ==/UserScript==
//Trends column extension by Will Hawker (www.willhawker.com || www.github.com/whawker/TweetDeck-Chrome-Trends)
var trendsColInterval = setInterval((function(){ if(typeof(unsafeWindow.TD) != 'undefined' && unsafeWindow.TD.ready === true) { clearInterval(trendsColInterval); trendsColInit(unsafeWindow) } }), 10);
function trendsColInit(window){
    var TD = window.TD,
        _gaq = window._gaq;
        $ = window.$;
    TD.extensions = {};
    TD.extensions.Trends = function() {
        var a = {},
        handle='',
        refreshTime = 300000,
        location = 23424975,
        filters = [],
        scheduledUpdates = [],
        trendLocations = [{
            "name": "Argentina",
            "woeid": 23424747,
            "children": [{
                "name": "Buenos Aires",
                "woeid": 468739
            }, {
                "name": "Córdoba",
                "woeid": 466861
            }, {
                "name": "Mendoza",
                "woeid": 332471
            }, {
                "name": "Rosario",
                "woeid": 466862
            }]
        }, {
            "name": "Australia",
            "woeid": 23424748,
            "children": [{
                "name": "Adelaide",
                "woeid": 1099805
            }, {
                "name": "Brisbane",
                "woeid": 1100661
            }, {
                "name": "Canberra",
                "woeid": 1100968
            }, {
                "name": "Darwin",
                "woeid": 1101597
            }, {
                "name": "Melbourne",
                "woeid": 1103816
            }, {
                "name": "Perth",
                "woeid": 1098081
            }, {
                "name": "Sydney",
                "woeid": 1105779
            }]
        }, {
            "name": "Brazil",
            "woeid": 23424768,
            "children": [{
                "name": "Belo Horizonte",
                "woeid": 455821
            }, {
                "name": "Belém",
                "woeid": 455820
            }, {
                "name": "Brasília",
                "woeid": 455819
            }, {
                "name": "Campinas",
                "woeid": 455828
            }, {
                "name": "Curitiba",
                "woeid": 455822
            }, {
                "name": "Fortaleza",
                "woeid": 455830
            }, {
                "name": "Goiânia",
                "woeid": 455831
            }, {
                "name": "Guarulhos",
                "woeid": 455867
            }, {
                "name": "Manaus",
                "woeid": 455833
            }, {
                "name": "Porto Alegre",
                "woeid": 455823
            }, {
                "name": "Recife",
                "woeid": 455824
            }, {
                "name": "Rio de Janeiro",
                "woeid": 455825
            }, {
                "name": "Salvador",
                "woeid": 455826
            }, {
                "name": "São Luís",
                "woeid": 455834
            }, {
                "name": "São Paulo",
                "woeid": 455827
            }]
        }, {
            "name": "Canada",
            "woeid": 23424775,
            "children": [{
                "name": "Calgary",
                "woeid": 8775
            }, {
                "name": "Edmonton",
                "woeid": 8676
            }, {
                "name": "Montreal",
                "woeid": 3534
            }, {
                "name": "Ottawa",
                "woeid": 3369
            }, {
                "name": "Quebec",
                "woeid": 2344924
            }, {
                "name": "Toronto",
                "woeid": 4118
            }, {
                "name": "Vancouver",
                "woeid": 9807
            }, {
                "name": "Winnipeg",
                "woeid": 2972
            }]
        }, {
            "name": "Chile",
            "woeid": 23424782,
            "children": [{
                "name": "Concepcion",
                "woeid": 349860
            }, {
                "name": "Santiago",
                "woeid": 349859
            }, {
                "name": "Valparaiso",
                "woeid": 349861
            }]
        }, {
            "name": "Colombia",
            "woeid": 23424787,
            "children": [{
                "name": "Bogotá",
                "woeid": 368148
            }]
        }, {
            "name": "Dominican Republic",
            "woeid": 23424800,
            "children": [{
                "name": "Santo Domingo",
                "woeid": 76456
            }]
        }, {
            "name": "Ecuador",
            "woeid": 23424801
        }, {
            "name": "France",
            "woeid": 23424819,
            "children": [{
                "name": "Bordeaux",
                "woeid": 580778
            }, {
                "name": "Lille",
                "woeid": 608105
            }, {
                "name": "Lyon",
                "woeid": 609125
            }, {
                "name": "Marseille",
                "woeid": 610264
            }, {
                "name": "Montpellier",
                "woeid": 612977
            }, {
                "name": "Nantes",
                "woeid": 613858
            }, {
                "name": "Paris",
                "woeid": 615702
            }, {
                "name": "Rennes",
                "woeid": 619163
            }, {
                "name": "Strasbourg",
                "woeid": 627791
            }, {
                "name": "Toulouse",
                "woeid": 628886
            }]
        }, {
            "name": "Germany",
            "woeid": 23424829,
            "children": [{
                "name": "Berlin",
                "woeid": 638242
            }, {
                "name": "Bremen",
                "woeid": 641142
            }, {
                "name": "Cologne",
                "woeid": 667931
            }, {
                "name": "Dortmund",
                "woeid": 645458
            }, {
                "name": "Dresden",
                "woeid": 645686
            }, {
                "name": "Dusseldorf",
                "woeid": 646099
            }, {
                "name": "Essen",
                "woeid": 648820
            }, {
                "name": "Frankfurt",
                "woeid": 650272
            }, {
                "name": "Hamburg",
                "woeid": 656958
            }, {
                "name": "Leipzig",
                "woeid": 671072
            }, {
                "name": "Munich",
                "woeid": 676757
            }, {
                "name": "Stuttgart",
                "woeid": 698064
            }]
        }, {
            "name": "Guatemala",
            "woeid": 23424834
        }, {
            "name": "India",
            "woeid": 23424848,
            "children": [{
                "name": "Ahmedabad",
                "woeid": 2295402
            }, {
                "name": "Bangalore",
                "woeid": 2295420
            }, {
                "name": "Chennai",
                "woeid": 2295424
            }, {
                "name": "Delhi",
                "woeid": 20070458
            }, {
                "name": "Hyderabad",
                "woeid": 2295414
            }, {
                "name": "Mumbai",
                "woeid": 2295411
            }]
        }, {
            "name": "Indonesia",
            "woeid": 23424846,
            "children": [{
                "name": "Bandung",
                "woeid": 1047180
            }, {
                "name": "Bekasi",
                "woeid": 1030077
            }, {
                "name": "Jakarta",
                "woeid": 1047378
            }, {
                "name": "Surabaya",
                "woeid": 1044316
            }]
        }, {
            "name": "Ireland",
            "woeid": 23424803,
            "children": [{
                "name": "Dublin",
                "woeid": 560743
            }]
        }, {
            "name": "Italy",
            "woeid": 23424853
        }, {
            "name": "Japan",
            "woeid": 23424856,
            "children": [{
                "name": "Fukuoka",
                "woeid": 1117099
            }, {
                "name": "Kyoto",
                "woeid": 15015372
            }, {
                "name": "Nagoya",
                "woeid": 1117817
            }, {
                "name": "Okinawa",
                "woeid": 2345896
            }, {
                "name": "Osaka",
                "woeid": 15015370
            }, {
                "name": "Sapporo",
                "woeid": 1118108
            }, {
                "name": "Sendai",
                "woeid": 1118129
            }, {
                "name": "Takamatsu",
                "woeid": 1118285
            }, {
                "name": "Tokyo",
                "woeid": 1118370
            }]
        }, {
            "name": "Korea",
            "woeid": 23424868
        }, {
            "name": "Malaysia",
            "woeid": 23424901,
            "children": [{
                "name": "Klang",
                "woeid": 1154726
            }, {
                "name": "Kuala Lumpur",
                "woeid": 1154781
            }]
        }, {
            "name": "Mexico",
            "woeid": 23424900,
            "children": [{
                "name": "Mexico City",
                "woeid": 116545
            }, {
                "name": "Monterrey",
                "woeid": 134047
            }]
        }, {
            "name": "Netherlands",
            "woeid": 23424909,
            "children": [{
                "name": "Amsterdam",
                "woeid": 727232
            }, {
                "name": "Den Haag",
                "woeid": 726874
            }, {
                "name": "Rotterdam",
                "woeid": 733075
            }]
        }, {
            "name": "New Zealand",
            "woeid": 23424916
        }, {
            "name": "Nigeria",
            "woeid": 23424908,
            "children": [{
                "name": "Lagos",
                "woeid": 1398823
            }]
        }, {
            "name": "Pakistan",
            "woeid": 23424922
        }, {
            "name": "Peru",
            "woeid": 23424919,
            "children": [{
                "name": "Lima",
                "woeid": 418440
            }]
        }, {
            "name": "Philippines",
            "woeid": 23424934,
            "children": [{
                "name": "Manila",
                "woeid": 1199477
            }, {
                "name": "Quezon City",
                "woeid": 1199682
            }]
        }, {
            "name": "Russia",
            "woeid": 23424936,
            "children": [{
                "name": "Moscow",
                "woeid": 2122265
            }, {
                "name": "Novosibirsk",
                "woeid": 2122541
            }, {
                "name": "Saint Petersburg",
                "woeid": 2123260
            }]
        }, {
            "name": "Singapore",
            "woeid": 23424948
        }, {
            "name": "South Africa",
            "woeid": 23424942,
            "children": [{
                "name": "Johannesburg",
                "woeid": 1582504
            }]
        }, {
            "name": "Spain",
            "woeid": 23424950,
            "children": [{
                "name": "Barcelona",
                "woeid": 753692
            }, {
                "name": "Madrid",
                "woeid": 766273
            }]
        }, {
            "name": "Sweden",
            "woeid": 23424954,
            "children": [{
                "name": "Stockholm",
                "woeid": 906057
            }]
        }, {
            "name": "Turkey",
            "woeid": 23424969,
            "children": [{
                "name": "Ankara",
                "woeid": 2343732
            }, {
                "name": "Istanbul",
                "woeid": 2344116
            }, {
                "name": "Izmir",
                "woeid": 2344117
            }]
        }, {
            "name": "United Arab Emirates",
            "woeid": 23424738
        }, {
            "name": "United Kingdom",
            "woeid": 23424975,
            "children": [{
                "name": "Belfast",
                "woeid": 44544
            }, {
                "name": "Birmingham",
                "woeid": 12723
            }, {
                "name": "Brighton",
                "woeid": 13911
            }, {
                "name": "Bristol",
                "woeid": 13963
            }, {
                "name": "Cardiff",
                "woeid": 15127
            }, {
                "name": "Edinburgh",
                "woeid": 19344
            }, {
                "name": "Glasgow",
                "woeid": 21125
            }, {
                "name": "Leeds",
                "woeid": 26042
            }, {
                "name": "Leicester",
                "woeid": 26062
            }, {
                "name": "Liverpool",
                "woeid": 26734
            }, {
                "name": "London",
                "woeid": 44418
            }, {
                "name": "Manchester",
                "woeid": 28218
            }, {
                "name": "Newcastle",
                "woeid": 30079
            }, {
                "name": "Nottingham",
                "woeid": 30720
            }, {
                "name": "Portsmouth",
                "woeid": 32452
            }, {
                "name": "Sheffield",
                "woeid": 34503
            }]
        }, {
            "name": "United States",
            "woeid": 23424977,
            "children": [{
                "name": "Atlanta",
                "woeid": 2357024
            }, {
                "name": "Austin",
                "woeid": 2357536
            }, {
                "name": "Baltimore",
                "woeid": 2358820
            }, {
                "name": "Baton Rouge",
                "woeid": 2359991
            }, {
                "name": "Birmingham",
                "woeid": 2364559
            }, {
                "name": "Boston",
                "woeid": 2367105
            }, {
                "name": "Charlotte",
                "woeid": 2378426
            }, {
                "name": "Chicago",
                "woeid": 2379574
            }, {
                "name": "Cincinnati",
                "woeid": 2380358
            }, {
                "name": "Cleveland",
                "woeid": 2381475
            }, {
                "name": "Columbus",
                "woeid": 2383660
            }, {
                "name": "Dallas-Ft. Worth",
                "woeid": 2388929
            }, {
                "name": "Denver",
                "woeid": 2391279
            }, {
                "name": "Detroit",
                "woeid": 2391585
            }, {
                "name": "Greensboro",
                "woeid": 2414469
            }, {
                "name": "Harrisburg",
                "woeid": 2418046
            }, {
                "name": "Houston",
                "woeid": 2424766
            }, {
                "name": "Indianapolis",
                "woeid": 2427032
            }, {
                "name": "Jackson",
                "woeid": 2428184
            }, {
                "name": "Las Vegas",
                "woeid": 2436704
            }, {
                "name": "Los Angeles",
                "woeid": 2442047
            }, {
                "name": "Memphis",
                "woeid": 2449323
            }, {
                "name": "Miami",
                "woeid": 2450022
            }, {
                "name": "Milwaukee",
                "woeid": 2451822
            }, {
                "name": "Minneapolis",
                "woeid": 2452078
            }, {
                "name": "Nashville",
                "woeid": 2457170
            }, {
                "name": "New Haven",
                "woeid": 2458410
            }, {
                "name": "New Orleans",
                "woeid": 2458833
            }, {
                "name": "New York",
                "woeid": 2459115
            }, {
                "name": "Norfolk",
                "woeid": 2460389
            }, {
                "name": "Orlando",
                "woeid": 2466256
            }, {
                "name": "Philadelphia",
                "woeid": 2471217
            }, {
                "name": "Phoenix",
                "woeid": 2471390
            }, {
                "name": "Pittsburgh",
                "woeid": 2473224
            }, {
                "name": "Portland",
                "woeid": 2475687
            }, {
                "name": "Providence",
                "woeid": 2477058
            }, {
                "name": "Raleigh",
                "woeid": 2478307
            }, {
                "name": "Richmond",
                "woeid": 2480894
            }, {
                "name": "Sacramento",
                "woeid": 2486340
            }, {
                "name": "Salt Lake City",
                "woeid": 2487610
            }, {
                "name": "San Antonio",
                "woeid": 2487796
            }, {
                "name": "San Diego",
                "woeid": 2487889
            }, {
                "name": "San Francisco",
                "woeid": 2487956
            }, {
                "name": "Seattle",
                "woeid": 2490383
            }, {
                "name": "St. Louis",
                "woeid": 2486982
            }, {
                "name": "Tallahassee",
                "woeid": 2503713
            }, {
                "name": "Tampa",
                "woeid": 2503863
            }, {
                "name": "Washington",
                "woeid": 2514815
            }]
        }, {
            "name": "Venezuela",
            "woeid": 23424982,
            "children": [{
                "name": "Barquisimeto",
                "woeid": 468382
            }, {
                "name": "Caracas",
                "woeid": 395269
            }, {
                "name": "Maracaibo",
                "woeid": 395270
            }, {
                "name": "Valencia",
                "woeid": 395272
            }]
        }];
        trendItem = '<article class="stream-item" style="min-height: 50px;"><div class="item-box item-content"><div class="tweet" style="padding-left: 0;"><header class="tweet-header"></header><div class="tweet-body"><p></p><footer></footer></div><i class="sprite tweet-dogear"></i></div></div></article>';
        a.getAllColumns = function() {
            return TD.controller.columnManager.getAllOrdered();
        }
        a.getTrendsColumn = function() {
            var allTdColumns = a.getAllColumns()
            for(var myTdCol in allTdColumns) {
                if(allTdColumns[myTdCol].model.getTitle().indexOf('Trends: ') > -1) {
                    return allTdColumns[myTdCol];
                }
            }
            return false;
        }
        a.getJTrendsColumn = function() {
            if($('h1:contains("Trends: ")').parent().parent().size()){
                return $('h1:contains("Trends: ")').parent().parent();
            }
            return false;
        }
        a.getTitle = function() {
            var trendsCol = a.getTrendsColumn();
            if(trendsCol !== false) {
                return trendsCol.model.getTitle().replace('Trends: ', '');;
            }
        }
        a.setTitle = function(title) {
            var trendsCol = a.getTrendsColumn();
            if(trendsCol !== false) {
                trendsCol.model.setTitle('Trends: ' +title);
            }
        }
        a.getRefreshTime = function() {
            return refreshTime;
        }
        a.setRefreshTime = function(time) {
            refreshTime = time;
        }
        a.getTrendLocationWoeid = function() {
            return location;
        }
        a.setTrendLocationWoeid = function(newLocation) {
            location = newLocation;
        }
        a.update = function() {
            //Make sure we do not have any left over setTimeouts (Prevents column update several times in short period)
            for(var i = 0; i < scheduledUpdates.length; i++) {
                clearTimeout(scheduledUpdates[i]);
            }
            scheduledUpdates = [];
            $('body').trigger('TDTrendsColUpdate');
        }
        a.init = function() {
            allTdColumns = a.getAllColumns();
            if(allTdColumns.length == 0) {
                setTimeout(a.init, 500);
                return;
            }
            if(a.getTrendsColumn() === false) {
                var account = TD.storage.accountController.getPreferredAccount("twitter"),
                accountKey = account.getKey()
                var col = TD.controller.columnManager.makeColumnFor('other', 'twitter', accountKey, undefined);
                col.model.setTitle('Trends: United Kingdom');
                TD.controller.columnManager.addColumnToUI(col);
            }
            var column = a.getJTrendsColumn();
            populateContent(column, trendLocations);
        }
        a.setFilters = function(filterArr) {
            filters = filterArr;
        }
        a.getFilters = function() {
            return filters;
        }
        var populateContent = function(column, jsonLocations) {
            //Get selector html
            var html, country, city, i, j;
            html = '<div class="control-group stream-item" style="margin: 10px 0 0; padding-bottom: 10px;"><label for="trend-location" style="width: 100px; font-weight: bold; margin-left: 5px;" class="control-label">Trend Location</label> <div class="controls" style="margin-left: 113px;"><select name="trend-location" id="trend-location" style="width: 190px;"><option value="1">Worldwide</option>'
            for (i in jsonLocations) {
                country = jsonLocations[i];
                html += '<option value="' +country.woeid +'">' +country.name +'</option>';
                for (j in country.children) {
                    city = country.children[j];
                    html += '<option value="' +city.woeid +'">&nbsp;&nbsp;&nbsp;&nbsp;' +city.name +'</option>';
                }
            }
            html += '</select></div></div>';

            //Add selector to body
            var column = a.getJTrendsColumn();
            column.find('.column-options').after(html).end().find('.column-scroller').css({'margin-top': '50px'});

            var trendSelector = $('#trend-location'),
                woeid = $('option:contains("' +a.getTitle() +'")', trendSelector).val();
            a.setTrendLocationWoeid(woeid);

            trendSelector.val(a.getTrendLocationWoeid()).off('hover change mouseover mouseout').change(function(){
                $(this).find('option:selected').each(function(){
                    var loc = $(this);
                    a.setTrendLocationWoeid(loc.val());
                    a.setTitle($.trim(loc.text()));
                    a.update();
                });
            });

            column.parents('section').first().css({'border-radius': '5px'});
            addUpdater(column);
            a.update();

            handle = TD.storage.accountController.getPreferredAccount().getUsername();
            trackGoogleAnalytics();
        }
        var getGlobalTextContentFilters = function() {
            var i,
                filters = [],
                globalFilter = TD.settings.getGlobalFilter();
            for (i in globalFilter) {
                if(globalFilter[i].type == 'phrase') filters.push((globalFilter[i].value).toLowerCase());
            }
            a.setFilters(filters);
            return filters;
        }
        var trackGoogleAnalytics = function() {
            //Google analytics tracking, just to see if anyone uses this
            if(typeof(_gaq) != 'undefined' && 'push' in _gaq) {
                _gaq.push(['b._setAccount', 'UA-33365040-1']);
                _gaq.push(
                    ['b._setCustomVar', 1, 'handle', handle, 2],
                    ['b._setCustomVar', 2, 'version', TD.version, 2],
                    ['b._trackEvent', 'Open', 'handle', handle],
                    ['b._trackEvent', 'Version', 'version', TD.version],
                    ['b._trackPageview']
                );
            } else {
                setTimeout(trackGoogleAnalytics, 500);
                return;
            }
        }
        var addUpdater = function(column) {
            var updaterHtml = '<div id="update-countdown" style="height: 14px; position: absolute; bottom: 0; left: 0; padding: 6px; text-align: right; width: -webkit-calc(100% - 12px);"><a href="#" id="update-now" style="float: right;">Update now</a></div>';
            column.find('.column-scroller').css({'margin-bottom': '26px'}).after(updaterHtml);
            column.find('#update-now').on('click', function(e) {
                e.preventDefault();
                a.update();
            });
        }
        $('body').on('TDTrendsColUpdate', function(e){
            var column = a.getJTrendsColumn();
            if(column !== false){
                var content = column.find('.column-scroller');
                content.empty();
                var d = $('.js-search-form'), f, textFilter = getGlobalTextContentFilters();
                $.ajax({
                    url: 'https://api.twitter.com/1/trends/' +a.getTrendLocationWoeid() +'.json',
                    dataType: 'json',
                    data: {},
                    success: function(response) {
                        $.each(response[0].trends, function(i, item) {
                            for (f in textFilter) {
                                if((item.name).toLowerCase().indexOf(textFilter[f]) != -1) return 'continue'; //Hide this trend, continue to next loop iteration
                            }
                            var t = $(trendItem),
                                tHeader = t.find('header'),
                                tFooter = t.find('footer');
                            tHeader.append('<a class="account-link" href="' +item.url +'" rel="hashtag"><b class="fullname">'+item.name +'</b></a>');
                            tFooter.load('https://twitter.com/search?q="' +encodeURIComponent(item.name) +'" #timeline .content-header .discover-news .discover-item-content',  function(news, status, xhr) {
                                if (status == 'success' && tFooter.children('div').size()) {
                                    tHeader.append('<span style="float: right">Show news story</span>');
                                    tFooter.children('div').css({'display': 'none', 'margin': '10px 0'});
                                    tHeader.children('span').css({'cursor': 'pointer', 'font-size': '75%'}).on('click', function(e){
                                        e.stopPropagation();
                                        e.preventDefault();
                                        var text = $(this).text();
                                        if(text.indexOf('Show') !== -1) {
                                            $(this).text('Hide news story');
                                            tFooter.children('div').slideDown();
                                        } else {
                                            $(this).text('Show news story');
                                            tFooter.children('div').slideUp();
                                        }
                                    });
                                    tFooter.find('.discover-item-image-wrapper').css({'float': 'right', 'margin': '0 0 5px 10px'});
                                } else {
                                    t.find('footer:empty').load('https://twitter.com/search?q="' +encodeURIComponent(item.name) +'" #timeline .content-header .discover-item .events-card', function(eventStory, status, xhr) {
                                        if (status == 'success' && tFooter.children('div').size()) {
                                            tHeader.append('<span style="float: right">Show related event</span>');
                                            tFooter.children('div').css({'display': 'none', 'margin': '10px 0'});
                                            tHeader.children('span').css({'cursor': 'pointer', 'font-size': '75%'}).on('click', function(e){
                                                e.stopPropagation();
                                                e.preventDefault();
                                                var text = $(this).text();
                                                if(text.indexOf('Show') !== -1) {
                                                    $(this).text('Hide related event');
                                                    tFooter.children('div').slideDown();
                                                } else {
                                                    $(this).text('Show related event');
                                                    tFooter.children('div').slideUp();
                                                }
                                            });
                                            tFooter.find('.image-wrapper').css({'float': 'right', 'margin': '0 0 5px 10px'});
                                        }
                                    });
                                }
                            });
                            content.append(t);
                        });
                        var update = setTimeout((function() { a.update(); }), a.getRefreshTime());
                        //Add this timeout to the schedule
                        scheduledUpdates.push(update);
                        return true;
                    },
                    failure: function(response) {
                        console.log(response);
                        return false;
                    }
                });
            }
        });
        return a;
    }();
    //Override TD.services.TwitterClient.prototype.makeTwitterCall to pull most popular tweets
    TD.services.TwitterClient.prototype.makeTwitterCall=function(a,b,c,d,e,f,g){
        if (a.indexOf('search.json') != -1 && 'result_type' in b && 'count' in b) {
            b.result_type = 'popular,mixed,recent';
        }
        var h=this,i=function(a){if(e)try{a=e.call(h,a)}catch(b){console.log("Error processing Twitter data",a,b),g(b);return}f&&f(a)},j=function(f,i,j){var k,l=[];f.responseText&&(k=JSON.parse(f.responseText),k&&k.errors&&(typeof k.errors=="string"?l.push(h.getError(k.errors,f,a,b)):_.each(k.errors,function(c){l.push(h.getError(c,f,a,b))}))),$(document).trigger("dataTwitterApiError",{request:{url:a,params:b,method:c,isSigned:d,processor:e},response:{xhr:f,ts:i,error:j},errors:l}),g&&(f.errors=l,g(f,i,j,l))};b?(b.include_entities=1,b.include_user_entities=1,b.include_cards=1):b={},b.send_error_codes=1,c==="GET"?this.get(a,b,d,i,j):this.post(a,b,null,null,i,j)
    }
    TD.extensions.Trends.init();
}