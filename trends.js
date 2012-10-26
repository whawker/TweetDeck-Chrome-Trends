//Copy and paste this code at the bottom of default.js
//Trends column extension by Will Hawker (www.willhawker.com || www.github.com/whawker/TweetDeck-Chrome-Trends)
TD.extensions = {};
TD.extensions.Trends = function() {
    var a = {},
    handle='',
    refreshTime = 300000,
    location = 23424975,
    filters = [],
    trendItem = '<article class="stream-item" style="min-height: 50px;"><div class="item-box item-content"><div class="tweet" style="padding-left: 0;"><header class="tweet-header"></header><div class="tweet-body"><p></p><footer></footer></div><i class="sprite tweet-dogear"></i></div></div></article>',
    trendSelector = $('<div class="control-group stream-item" style="margin: 10px 0 0; padding-bottom: 10px;"><label for="trend-location" style="width: 100px; font-weight: bold; margin-left: 5px;" class="control-label">Trend Location</label> <div class="controls" style="margin-left: 113px;"><select name="trend-location" id="trend-location" style="width: 190px;"><option value="1">Worldwide</option><option value="23424747">Argentina</option><option value="468739">&nbsp;&nbsp;&nbsp;&nbsp;Buenos Aires</option><option value="23424748">Australia</option><option value="1105779">&nbsp;&nbsp;&nbsp;&nbsp;Sydney</option><option value="23424768">Brazil</option><option value="455819">&nbsp;&nbsp;&nbsp;&nbsp;Bras&iacute;lia</option><option value="455830">&nbsp;&nbsp;&nbsp;&nbsp;Fortaleza</option><option value="455833">&nbsp;&nbsp;&nbsp;&nbsp;Manaus</option><option value="455825">&nbsp;&nbsp;&nbsp;&nbsp;Rio de Janeiro</option><option value="455826">&nbsp;&nbsp;&nbsp;&nbsp;Salvador</option><option value="455827">&nbsp;&nbsp;&nbsp;&nbsp;S&atilde;o Paulo</option><option value="23424775">Canada</option><option value="3534">&nbsp;&nbsp;&nbsp;&nbsp;Montreal</option><option value="4118">&nbsp;&nbsp;&nbsp;&nbsp;Toronto</option><option value="9807">&nbsp;&nbsp;&nbsp;&nbsp;Vancouver</option><option value="23424782">Chile</option><option value="349859">&nbsp;&nbsp;&nbsp;&nbsp;Santiago</option><option value="23424787">Colombia</option><option value="368148">&nbsp;&nbsp;&nbsp;&nbsp;Bogot&aacute;</option><option value="23424800">Dominican Republic</option><option value="76456">&nbsp;&nbsp;&nbsp;&nbsp;Santo Domingo</option><option value="23424801">Ecuador</option><option value="23424819">France</option><option value="609125">&nbsp;&nbsp;&nbsp;&nbsp;Lyon</option><option value="610264">&nbsp;&nbsp;&nbsp;&nbsp;Marseille</option><option value="615702">&nbsp;&nbsp;&nbsp;&nbsp;Paris</option><option value="23424829">Germany</option><option value="638242">&nbsp;&nbsp;&nbsp;&nbsp;Berlin</option><option value="656958">&nbsp;&nbsp;&nbsp;&nbsp;Hamburg</option><option value="676757">&nbsp;&nbsp;&nbsp;&nbsp;Munich</option><option value="23424834">Guatemala</option><option value="23424848">India</option><option value="2295402">&nbsp;&nbsp;&nbsp;&nbsp;Ahmedabad</option><option value="2295420">&nbsp;&nbsp;&nbsp;&nbsp;Bangalore</option><option value="2295424">&nbsp;&nbsp;&nbsp;&nbsp;Chennai</option><option value="20070458">&nbsp;&nbsp;&nbsp;&nbsp;Delhi</option><option value="2295414">&nbsp;&nbsp;&nbsp;&nbsp;Hyderabad</option><option value="2295411">&nbsp;&nbsp;&nbsp;&nbsp;Mumbai</option><option value="23424846">Indonesia</option><option value="1047180">&nbsp;&nbsp;&nbsp;&nbsp;Bandung</option><option value="1030077">&nbsp;&nbsp;&nbsp;&nbsp;Bekasi</option><option value="1047378">&nbsp;&nbsp;&nbsp;&nbsp;Jakarta</option><option value="1044316">&nbsp;&nbsp;&nbsp;&nbsp;Surabaya</option><option value="23424803">Ireland</option><option value="560743">&nbsp;&nbsp;&nbsp;&nbsp;Dublin</option><option value="23424853">Italy</option><option value="23424856">Japan</option><option value="1117099">&nbsp;&nbsp;&nbsp;&nbsp;Fukuoka</option><option value="15015372">&nbsp;&nbsp;&nbsp;&nbsp;Kyoto</option><option value="1117817">&nbsp;&nbsp;&nbsp;&nbsp;Nagoya</option><option value="2345896">&nbsp;&nbsp;&nbsp;&nbsp;Okinawa</option><option value="15015370">&nbsp;&nbsp;&nbsp;&nbsp;Osaka</option><option value="1118108">&nbsp;&nbsp;&nbsp;&nbsp;Sapporo</option><option value="1118129">&nbsp;&nbsp;&nbsp;&nbsp;Sendai</option><option value="1118285">&nbsp;&nbsp;&nbsp;&nbsp;Takamatsu</option><option value="1118370">&nbsp;&nbsp;&nbsp;&nbsp;Tokyo</option><option value="23424901">Malaysia</option><option value="1154726">&nbsp;&nbsp;&nbsp;&nbsp;Klang</option><option value="1154781">&nbsp;&nbsp;&nbsp;&nbsp;Kuala Lumpur</option><option value="23424900">Mexico</option><option value="116545">&nbsp;&nbsp;&nbsp;&nbsp;Mexico City</option><option value="134047">&nbsp;&nbsp;&nbsp;&nbsp;Monterrey</option><option value="23424909">Netherlands</option><option value="727232">&nbsp;&nbsp;&nbsp;&nbsp;Amsterdam</option><option value="726874">&nbsp;&nbsp;&nbsp;&nbsp;Den Haag</option><option value="733075">&nbsp;&nbsp;&nbsp;&nbsp;Rotterdam</option><option value="23424916">New Zealand</option><option value="23424908">Nigeria</option><option value="1398823">&nbsp;&nbsp;&nbsp;&nbsp;Lagos</option><option value="23424922">Pakistan</option><option value="23424919">Peru</option><option value="418440">&nbsp;&nbsp;&nbsp;&nbsp;Lima</option><option value="23424934">Philippines</option><option value="1199477">&nbsp;&nbsp;&nbsp;&nbsp;Manila</option><option value="1199682">&nbsp;&nbsp;&nbsp;&nbsp;Quezon City</option><option value="23424936">Russia</option><option value="2122265">&nbsp;&nbsp;&nbsp;&nbsp;Moscow</option><option value="2122541">&nbsp;&nbsp;&nbsp;&nbsp;Novosibirsk</option><option value="2123260">&nbsp;&nbsp;&nbsp;&nbsp;Saint Petersburg</option><option value="23424948">Singapore</option><option value="23424942">South Africa</option><option value="1582504">&nbsp;&nbsp;&nbsp;&nbsp;Johannesburg</option><option value="23424950">Spain</option><option value="753692">&nbsp;&nbsp;&nbsp;&nbsp;Barcelona</option><option value="766273">&nbsp;&nbsp;&nbsp;&nbsp;Madrid</option><option value="23424954">Sweden</option><option value="906057">&nbsp;&nbsp;&nbsp;&nbsp;Stockholm</option><option value="23424969">Turkey</option><option value="2343732">&nbsp;&nbsp;&nbsp;&nbsp;Ankara</option><option value="2344116">&nbsp;&nbsp;&nbsp;&nbsp;Istanbul</option><option value="2344117">&nbsp;&nbsp;&nbsp;&nbsp;Izmir</option><option value="23424738">United Arab Emirates</option><option value="23424975" selected="selected">United Kingdom</option><option value="12723">&nbsp;&nbsp;&nbsp;&nbsp;Birmingham</option><option value="21125">&nbsp;&nbsp;&nbsp;&nbsp;Glasgow</option><option value="44418">&nbsp;&nbsp;&nbsp;&nbsp;London</option><option value="28218">&nbsp;&nbsp;&nbsp;&nbsp;Manchester</option><option value="23424977">United States</option><option value="2357024">&nbsp;&nbsp;&nbsp;&nbsp;Atlanta</option><option value="2357536">&nbsp;&nbsp;&nbsp;&nbsp;Austin</option><option value="2358820">&nbsp;&nbsp;&nbsp;&nbsp;Baltimore</option><option value="2359991">&nbsp;&nbsp;&nbsp;&nbsp;Baton Rouge</option><option value="2364559">&nbsp;&nbsp;&nbsp;&nbsp;Birmingham</option><option value="2367105">&nbsp;&nbsp;&nbsp;&nbsp;Boston</option><option value="2378426">&nbsp;&nbsp;&nbsp;&nbsp;Charlotte</option><option value="2379574">&nbsp;&nbsp;&nbsp;&nbsp;Chicago</option><option value="2380358">&nbsp;&nbsp;&nbsp;&nbsp;Cincinnati</option><option value="2381475">&nbsp;&nbsp;&nbsp;&nbsp;Cleveland</option><option value="2383660">&nbsp;&nbsp;&nbsp;&nbsp;Columbus</option><option value="2388929">&nbsp;&nbsp;&nbsp;&nbsp;Dallas-Ft. Worth</option><option value="2391279">&nbsp;&nbsp;&nbsp;&nbsp;Denver</option><option value="2391585">&nbsp;&nbsp;&nbsp;&nbsp;Detroit</option><option value="2414469">&nbsp;&nbsp;&nbsp;&nbsp;Greensboro</option><option value="2418046">&nbsp;&nbsp;&nbsp;&nbsp;Harrisburg</option><option value="2424766">&nbsp;&nbsp;&nbsp;&nbsp;Houston</option><option value="2427032">&nbsp;&nbsp;&nbsp;&nbsp;Indianapolis</option><option value="2428184">&nbsp;&nbsp;&nbsp;&nbsp;Jackson</option><option value="2436704">&nbsp;&nbsp;&nbsp;&nbsp;Las Vegas</option><option value="2442047">&nbsp;&nbsp;&nbsp;&nbsp;Los Angeles</option><option value="2449323">&nbsp;&nbsp;&nbsp;&nbsp;Memphis</option><option value="2450022">&nbsp;&nbsp;&nbsp;&nbsp;Miami</option><option value="2451822">&nbsp;&nbsp;&nbsp;&nbsp;Milwaukee</option><option value="2452078">&nbsp;&nbsp;&nbsp;&nbsp;Minneapolis</option><option value="2457170">&nbsp;&nbsp;&nbsp;&nbsp;Nashville</option><option value="2458410">&nbsp;&nbsp;&nbsp;&nbsp;New Haven</option><option value="2458833">&nbsp;&nbsp;&nbsp;&nbsp;New Orleans</option><option value="2459115">&nbsp;&nbsp;&nbsp;&nbsp;New York</option><option value="2460389">&nbsp;&nbsp;&nbsp;&nbsp;Norfolk</option><option value="2466256">&nbsp;&nbsp;&nbsp;&nbsp;Orlando</option><option value="2471217">&nbsp;&nbsp;&nbsp;&nbsp;Philadelphia</option><option value="2471390">&nbsp;&nbsp;&nbsp;&nbsp;Phoenix</option><option value="2473224">&nbsp;&nbsp;&nbsp;&nbsp;Pittsburgh</option><option value="2475687">&nbsp;&nbsp;&nbsp;&nbsp;Portland</option><option value="2477058">&nbsp;&nbsp;&nbsp;&nbsp;Providence</option><option value="2478307">&nbsp;&nbsp;&nbsp;&nbsp;Raleigh</option><option value="2480894">&nbsp;&nbsp;&nbsp;&nbsp;Richmond</option><option value="2486340">&nbsp;&nbsp;&nbsp;&nbsp;Sacramento</option><option value="2487610">&nbsp;&nbsp;&nbsp;&nbsp;Salt Lake City</option><option value="2487796">&nbsp;&nbsp;&nbsp;&nbsp;San Antonio</option><option value="2487889">&nbsp;&nbsp;&nbsp;&nbsp;San Diego</option><option value="2487956">&nbsp;&nbsp;&nbsp;&nbsp;San Francisco</option><option value="2490383">&nbsp;&nbsp;&nbsp;&nbsp;Seattle</option><option value="2486982">&nbsp;&nbsp;&nbsp;&nbsp;St. Louis</option><option value="2503713">&nbsp;&nbsp;&nbsp;&nbsp;Tallahassee</option><option value="2503863">&nbsp;&nbsp;&nbsp;&nbsp;Tampa</option><option value="2514815">&nbsp;&nbsp;&nbsp;&nbsp;Washington</option><option value="23424982">Venezuela</option><option value="468382">&nbsp;&nbsp;&nbsp;&nbsp;Barquisimeto</option><option value="395269">&nbsp;&nbsp;&nbsp;&nbsp;Caracas</option><option value="395270">&nbsp;&nbsp;&nbsp;&nbsp;Maracaibo</option><option value="395272">&nbsp;&nbsp;&nbsp;&nbsp;Valencia</option></select></div></div>');
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
        if($('h1:contains("Trends")').parent().parent().size()){
            return $('h1:contains("Trends")').parent().parent();
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
    a.init = function() {
        allTdColumns = a.getAllColumns();
        if(allTdColumns.length == 0) {
            setTimeout(a.init, 500);
            return;
        }
        if(a.getTrendsColumn() === false) {
            var myTwitterAccount = TD.storage.accountController.getPreferredAccount('twitter'),
            myColTrends = TD.controller.columnManager.makeColumnFor('Trends: United Kingdom', 'other', myTwitterAccount.getType(), myTwitterAccount.getKey());
            TD.controller.columnManager.addColumnToUI(myColTrends);
        }
		var woeid = $('option:contains("' +a.getTitle() +'")', trendSelector).val();
		a.setTrendLocationWoeid(woeid);
        handle = TD.storage.accountController.getPreferredAccount().getUsername();
		a.addTrendingTopics();
        trackGoogleAnalytics();
    }
    a.clearTrends = function() {
        var column = a.getJTrendsColumn();
        if(column !== false){
            column.find('div.column-content').empty();
        }
    }
    a.addTrendingTopics = function() {
        var addTopics = window.setInterval(function(){
            var gt = getTrends();
            if(gt === false) {
                window.clearInterval(addTopics);
                window.setTimeout(a.addTrendingTopics, 5000);
            }
        }, 1000);
    }
    a.setFilters = function(filterArr) {
        filters = filterArr;
    }
    a.getFilters = function() {
        return filters;
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
	var addTrendLocationSelector = function(column) {
		column.find('div.column-content').empty().append(trendSelector);
		$('#trend-location').val(a.getTrendLocationWoeid()).change(function(){
			$(this).find('option:selected').each(function(){
				var loc = $(this);
				a.setTrendLocationWoeid(loc.val());
				a.clearTrends();
				a.setTitle($.trim(loc.text()));
			});
		});
	}
    var getTrends = function() {
        var column = a.getJTrendsColumn();
        if(column !== false){
            if(column.find('div.column-content').is(':empty')){
                var f, textFilter = getGlobalTextContentFilters();
                $.ajax({
                    url: 'https://api.twitter.com/1/trends/' +a.getTrendLocationWoeid() +'.json',
                    dataType: 'json',
                    data: {},
                    success: function(response) {
                        addTrendLocationSelector(column);
                        $.each(response[0].trends, function(i, item) {
                            for (f in textFilter) {
                                if((item.name).toLowerCase().indexOf(textFilter[f]) != -1) return 'continue'; //Hide this trend, continue to next loop iteration
                            }
                            var t = $(trendItem);
                            t.find('header').append('<a class="account-link" href="' +item.url +'" onclick="TD.ui.openColumn.showSearch(\'' +(item.name).replace('\'', '\\\'') +'\'); return false;"><b class="fullname">'+item.name +'</b></a>');
                            column.find('div.column-content').append(t);
                        });
                        setTimeout(a.clearTrends, a.getRefreshTime());
                        return true;
                    },
                    failure: function(response) {
                        console.log(response);
                        return false;
                    }
                });
            }
        }
    }
    return a;
}();
//Override TD.ui.main.init to include TD.extension.Trends.init
TD.ui.main.init=function(){var a=TD.ui.main,var b=TD.ui.template.render("topbar/app_header"),c=$("body");c.prepend(b),c.on("click","a",function(a){var b=TD.util.maybeOpenClickExternally(a)}),TD.ui.columns.init(),TD.ui.columnNav.init(),TD.ui.updates.init(),TD.ui.compose.init(),TD.ui.openColumn.init(),TD.extensions.Trends.init(),$(".js-app-header").live("click",a.handleHeaderUI),$(".js-show-tip").tipsy({live:!0,gravity:"s"}),$(".js-show-tip-n").tipsy({live:!0,gravity:"n"});var d=$(".js-search-form"),e=$(".js-search-input");e.keydown(function(a){a.which===TD.constants.keyCodes.escape&&e.val("").blur()}).closest("form").submit(function(a){TD.ui.openColumn.showSearch(e.val()),e.val(""),e.blur(),a.preventDefault()});var f=$("#topbar").find(".js-perform-search");f.click(function(a){TD.ui.openColumn.showSearch(e.val()),e.val(""),e.focus()}),c.on("click","a",function(a){var b=$(a.currentTarget),c=b.attr("rel"),d=!1;switch(c){case"user":var e=_.last(b.attr("href").split("/"));$("body").trigger("uiShowProfile",{id:e}),d=!0;break;case"hashtag":TD.ui.openColumn.showSearch(b.text()),d=!0}d&&a.preventDefault(),a.isDefaultPrevented()===!1&&(TD.util.openURL(b.attr("href")),a.preventDefault())}),c.on("click","button",function(a){a.preventDefault()}),$.subscribe("/storage/client/settings/use_narrow_columns",a.updateColumnSize),a.updateColumnSize(),$.subscribe("/storage/client/settings/font_size",a.updateFontSize),a.updateFontSize(),$.subscribe("/storage/client/settings/theme",a.updateTheme),a.updateTheme()}
//Override TD.services.TwitterClient.prototype.makeTwitterCall to pull most popular tweets
TD.services.TwitterClient.prototype.makeTwitterCall=function(a,b,c,d,e,f,g){
    if (a.indexOf('search.json') != -1 && 'result_type' in b && 'count' in b) {
        b.result_type = 'popular,mixed,recent';
        b.count = 50;
    }
    var h=this,i=function(a){if(e)try{a=e.call(h,a)}catch(b){console.log("Error processing Twitter data",a,b),g(b);return}f&&f(a)},j=function(f,i,j){var k,l=[];f.responseText&&(k=JSON.parse(f.responseText),k&&k.errors&&(typeof k.errors=="string"?l.push(h.getError(k.errors,f,a,b)):_.each(k.errors,function(c){l.push(h.getError(c,f,a,b))}))),$(document).trigger("twitterCallError",{request:{url:a,params:b,method:c,isSigned:d,processor:e},response:{xhr:f,ts:i,error:j},errors:l}),g&&g(f,i,j,l)};b?(b.include_entities=1,b.include_user_entities=1,b.include_cards=1):b={},b.send_error_codes=1,c==="GET"?this.get(a,b,d,i,j):this.post(a,b,null,null,i,j)
}