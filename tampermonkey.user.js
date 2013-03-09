// ==UserScript==
// @name         Tweetdeck Userscript
// @namespace    http://web.tweetdeck.com/
// @version      3.0.2
// @description  Add a trending topics column to tweetdeck
// @include      https://web.tweetdeck.com/*
// @run-at       document-end
// @updateURL    http://www.willhawker.com/sites/default/files/js/tampermonkey.user.js
// @copyright    2013+, William Hawker (willhawker.com)
// ==/UserScript==
//Trends column extension by Will Hawker (www.willhawker.com || www.github.com/whawker/TweetDeck-Chrome-Trends)
(function(window) {
    var $ = window.$, TD, _gaq;
    $(window.document).on('TD.ready', function() {
        TD = window.TD, _gaq = window._gaq;

        TD.components.TrendDetailView = TD.components.DetailView.extend(function (e, t) {}).statics({}).methods({
            _render: function () {
                this.$node = $(TD.ui.template.render("status/tweet_detail_wrapper"))
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
            this.key = undefined, this.account = undefined, this.client = undefined, this.column = undefined, this.columnWoeid = 1, this.$column = undefined, this.$locationSelect, this.$update, this.scheduledUpdates = [];
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
                this.key = this.column.model.getKey()
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
                    true,
                    function(response) {
                        locations = this.processTrendLocations(response);
                    },
                    function(){
                        var i, indent, title = self.getTitle();
                        for (i in locations) {
                        	indent = '', selected = '';
                            if (locations[i].name == title) {
                                self.setColumnWoeid(locations[i].woeid);
                                selected = 'selected';
                            }
                            if (locations[i].placeType.name == 'Town')
                                indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
                            self.$locationSelect.append('<option ' +selected +' value="' +locations[i].woeid +'">' +indent +locations[i].name +'</option>');
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
                this.clearSchedule();
                var self = this;
                this.client.makeTwitterCall(
                    'https://api.twitter.com/1.1/trends/place.json',
                    {id: this.getColumnWoeid()},
                    'GET',
                    true,
                    function(response) {
                        var trendsResponse = this.processTrends(response),
                            update = window.setTimeout(function() { self.update() }, 300000),
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
                        self.scheduledUpdates.push(update);
                        self.setTrends(trends);
                    },
                    function(){},
                    function(){}
                );
            },
            setTrends: function(trends) {
                var i, item, trendItems = '';
                for (i in trends) {
                    item = trends[i];
                    trendItems += '<article class="stream-item" style="min-height: 50px;"><div class="item-box item-content"><div class="tweet" style="padding-left: 0;"><header class="tweet-header"><a class="account-link" href="' +item.url +'" rel="hashtag"><b class="fullname">'+item.name +'</b></a></header><div class="tweet-body"><p></p><footer></footer></div><i class="sprite tweet-dogear"></i></div></div></article>';
                }
                this.$column.find('.column-scroller').html(trendItems);

                var self = this;
                this.client.makeTwitterCall(
                    'https://api.twitter.com/1.1/lists/statuses.json',
                    {
                    'list_id': '86201584',
                    'since_id': '1',
                    'count': '200'
                    },
                    'GET',
                    true,
                    function(response) {
                        var tweet, i, newsStories = [];
                        for(var i in response) {
                            tweet = response[i];
                            //Find only those tweets that include media
                            if('entities' in tweet && 'urls' in tweet.entities && tweet.entities.urls.length > 0 && 'cards' in tweet && 'summaries' in tweet.cards && tweet.cards.summaries.length > 0) {
                                newsStories.push(this.processTweet(tweet));
                            }
                        }
                        var j, k, trendName;
                        for (j in trends) {
                            trendName = (trends[j].name).toLowerCase();
                            //Check for any related news stories
                            var trendTweet = undefined, trendStories = [], newsStory, safeNewsTitle;
                            for (k in newsStories) {
                                tweet = newsStories[k];
                                newsStory = newsStories[k].cards.summaries[0];
                                safeNewsTitle = (newsStory.title).replace(/[^A-z]/g, '');
                                //Make sure we havent added this story already
                                if (trendStories.indexOf(safeNewsTitle) == -1) {
                                    var tweetText = (tweet.text).toLowerCase() +' ' +(newsStory.title).toLowerCase() +' ' +(newsStory.description).toLowerCase();
                                    //Match trend name, include spaces to prevent partial word matching
                                    if (tweetText.match(new RegExp('^(' +trendName +')\\s.+|.+\\s(' +trendName +')\\s.+|.+\\s(' +trendName +')$')) != null) {
                                        if (typeof(trendTweet) != 'undefined') {
                                            trendTweet.cards.summaries.push(newsStory);
                                        } else {
                                            trendTweet = tweet;
                                        }
                                        trendStories.push(safeNewsTitle);
                                    }
                                }
                            }
                            if (typeof(trendTweet) != 'undefined') {
                                var article = self.$column.find('article:nth-of-type(' +(j/1+1) +')');
                                article.find('header')
                                    .append('<span style="float: right" class="js-show-news">Show related news</span>');
                                article.find('.js-show-news')
                                    .css({cursor: 'pointer', 'font-size': '75%'})
                                    .data('trendTweet', trendTweet)
                                    .on('click', function(event) {
                                        event.preventDefault();
                                        var tdv = new TD.components.TrendDetailView(self.column, self.$column);
                                        tdv.showTweetStories($(this).data('trendTweet'));
                                    });
                            }
                        }
                    },
                    function(){},
                    function(){}
                );
            }
        });

        TD.extensions = {
            Trends: function() {
                var trendColumns = [];
                function getAllColumns() {
                    return TD.controller.columnManager.getAllOrdered();
                }
                return {
					version: '3.0.2',
                    init: function() {
                        var allTdColumns = getAllColumns(),
                            tdCol, colTitle, colKey, trendCol, key;
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