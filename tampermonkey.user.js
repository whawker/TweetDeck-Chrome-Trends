// ==UserScript==
// @name         Tweetdeck Userscript
// @namespace    http://web.tweetdeck.com/
// @version      3.3.4
// @description  Add a trending topics column to tweetdeck
// @include      /^https:\/\/(web\.)?tweetdeck\.(twitter\.)?com(\/)?.*$/
// @run-at       document-end
// @updateURL    http://www.willhawker.com/sites/default/files/js/tampermonkey.user.js
// @copyright    2013+, William Hawker (willhawker.com)
// ==/UserScript==
//Trends column extension by Will Hawker (www.willhawker.com || www.github.com/whawker/TweetDeck-Chrome-Trends)
(function(window) {
    var $ = window.$, _ = window._, TD, _gaq;
    $(window.document).on('TD.ready', function() {
        TD = window.TD, _gaq = window._gaq;

        TD.components.TrendDetailView = TD.components.DetailView.extend(function (e, t) {}).statics({}).methods({
            _render: function () {
                this.$node = $(TD.ui.template.render("status/tweet_detail_wrapper"));
                this.$node.find('.column-scroller').addClass('scroll-styled-v');
                this.$column.on('click', '.link-complex', {column: this.$column}, function(event) {
                    event.preventDefault();
                    event.data.column.removeClass('is-shifted-1 js-column-state-detail-view').find('.icon-twitter').removeClass('icon-twitter').addClass('icon-trends');
                });
            },
            showTweetStories: function (e) {
                var key = this.column.model.getKey(),
                    trendCol = TD.extensions.Trends.getColumnByKey(key);
                this.$column.find('.link-complex-target').text('Back to Trends: ' +trendCol.getTitle());
                this.chirp = e,
                this.$tweetDetail = $(TD.ui.template.render("status/tweet_detail", this.chirp.getMainTweet())),
                this.$find(".js-tweet-detail").html(this.$tweetDetail);
                this.initialised = !0, this.$tweetDetail.trigger("uiDetailViewActive", {
                    $chirp: this.$tweetDetail,
                    chirp: this.chirp
                });
                if (e.cards) {
                    var t = TD.ui.template.render("cards/card_layouts", e.cards);
                    this.$find(".js-tweet-detail").css({'padding': '8px', 'margin-top': '-20px'}).html(t)
                }
            }
        });

        TD.components.OpenTrends = TD.components.BaseModal.extend(function () {
            TD.extensions.Trends.addColumn();
            this.destroy();
        }).methods({});

        TD.components.TrendsColumn = TD.components.Base.extend(function () {
            this.key = undefined, this.account = undefined, this.client = undefined, this.column = undefined, this.columnWoeid = 1, this.$column = undefined, this.$navLink = undefined, this.$locationSelect, this.$update, this.scheduledUpdates = [], this.news = [];
        }).methods({
            _init: function(key) {
                this.account = TD.storage.accountController.getPreferredAccount('twitter');
                this.client  = TD.controller.clients.getPreferredClient();
                if (key) {
                    this.column = TD.controller.columnManager.get(key);
                }
                if (!this.column) {
                    this.column = this._createColumn();
                }
                this.key = this.column.model.getKey();
                this.$column = $('section.column[data-column="' + this.key +'"]');
                this.populate();
            },
            _createColumn: function() {
                var col = TD.controller.columnManager.makeColumnFor('other', 'twitter', this.account.getKey(), undefined);
                col.model.setTitle('Trends: United Kingdom');
                TD.controller.columnManager.addColumnToUI(col);
                return col;
            },
            getKey: function() {
                return this.key;
            },
            populate: function() {
                var locations = [], self = this,
                    selectorHtml = '<div class="control-group stream-item" style="margin: 10px 0 0; padding-bottom: 10px;"><label for="trend-location" style="width: 100px; font-weight: bold; margin-left: 5px;" class="control-label">Trend Location</label> <div class="controls" style="margin-left: 113px;"><select name="trend-location" class="trend-location" style="width: 190px;"></select></div></div>';

                this.$column.css({'border-radius': '5px'}).find('.column-options').after(selectorHtml).end().find('.column-scroller').css({'margin-top': '50px'});
                this.$locationSelect = this.$column.find('.trend-location');
                this.$locationSelect.on('change', function(event) {
                    event.preventDefault();
                    $(this).find('option:selected').each(function(){
                        var loc = $(this);
                        self.setTitle($.trim(loc.text()));
                        self.setColumnWoeid(loc.val());
                    });
                });
                this.client.makeTwitterCall(
                    'https://api.twitter.com/1.1/trends/available.json',
                    {},
                    'GET',
                    this.processTrendLocations,
                    function(rawLocations){
                        var locations = [], i, j, indent, title = self.getTitle();
                        locations.push(rawLocations.shift());
                        for(i in rawLocations) {
                            if(rawLocations[i].placeType.name == 'Town') {
                                rawLocations[i].sortString = rawLocations[i].country + rawLocations[i].name;
                            } else {
                                rawLocations[i].sortString = rawLocations[i].country;
                            }
                        }
                        rawLocations.sort(function(e, t) {
                            var n = e.sortString,
                                r = t.sortString;
                            return n < r ? -1 : n > r ? 1 : 0
                        });
                        locations = locations.concat(rawLocations);
                        for (j in locations) {
                            indent = '', selected = '';
                            if (locations[j].name == title) {
                                self.setColumnWoeid(locations[j].woeid);
                                selected = 'selected';
                            }
                            if (locations[j].placeType.name == 'Town')
                                indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
                            self.$locationSelect.append('<option ' +selected +' value="' +locations[j].woeid +'">' +indent +locations[j].name +'</option>');
                        }
                    },
                    function(){}
                );
                var updaterHtml = '<div class="update-countdown" style="height: 14px; position: absolute; bottom: 0; right: 0; padding: 6px; text-align: right; width: -webkit-calc(100% - 12px);"><a href="#" class="update-now" style="float: right;">Update now</a></div>';
                this.$column.find('.column-scroller').css({'margin-bottom': '26px'}).after(updaterHtml);
                this.$column.find('.update-now').on('click', function(e) {
                    e.preventDefault();
                    self.update();
                });
                window.setInterval(function() {
                    self.$column.find('.icon-twitter').removeClass('icon-twitter').addClass('icon-trends');
                    self.$navLink.find('.icon-twitter').removeClass('icon-twitter').addClass('icon-trends');
                }, 30000);
            },
            getColumnWoeid: function() {
                return this.columnWoeid;
            },
            setColumnWoeid: function(woeid) {
                this.columnWoeid = woeid;
                this.update();
            },
            getTitle: function() {
                return this.column.model.getTitle().replace('Trends: ', '');
            },
            setTitle: function(title) {
                this.column.model.setTitle('Trends: ' +title);
            },
            clearSchedule: function() {
                for(var i = 0; i < this.scheduledUpdates.length; i++) {
                    clearTimeout(this.scheduledUpdates[i]);
                }
                this.scheduledUpdates = [];
            },
            update: function() {
                var self = this, hashtagsDisabled = TD.extensions.Trends.isHashtagsDisabled(), options = {id: this.getColumnWoeid()};
                if (hashtagsDisabled)
                    options.exclude = 'hashtags';
                this.clearSchedule();
                this.$navLink = $('#column-navigator .column-nav-link[data-column="' +this.key +'"]');
                this.client.makeTwitterCall(
                    'https://api.twitter.com/1.1/trends/place.json',
                    options,
                    'GET',
                    function(response) {
                        var trendsResponse = this.processTrends(response),
                            globalFilter = TD.settings.getGlobalFilter(),
                            i, j, k, filtered, item, filters = [], trends = [];
                        for (i in globalFilter)
                            if(globalFilter[i].type == 'phrase') filters.push((globalFilter[i].value).toLowerCase());

                        for (j in trendsResponse.trends) {
                            filtered = false;
                            item = trendsResponse.trends[j];
                            for (k in filters) {
                                if (!filtered && (item.name).toLowerCase().indexOf(filters[k]) != -1)
                                    filtered = true;
                            }
                            if (!filtered)
                                trends.push(item);
                        }
                        self.$column.removeClass('is-shifted-1 js-column-state-detail-view').find('.icon-twitter').removeClass('icon-twitter').addClass('icon-trends');
                        self.$navLink.find('.icon-twitter').removeClass('icon-twitter').addClass('icon-trends');
                        self.setTrends(trends);
                        self.updateNews(function() {
                            trends.forEach(self.getNewsForTrend, self);
                        });

                        var update = window.setTimeout(function() { self.update() }, TD.extensions.Trends.getAutoUpdateFrequency());
                        self.scheduledUpdates.push(update);
                    },
                    function(){},
                    function(){}
                );
            },
            setTrends: function(trends) {
                var i, item, trendItems = '', promoted = '';
                for (i in trends) {
                    item = trends[i];
                    trendItems += '<article class="stream-item" style="min-height: 50px;"><div class="item-box item-content"><div class="tweet" style="padding-left: 0;"><header class="tweet-header"><a class="account-link" href="http://www.twitter.com?q=&quot;' +item.query +'&quot;" rel="hashtag"><b class="fullname">'+item.name +'</b></a></header><div class="l-table"><div class="tweet-body  l-cell"><p></p></div></div><i class="sprite tweet-dogear"></i></div></div></article>';
                }
                this.$column.find('.column-scroller').html(trendItems);
            },
            updateNews: function(callback) {
                var self = this, newsListId = TD.extensions.Trends.getNewsListId();
                this.news = [];
                fetchNews(this.news, newsListId, 400, callback);

                //Can only fetch 200 at a time, any additional performed as recursive callback. Then calls cb function
                function fetchNews(newsArr, newsListId, count, cb) {
                    var nextCount = count - 200;
                    if (count > 200)
                        count = 200;
                    var request = {
                        'since_id': '1',
                        'list_id': newsListId,
                        'count': count
                    };
                    if (newsArr.length)
                        request.max_id = (newsArr[newsArr.length - 1]).id;
                    self.client.makeTwitterCall(
                        'https://api.twitter.com/1.1/lists/statuses.json',
                        request,
                        'GET',
                        function(response) {
                            var tweet, i;
                            for(var i in response) {
                                tweet = response[i];
                                //Find only those tweets that include media
                                if('cards' in tweet && 'summaries' in tweet.cards && tweet.cards.summaries.length > 0) {
                                    newsArr.push(this.processTweet(tweet));
                                }
                            }
                            if (nextCount > 0) {
                                return fetchNews(newsArr, newsListId, nextCount, cb);
                            } else {
                                if (typeof(cb) == 'function')
                                    cb();
                            }
                        },
                        function(){},
                        function(){}
                    );
                }
            },
            getNewsForTrend: function(trend, index, array) {
                try {
                    var trendName = trend.name, self = this, i, j;
                    if (trendName.charAt(0) == '#') { //If is hashtag
                        trendName = trendName.substring(1); //Remove hashtag
                        if (!trendName.match(/^[A-Z]*$/)) //If not all uppercase
                            trendName = $.trim(trendName.replace(/([A-Z]|[0-9]+)/g, ' $1')); //replace camelCase strings to camel Case
                    }

                    //Check for any related news stories
                    var trendTweet = $.extend(true, {}, self.news[0]), trendStories = [], newsStory, safeNewsTitle, seenStories = [];
                    for (i in self.news) {
                        tweet = self.news[i];
                        newsStory = self.news[i].cards.summaries[0];
                        safeNewsTitle = (newsStory.title).replace(/[^A-z]/g, '');
                        //Make sure we havent added this story already
                        if (seenStories.indexOf(safeNewsTitle) == -1) {
                            var tweetText = tweet.text +' ' +newsStory.title +' ' +newsStory.description,
                                trendNameMatch = new RegExp('(?:^|\\s)(' + trendName + ')(?:\\s|$)', 'gmi'),
                                matchCount = 0;
                            //Match trend name, include word boundaries to prevent partial word matching
                            tweetText.replace(trendNameMatch, function(all, match){
                                matchCount++;
                            });
                            if (matchCount) {
                                trendStories.push({
                                    story: newsStory,
                                    count: matchCount
                                });
                                seenStories.push(safeNewsTitle);
                            }
                        }
                    }
                    //Sort by highest num of references to trend
                    trendStories.sort(function(value1,value2){ return value2.count - value1.count; });

                    if (trendStories.length) {
                        trendTweet.cards.summaries = [];
                        for (j in trendStories) {
                            trendTweet.cards.summaries.push(trendStories[j].story);
                        }

                        var article = self.$column.find('article:nth-of-type(' +(index+1) +')');
                        article.find('.tweet-body')
                            .after('<div class="conversation-indicator l-cell js-show-news"><i class="icon icon-arrow-r"></i></div>');
                        article.find('.js-show-news')
                            .css({cursor: 'pointer', 'padding-top': 0})
                            .data('trendTweet', trendTweet)
                            .on('click', function(event) {
                                event.preventDefault();
                                var tdv = new TD.components.TrendDetailView(self.column, self.$column);
                                tdv.showTweetStories($(this).data('trendTweet'));
                            });
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        });

        TD.components.TrendsColSettings = TD.components.Base.extend(function() {
            var settingsForm = '<fieldset id="global_filter_settings"><legend class="frm-legend">Trends Column Settings</legend>'
                +'<div class="control-group"><label for="news-sources" class="control-label" style="width:90px">News Sources</label><div class="controls" style="margin-left:100px"><select name="news-sources" id="news-sources">'
                +'<optgroup label="English">'
                +'  <option value="86201584">Worldwide</option>'
                +'  <option value="87951253">United Kingdom</option>'
                +'  <option value="87951235">United States</option>'
                +'  <option value="87951276">Austrailia</option>'
                +'  <option value="88424811">Canada</option>'
                +'  <option value="87951293">South Africa</option>'
                +'</optgroup>'
                +'<option value="87365182">Espa\u00f1ol</option>'
                +'<optgroup label="Fran\u00e7ais">'
                +'  <option value="87368038">France</option>'
                +'  <option value="88424811">Canada</option>'
                +'</optgroup>'
                +'<option value="87367302">Deutsch</option>'
                +'<option value="87379993">\u0939\u093f\u0902\u0926\u0940</option>'
                +'<option value="87369866">Italiano</option>'
                /* +'<option value="nl">Dutch (Nederlands)</option>' */
                /* +'<option value="no">Norwegian (Norsk)</option>' */
                +'<option value="87374850">Portugu\u00eas</option>'
                +'<option value="87371608">\u0420\u0443\u0441\u0441\u043a\u0438\u0439</option>'
                /* +'<option value="tr">Turkish (T\u00fcrk\u00e7e)</option>' */
                /* +'<option value="ur">Urdu (\ufe8d\ufead\ufea9\ufeed)</option>' */
                +'<option value="87379397">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</option>'
                +'</select></div></div>'
                +'<div class="divider-bar"></div>'
                +'<div class="cf" id="auto-update-frequency"><label><b>Auto Update Frequency</b></label>'
                +'<div class="obj-left">'
                +'<label class="fixed-width-label"><input type="radio" class="js-theme-radio inline-radio" name="auto-update-frequency" value="300000"> 5 Minutes </label>'
                +'<label class="fixed-width-label"><input type="radio" class="js-theme-radio inline-radio" name="auto-update-frequency" value="600000"> 10 Minutes </label>'
                +'</div><div class="obj-left">'
                +'<label class="fixed-width-label"><input type="radio" class="js-theme-radio inline-radio" name="auto-update-frequency" value="1200000"> 15 Minutes </label>'
                +'<label class="fixed-width-label"><input type="radio" class="js-theme-radio inline-radio" name="auto-update-frequency" value="1800000"> 30 Minutes </label>'
                +'</div></div>'
                +'<div class="divider-bar"></div>'
                +'<div class="control-group"><label for="disable-hashtags" class="checkbox">Ignore trending #hashtags<input type="checkbox" name="disable-hashtags" id="disable-hashtags" /></label></div>'
                +'</fieldset>';
            this.$fieldset = $(settingsForm);
            $("#global-settings").append(this.$fieldset);

            this.$autoUpdateFrequency = $('#auto-update-frequency [name=auto-update-frequency]');
            this.$autoUpdateFrequency.filter('[value="' + TD.extensions.Trends.getAutoUpdateFrequency() + '"]').prop('checked', true);
            this.$autoUpdateFrequency.on('change', this.updateAutoUpdateFrequency);
            this.$disableHashtags = $('#disable-hashtags');
            this.$disableHashtags.prop('checked', TD.extensions.Trends.isHashtagsDisabled());
            this.$disableHashtags.change(_.bind(this.toggleHashtags, this));
            this.$newsListId = $('#news-sources');
            this.$newsListId.val(TD.extensions.Trends.getNewsListId());
            this.$newsListId.change(_.bind(this.toggleNewsListId, this));
        }).methods({
            destroy: function(a) {
                this.$fieldset.remove()
            },
            updateAutoUpdateFrequency: function(e) {
                if($(this).is(':checked')) {
                    TD.extensions.Trends.setAutoUpdateFrequency($(this).val());
                }
            },
            toggleHashtags: function(e) {
                var isDisabled = this.$disableHashtags.is(':checked');
                TD.extensions.Trends.setHashtagsDisabled(isDisabled);
            },
            toggleNewsListId: function(e) {
                var source = this.$newsListId.val();
                TD.extensions.Trends.setNewsListId(source);
            }
        });

        //Override
        var TDGlobalSettings = TD.components.GlobalSettings
        TD.components.GlobalSettings = function() {
            var settings = new TDGlobalSettings,
                menu = settings.$optionList,
                newItem = $('<li><a href="#" class="list-link" data-action="trendscol"><strong>Trends Column</strong><i class="chev-right"></i></a></li>');

            $(menu.parent()).append(newItem);
            newItem.on('click', function(event) {
                settings.$optionList.removeClass("selected");
                settings.currentTab.destroy();
                settings.currentTab = new TD.components.TrendsColSettings;
                settings.currentTabName = "trendscol", $(this).addClass("selected");
            });
            settings.$optionList.push(newItem.get(0));

            return settings;
        }

        TD.extensions = {
            Trends: function() {
                var trendColumns = [], hashtagsDisabled, autoUpdateFrequency = 300000, newsListId = '86201584';
                function getAllColumns() {
                    return TD.controller.columnManager.getAllOrdered();
                }
                return {
                    version: '3.3.4',
                    init: function() {
                        var allTdColumns = getAllColumns(),
                            tdCol, colTitle, colKey, trendCol, key, settings;
                        //Find out which columns are trend columns
                        for(tdCol in allTdColumns) {
                            colTitle = allTdColumns[tdCol].model.getTitle();
                            if(colTitle.indexOf('Trends: ') > -1) {
                                colKey = allTdColumns[tdCol].model.getKey();
                                trendCol = new TD.components.TrendsColumn;
                                trendCol._init(colKey);
                                trendColumns.push(trendCol);
                            }
                        }
                        if(trendColumns.length == 0)
                            this.addColumn();

                        settings = TD.storage.store.get('TDTrendsColSettings');
                        if ($.isEmptyObject(settings))
                            TD.storage.store.set('TDTrendsColSettings', {'hashtagsDisabled': false, 'autoUpdateFrequency': autoUpdateFrequency, 'newsListId': newsListId});

                        settings = TD.storage.store.get('TDTrendsColSettings');
                        hashtagsDisabled = settings.hashtagsDisabled;
                        autoUpdateFrequency = settings.autoUpdateFrequency;
                        if ('newsListId' in settings) {
                            newsListId = settings.newsListId;
                        } else {
                            var newSettings = $.extend({}, settings, {newsListId: newsListId});
                            TD.storage.store.set('TDTrendsColSettings', newSettings);
                        }
                        this.trackGoogleAnalytics();
                    },
                    addColumn: function() {
                        trendCol = new TD.components.TrendsColumn;
                        trendCol._init();
                        trendColumns.push(trendCol);
                    },
                    getColumnByKey: function(key) {
                        var i, result = false;
                        for (i in trendColumns) {
                            if (trendColumns[i].getKey() == key)
                                result = trendColumns[i];
                        }
                        return result;
                    },
                    updateAllColumns: function() {
                        for (var i in trendColumns)
                            trendColumns[i].update();
                    },
                    isHashtagsDisabled: function() {
                        return hashtagsDisabled;
                    },
                    setHashtagsDisabled: function(isDisabled) {
                        var colSettings = TD.storage.store.get('TDTrendsColSettings'),
                            newSettings = $.extend({}, colSettings, {hashtagsDisabled: isDisabled});
                        TD.storage.store.set('TDTrendsColSettings', newSettings);
                        hashtagsDisabled = isDisabled;
                        this.updateAllColumns();
                    },
                    getAutoUpdateFrequency: function() {
                        return autoUpdateFrequency;
                    },
                    setAutoUpdateFrequency: function(freq) {
                        var colSettings = TD.storage.store.get('TDTrendsColSettings'),
                            newSettings = $.extend({}, colSettings, {autoUpdateFrequency: freq});
                        TD.storage.store.set('TDTrendsColSettings', newSettings);
                        autoUpdateFrequency = freq;
                        this.updateAllColumns();
                    },
                    getNewsListId: function() {
                        return newsListId;
                    },
                    setNewsListId: function(source) {
                        var colSettings = TD.storage.store.get('TDTrendsColSettings'),
                            newSettings = $.extend({}, colSettings, {newsListId: source});
                        TD.storage.store.set('TDTrendsColSettings', newSettings);
                        newsListId = source;
                        this.updateAllColumns();
                    },
                    trackGoogleAnalytics: function() {
                        //Google analytics tracking, just to see if anyone uses this
                        if(typeof(_gaq) != 'undefined' && 'push' in _gaq) {
                            var handle = TD.storage.accountController.getPreferredAccount().getUsername();
                            _gaq.push(['b._setAccount', 'UA-33365040-1']);
                            _gaq.push(
                                ['b._setCustomVar', 1, 'handle', handle, 2],
                                ['b._setCustomVar', 2, 'version', TD.version, 2],
                                ['b._setCustomVar', 3, 'script', TD.extensions.Trends.version, 2],
                                ['b._trackEvent', 'Open', 'handle', handle],
                                ['b._trackEvent', 'Version', 'version', TD.version],
                                ['b._trackEvent', 'Version', 'version', TD.extensions.Trends.version],
                                ['b._trackPageview']
                            );
                        } else {
                            setTimeout(this.trackGoogleAnalytics, 500);
                            return;
                        }
                    }
                }
            }()
        };
        TD.extensions.Trends.init();
    });
}(unsafeWindow));