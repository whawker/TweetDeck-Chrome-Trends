// ==UserScript==
// @name         Tweetdeck Userscript
// @namespace    http://web.tweetdeck.com/
// @version      4.1.1
// @description  Add a trending topics column to tweetdeck
// @include      https://tweetdeck.twitter.com/
// @run-at       document-end
// @updateURL    http://www.willhawker.com/sites/default/files/js/tampermonkey.user.js
// @copyright    2013+, William Hawker (willhawker.com)
// ==/UserScript==
//Trends column extension by Will Hawker (www.willhawker.com || www.github.com/whawker/TweetDeck-Chrome-Trends)
(function(window) {
    var $ = window.$, _ = window._, TD = window.TD, _gaq = window._gaq;
    
    TD.util.columnUtils.filterableColumnTypes.push(TD.util.columnUtils.columnMetaTypes.UNKNOWN);
    
    TD.components.TrendDetailView = TD.components.DetailView.extend(function (e, t) {}).statics({}).methods({
        _render: function () {
            this.$node = $(TD.ui.template.render("status/tweet_detail_wrapper"));
            this.$node.find('.column-scroller').addClass('scroll-styled-v');
            this.$column.on('click', '.link-complex', {column: this.$column}, function(event) {
                event.preventDefault();
                event.data.column.removeClass('is-shifted-1 js-column-state-detail-view').find('.icon-twitter-bird').removeClass('icon-twitter-bird').addClass('icon-trending');
            });
        },
        showTweetStories: function (e) {
            var key = this.column.model.getKey(),
                trendCol = TD.extensions.Trends.getColumnByKey(key);
            this.$column.find('.link-complex-target').text('Back to Trends: ' +trendCol.getTitle());
            this.chirp = e,
            this.$tweetDetail = $(TD.ui.template.render('status/tweet_detail', this.chirp.getMainTweet())),
            this.$find('.js-tweet-detail').html(this.$tweetDetail);
            this.initialised = !0, this.$tweetDetail.trigger('uiDetailViewActive', {
                $chirp: this.$tweetDetail,
                chirp: this.chirp
            });
            if (e.cards) {
                var t = TD.ui.template.render('cards/card_layouts', e.cards);
                this.$find('.js-tweet-detail').css({'padding': '8px', 'margin-top': '-20px'}).html(t);
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
            var self = this,
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
                    var locations = [], i, j, indent, selected, title = self.getTitle();
                    locations.push(rawLocations.shift());
                    rawLocations = rawLocations.map(function(loc) {
                        if (loc.placeType.name == 'Town') {
                            loc.sortString = loc.country + loc.name;
                        } else {
                            loc.sortString = loc.country;
                        }
                        return loc;
                    });
                    rawLocations.sort(function(e, t) {
                        var n = e.sortString,
                            r = t.sortString;
                        return n < r ? -1 : n > r ? 1 : 0;
                    });
                    locations = locations.concat(rawLocations);
                    locations.forEach(function(loc) {
                        indent = '', selected = '';
                        if (loc.name == title) {
                            self.setColumnWoeid(loc.woeid);
                            selected = 'selected';
                        }
                        if (loc.placeType.name == 'Town')
                            indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
                        self.$locationSelect.append('<option ' +selected +' value="' +loc.woeid +'">' +indent +loc.name +'</option>');
                    });
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
                self.$column.find('.icon-twitter-bird').removeClass('icon-twitter-bird').addClass('icon-trending');
                self.$navLink.find('.icon-twitter-bird').removeClass('icon-twitter-bird').addClass('icon-trending');
            }, 30000);
        },
        getColumnWoeid: function() {
            return this.columnWoeid;
        },
        setColumnWoeid: function(woeid) {
            console.log('TD.extensions.Trends setting column woeid:', woeid);
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
            if (this.$column.hasClass('is-shifted-1')) {
                this._scheduleUpdate(100);
                return;
            }
            this.$navLink = $('#column-navigator .column-nav-link[data-column="' +this.key +'"]');
            console.log('TD.extensions.Trends fetching trends/place.json with:', options);
            this.client.makeTwitterCall(
                'https://api.twitter.com/1.1/trends/place.json',
                options,
                'GET',
                function(response) {
                    console.log('TD.extensions.Trends fetching trends/place.json got a response');
                    var trendsResponse = this.processTrends(response),
                        globalFilter = TD.settings.getGlobalFilter(),
                        i, j, k, filtered, trendNameParts, filters = [], trends = [];
                    console.log('TD.extensions.Trends processed trends/place.json:', trendsResponse);
                    globalFilter.forEach(function(f) {
                        if (f.type == 'phrase')
                            filters.push(f.value);
                    });
                    console.log('TD.extensions.Trends found global filters:', filters);
                    
                    trends = trendsResponse.trends.filter(function(t) {
                        trendName = t.name.toLowerCase();
                        if (filters.indexOf(trendName) !== -1)
                            return false;

                        filtered = trendName.split(' ').some(function(word) {
                            return (filters.indexOf(word) !== -1);
                        });
                        return !filtered;
                    });
                    console.log('TD.extensions.Trends filtered trends and was left with:', trends);

                    self.$column.removeClass('is-shifted-1 js-column-state-detail-view').find('.icon-twitter-bird').removeClass('icon-twitter-bird').addClass('icon-trending');
                    self.$navLink.find('.icon-twitter-bird').removeClass('icon-twitter-bird').addClass('icon-trending');
                    console.log('TD.extensions.Trends is setting trends');
                    self.setTrends(trends);
                    trends.forEach(self.getNewsForTrend, self);

                    self._scheduleUpdate(TD.extensions.Trends.getAutoUpdateFrequency());
                },
                function(){},
                function(){}
            );
        },
        _scheduleUpdate: function(time) {
            var self = this,
                update = window.setTimeout(function() { self.update() }, time);
            this.scheduledUpdates.push(update);
        },
        setTrends: function(trends) {
            var trendItems = trends.reduce(function(htmlString, item) {
                return htmlString += '<article class="stream-item" style="min-height: 50px;"><div class="item-box item-content"><div class="tweet" style="padding-left: 0;"><header class="tweet-header"><a class="account-link" href="http://www.twitter.com?q=&quot;' +item.query +'&quot;" rel="hashtag"><b class="fullname">'+item.name +'</b></a></header><div class="l-table"><div class="tweet-body  l-cell"><p></p></div></div><i class="sprite tweet-dogear"></i></div></div></article>';
            }, '');
            console.log('TD.extensions.Trends updated the column with HTML string of length:', trendItems.length);
            this.$column.find('.column-scroller').html(trendItems);
        },
        _getDateOffset: function(num, datePart) {
            datePart = datePart || 'hour';
            var today = new Date().getTime(),
                millisecMap = {
                'millisecond': 1,
                'second': 1000,
                'minute': 60000,
                'hour': 3600000,
                'day': 86400000
            };
            if (!millisecMap[datePart])
                datePart = 'millisecond';
            var offsetTime = num * millisecMap[datePart];
            return new Date(today + offsetTime);
        },
        getNewsForTrend: function(trend, index, arr) {
            console.log('TD.extensions.Trends is fetching new for:', trend.name);
            var self = this, 
                trendName = trend.name, 
                lang = TD.extensions.Trends.getNewsLanguage(),
                sinceDate = this._getDateOffset(-12).toISOString().replace(/T.*/, ''),
                request = {
                'q': '"' +trendName +'" filter:news since:' +sinceDate,
                'count': 100,
                'result_type': 'recent',
                'lang': lang,
                'include_entities': 1,
                'include_user_entities': 1,
                'include_cards': 1
            };
            console.log('TD.extensions.Trends fetching search/tweets.json with:', request);

            self.client.makeTwitterCall(
                'https://api.twitter.com/1.1/search/tweets.json',
                request,
                'GET',
                function(response) {
                    console.log('TD.extensions.Trends fetching search/tweets.json got a response');
                    var statuses = response.statuses, trendTweet = null, tweet, i, j, seenStories = [], newsArr = [], newsStory, safeNewsTitle;

                    for(i in statuses) {
                        tweet = this.processTweet(statuses[i]);
                        if(tweet.cards)

                        //Find only those tweets that include media
                        if(tweet.cards && (tweet.cards.summaries || tweet.cards.players)) {                   
                            if (trendTweet === null)
                                trendTweet = tweet;
                            
                            if (tweet.cards.summaries) {
                                newsStory = tweet.cards.summaries[0];
                            } else {
                                newsStory = tweet.cards.players[0];
                            }
                            safeNewsTitle = (newsStory.title).replace(/[^A-z]/g, '');
                            
                            //Make sure we haven't added this story already
                            if (seenStories.indexOf(safeNewsTitle) == -1) {
                                var tweetText = newsStory.title +' ' +newsStory.description,
                                    trendNameMatch = new RegExp('(?:^|\\s)(' + trendName + ')(?:\\s|$)', 'gmi'),
                                    matchCount = 0;
                                //Match trend name, include word boundaries to prevent partial word matching
                                tweetText.replace(trendNameMatch, function(all, match){
                                    matchCount++;
                                });
                                if (matchCount) {
                                    newsArr.push({
                                        story: newsStory,
                                        count: matchCount
                                    });
                                    seenStories.push(safeNewsTitle);
                                }
                            }
                        }
                    }
                    console.log('TD.extensions.Trends number of news stories matching '+trendName+':', newsArr.length);
                    if (newsArr.length) {
                         //Sort by highest num of references to trend
                        newsArr.sort(function(value1,value2){ return value2.count - value1.count; });
                    
                        trendTweet.cards.summaries = [];
                        newsArr.forEach(function(n) {
                            trendTweet.cards.summaries.push(n.story);
                        });

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
                },
                function(){},
                function(){}
            );
        }
    });

    TD.components.TrendsColSettings = TD.components.Base.extend(function() {
        var langOptionsHTML = this.getNewsLanguageOptionHTML();
        var settingsForm = '<fieldset id="global_filter_settings"><legend class="frm-legend">Trends Column Settings</legend>'
            +'<div class="control-group"><label for="lang" class="control-label" style="width:100px; text-align: left;">News Language</label><div class="controls" style="margin-left:100px"><select id="news-language" name="news-language">'
            +langOptionsHTML
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
        this.$lang = $('#news-language');
        this.$lang.val(TD.extensions.Trends.getNewsLanguage());
        this.$lang.change(_.bind(this.toggleNewsLanguage, this));
    }).methods({
        destroy: function(a) {
            this.$fieldset.remove();
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
        toggleNewsLanguage: function(e) {
            var lang = this.$lang.val();
            TD.extensions.Trends.setNewsLanguage(lang);
        },
        getNewsLanguageOptionHTML: function() {
            var langs = TD.extensions.Trends.getAllLanguages();
            var html = '';
            for (var code in langs) {
                html += '<option value="' +code +'">' +langs[code] +'</option>';
            }
            return html;
        }
    });

    //Override
    var TDGlobalSettings = TD.components.GlobalSettings;
    TD.components.GlobalSettings = function() {
        var settings = new TDGlobalSettings,
            menu = settings.$optionList,
            newItem = $('<li><a href="#" class="list-link" data-action="trendscol"><strong>Trends Column</strong><i class="chev-right"></i></a></li>');

        $(menu.parent()).append(newItem);
        newItem.on('click', function() {
            settings.$optionList.removeClass('selected');
            settings.currentTab.destroy();
            settings.currentTab = new TD.components.TrendsColSettings;
            settings.currentTabName = 'trendscol', $(this).addClass('selected');
        });
        settings.$optionList.push(newItem.get(0));

        return settings;
    };

    TD.extensions = {
        Trends: function() {
            var trendColumns = [];
            var newsLangs = {
                'all': 'Any Language',
                'am': 'Amharic (\u12A0\u121B\u122D\u129B)',
                'ar': 'Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)',
                'bg': 'Bulgarian (\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438)',
                'bn': 'Bengali (\u09AC\u09BE\u0982\u09B2\u09BE)',
                'bo': 'Tibetan (\u0F56\u0F7C\u0F51\u0F0B\u0F66\u0F90\u0F51)',
                'chr': 'Cherokee (\u13E3\u13B3\u13A9)',
                'da': 'Danish (Dansk)',
                'de': 'German (Deutsch)',
                'dv': 'Maldivian (\u078B\u07A8\u0788\u07AC\u0780\u07A8)',
                'el': 'Greek (\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC)',
                'en': 'English (English)',
                'es': 'Spanish (Espa\u00F1ol)',
                'fa': 'Persian (\u0641\u0627\u0631\u0633\u06CC)',
                'fi': 'Finnish (Suomi)',
                'fr': 'French (Fran\u00E7ais)',
                'gu': 'Gujarati (\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0)',
                'iw': 'Hebrew (\u05E2\u05D1\u05E8\u05D9\u05EA)',
                'hi': 'Hindi (\u0939\u093F\u0902\u0926\u0940)',
                'hu': 'Hungarian (Magyar)',
                'hy': 'Armenian (\u0540\u0561\u0575\u0565\u0580\u0565\u0576)',
                'in': 'Indonesian (Bahasa Indonesia)',
                'is': 'Icelandic (\u00CDslenska)',
                'it': 'Italian (Italiano)',
                'iu': 'Inuktitut (\u1403\u14C4\u1483\u144E\u1450\u1466)',
                'ja': 'Japanese (\u65E5\u672C\u8A9E)',
                'ka': 'Georgian (\u10E5\u10D0\u10E0\u10D7\u10E3\u10DA\u10D8)',
                'km': 'Khmer (\u1781\u17D2\u1798\u17C2\u179A)',
                'kn': 'Kannada (\u0C95\u0CA8\u0CCD\u0CA8\u0CA1)',
                'ko': 'Korean (\uD55C\uAD6D\uC5B4)',
                'lo': 'Lao (\u0EA5\u0EB2\u0EA7)',
                'lt': 'Lithuanian (Lietuvi\u0173)',
                'ml': 'Malayalam (\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02)',
                'my': 'Myanmar (\u1019\u103C\u1014\u103A\u1019\u102C\u1018\u102C\u101E\u102C)',
                'ne': 'Nepali (\u0928\u0947\u092A\u093E\u0932\u0940)',
                'nl': 'Dutch (Nederlands)',
                'no': 'Norwegian (Norsk)',
                'or': 'Oriya (\u0B13\u0B21\u0B3C\u0B3F\u0B06)',
                'pa': 'Panjabi (\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40)',
                'pl': 'Polish (Polski)',
                'pt': 'Portuguese (Portugu\u00EAs)',
                'ru': 'Russian (\u0420\u0443\u0441\u0441\u043A\u0438\u0439)',
                'si': 'Sinhala (\u0DC3\u0DD2\u0D82\u0DC4\u0DBD)',
                'sv': 'Swedish (Svenska)',
                'ta': 'Tamil (\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD)',
                'te': 'Telugu (\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41)',
                'th': 'Thai (\u0E44\u0E17\u0E22)',
                'tl': 'Tagalog (Tagalog)',
                'tr': 'Turkish (T\u00FCrk\u00E7e)',
                'ur': 'Urdu (\uFE8D\uFEAD\uFEA9\uFEED)',
                'vi': 'Vietnamese (Ti\u1EBFng Vi\u1EC7t)',
                'zh': 'Chinese (\u4E2D\u6587)'
            };
            return {
                version: '4.1.1',
                init: function() {
                    //Find out which columns are trend columns
                    TD.controller.columnManager.getAllOrdered().forEach(function(col) {
                        var colTitle = col.model.getTitle();
                        if(colTitle.indexOf('Trends: ') > -1) {
                            var colKey = col.model.getKey();
                            var trendCol = new TD.components.TrendsColumn();
                            trendCol._init(colKey);
                            trendColumns.push(trendCol);
                        }
                    });
                    
                    if(trendColumns.length == 0)
                        this.addColumn();

                    this.verifySettings();
                    this.trackGoogleAnalytics();
                },
                getDefaultSettings: function() {
                    return {
                        'hashtagsDisabled': false, 
                        'autoUpdateFrequency': 300000, 
                        'newsLanguage': 'en'
                    };
                },
                getStoreSettings: function() {
                    return TD.storage.store.getJSON('TDTrendsColSettings');
                },
                setStoreSettings: function(settings) {
                    return TD.storage.store.setJSON('TDTrendsColSettings', settings);
                },
                getStoreSetting: function(name) {
                    var settings = this.getStoreSettings();
                    if (typeof settings[name] === 'undefined') {
                        console.log('TD.extensions.Trends attempting to fetch undefined setting "' +name +'"');
                        return false;
                    }
                    return settings[name];
                },
                setStoreSetting: function(name, value) {
                    var settings = this.getStoreSettings();
                    settings[name] = value;
                    this.setStoreSettings(settings);
                },
                verifySettings: function() {
                    var settings = this.getStoreSettings(),
                        defaultSettings = this.getDefaultSettings();

                    if (typeof settings.hashtagsDisabled !== 'boolean')
                        settings.hashtagsDisabled = defaultSettings.hashtagsDisabled;

                    if (typeof settings.autoUpdateFrequency !== 'number' || isNaN(settings.autoUpdateFrequency))
                        settings.autoUpdateFrequency = defaultSettings.autoUpdateFrequency;

                    if (typeof settings.newsLanguage !== 'string' || $.inArray(settings.newsLanguage, this.getAllLanguageCodes()) === -1)
                        settings.newsLanguage = defaultSettings.newsLanguage;

                    TD.storage.store.setJSON('TDTrendsColSettings', settings);
                },
                addColumn: function() {
                    var trendCol = new TD.components.TrendsColumn();
                    trendCol._init();
                    trendColumns.push(trendCol);
                },
                getColumnByKey: function(key) {
                    var i, result = trendColumns.filter(function(col) {
                        if (col.getKey() == key)
                            return true;
                        return false;
                    });
                    
                    if (result.length === 1)
                        return result[0];
                    
                    return false;
                },
                updateAllColumns: function() {
                    trendColumns.map(function(col) {
                        col.update();
                    });
                },
                isHashtagsDisabled: function() {
                    return this.getStoreSetting('hashtagsDisabled');
                },
                setHashtagsDisabled: function(isDisabled) {
                    this.setStoreSetting('hashtagsDisabled', isDisabled);
                    this.updateAllColumns();
                },
                getAutoUpdateFrequency: function() {
                    return this.getStoreSetting('autoUpdateFrequency');
                },
                setAutoUpdateFrequency: function(freq) {
                    var freq = parseInt(freq, 10);
                    if (isNaN(freq) === false) {
                        this.setStoreSetting('autoUpdateFrequency', freq);
                        this.updateAllColumns();
                    }
                },
                getNewsLanguage: function() {
                    return this.getStoreSetting('newsLanguage');
                },
                setNewsLanguage: function(newLang) {
                    this.setStoreSetting('newsLanguage', newLang);
                    this.updateAllColumns();
                },
                getAllLanguages: function() {
                    return newsLangs;
                },
                getAllLanguageCodes: function() {
                    return Object.keys(newsLangs);
                },
                trackGoogleAnalytics: function() {
                    //Google analytics tracking, just to see if anyone uses this
                    if(typeof(_gaq) != 'undefined' && _gaq.push) {
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
            };
        }()
    };
    
    $(window.document).one('TD.ready', function() {
        TD.extensions.Trends.init();
    });
}(unsafeWindow));