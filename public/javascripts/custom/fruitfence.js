var app = {};
var localData = {};
window.onload = function() { app.init() };


var ua = navigator.userAgent,
    clickEvent = (ua.match(/iPad/i)) ? "touchstart" : "click";


app.init = function() {
  Tabletop.init( { 
    url: "https://docs.google.com/spreadsheet/pub?key=0AnUUGMHge9o_dGVweUY2TzRyd2N0Zl9CNE1kNGJhMGc&single=true&gid=0&output=html",
    key: "0AnUUGMHge9o_dGVweUY2TzRyd2N0Zl9CNE1kNGJhMGc",
    callback: app.showInfo,
    simpleSheet: true
  });
};


app.showInfo = function(data) {
  var data = data;
  localData.data = data;

  var template = $("#plantsTemplate").html();  
  $("#plants-list").html(_.template(template,{items: data}));
  app.loadOembed('#plants-list .media');

/*   app.loadAutocomplete(data); */
/*   app.setupFilter();  */
  
  
  app.bindTabs(); 
  app.tabInteractionsURL();
      
  app.loadTwitter();
};

app.loadPlanter = function() {
  var filtered = app.filterTwitter();

  if(localData.detail !== null) {
    if(localData.template === undefined) {
      localData.template = $("#detailTemplate").html();  
    }
    var detail = localData.detail;

    $("#detail-page").html(_.template(localData.template,{detail: detail}));
    app.loadOembed('#detail-page .media');

    if(localData.detail.tweets !== null) {
      if(localData.tweetTemplate === undefined) {
        localData.tweetTemplate = $("#detailTweetsTemplate").html();  
      }
      if(detail.tweets !== undefined) {
        $("#detail-tweets").html(_.template(localData.tweetTemplate,{tweets: detail.tweets}));
      }
    }
  }
};


// Add a hash to the URL when the user clicks on a tab.
app.bindTabs = function() {
  // Prevent multiple click event bindings, while still keeping the event listener for tab 'shown'
  $('a[data-toggle="tab"]').unbind(clickEvent);
  // Not IE7 compatible but oh well. If we need that we can switch to jquery address.
  $('a[data-toggle="tab"]').bind(clickEvent, function(e) {
    history.pushState(null, null, $(this).attr('href'));
    e.preventDefault();
    $(this).tab('show');
    if(location.search !== null){
      var search = location.search;
      search = search.split('=');
      if (search[0] === '?id') {
        localData.detail = _.find(localData.data, function(item){ return item.shortname == search[1]; });
        app.loadPlanter();
      }
    }   
  });
};

app.loadTwitter = function() {
  Core.query({}, app.storeTwitter);
};

app.filterTwitter = function () {
  if(localData.tweets !== undefined && localData.detail.shortname !== undefined) {
    localData.detail.tweets = [];
    // twitter feed ajax + twitter API for fruit fence
    var search = localData.detail.shortname;
    console.log(search);

    for(var i = 0; i < localData.tweets.length; i++) {
      var tweet = localData.tweets[i];

      if(tweet.entities !== undefined){
        for(var j = 0; j < tweet.entities.hashtags.length; j++) {      
        var hashtag = tweet.entities.hashtags[j]["text"];
        console.log(hashtag);
        if(hashtag === search) {
          var date = new Date(tweet.updated_at);
          tweet.date = date.format("m/dd/yy hh:ss");      
          localData.detail.tweets.push(tweet);
          }   
        }
      }
    }
    localData.detail.tweets.reverse();
    return true;  
  }
};

app.storeTwitter = function(data) {
  var data = data;
  
  console.log(data);
  localData.tweets = data;
  // load tweets, pull all where contains @fruitfence and shortname
};

// Navigate to a tab when the history changes
app.tabInteractionsURL = function(){
  window.addEventListener("popstate", function(e) {
    
    var activeTab = $('[href=' + location.hash + ']');

    if (activeTab.length) {
      activeTab.tab('show');  
    }
    else {
      $('#home').tab('show');
    }

    $('html, body').animate({scrollTop:0}, 'fast');
  });
};


app.loadOembed = function(container) {
  var container = container;
  // https://github.com/starfishmod/jquery-oembed-all
    $(container).each(function(){
      var url = $(this).find('.image').attr('href');
      console.log(url);
      if(url !== undefined && url !== "" && url !== null) {

        var flickr = url.match(/flickr.com/g);
        var youtube = url.match(/youtube.com/g);
        var vimeo = url.match(/vimeo.com/g);
        var twitpic = url.match(/twitpic.com/g);
        var photobucket = url.match(/photobucket.com/g);
        var instagram = url.match(/instagram.com/g);
        var twitter = url.match(/twitter.com/g);
        
        var jpeg = url.match(/.jpeg$/g);
        var jpg = url.match(/.jpg$/g);
        var png = url.match(/.png$/g);
        var gif = url.match(/.gif$/g);
        
      if(flickr !== null || youtube !== null || vimeo !== null || twitpic !== null || photobucket !== null || instagram !== null || twitter !== null) {

        $(this).find('.image').oembed(url,{
            embedMethod: "replace", 
                maxWidth: 300,
                maxHeight: 300,
                vimeo: { autoplay: false, maxWidth: 300, maxHeight: 260},
                youtube: { autoplay: false, maxWidth: 300, maxHeight: 260},
        });

        /*     $(this).find('.embed').embedly({key: "b17f593c1c734ce5af968cebe29474ec"}); */
      }
      else if(jpeg !== null || jpg !== null || png !== null || gif !== null) {
      console.log(jpg);
      console.log(url);
        var link = '<a href="' + url + '" target="_blank" class="image"><img src="' + url + '" /></a>';
        console.log($(this));
        $(this).html(link);
        
      }
  }
  else {
        var link = '<a href="' + url + '" target="_blank" class="image"><img src="images/placeholder.png" /></a>';
    $(this).html(link);



  }    
  });
};


app.setupFilter = function() {
  $('.filter').change(function() {
    var count = 0;
    $('#symbols-autocomplete').val('');        
    var link_category = $(this).find("option:selected").text();
    $('#symbols-list .symbol').each(function(){  
      var category = $(this).find('.status').html();    
      var re = new RegExp("regex","g");
      var match = category.match(re, link_category);
      
      if(category.indexOf(link_category) != -1){
        $(this).show();
        $('.number-symbols').html(count + " for " + link_category);
        count++;

      }
      else if(link_category === "All"){
        $(this).show();
        count++;

      }
      else{
        $(this).hide();
      }
    });
  });
};


app.loadAutocomplete = function(data) {
  var autocomplete = [];
  for (var i in data) {
    var item = data[i];
    if(item.tags !== null) {
      var item_categories = item.tags.split(",");
    }
    else {
      var item_categories = [];
    }
    autocomplete = _.union(autocomplete, item.name, item_categories);
  }

  $('#symbols-autocomplete').typeahead({source:autocomplete});
  
  $('#symbols-autocomplete').change(function(){
    $('#symbols-options').val("all");
    var count = 0;
    var query =  $('input#symbols-autocomplete').val();
    $('#symbols-list .symbol').each(function(){  
      var text = $(this).html();      
      var match = text.search(query);
      if(match != -1){
        $(this).show();
        count++;
        $('.number-symbols').html(count + " for " + query);
      }
      else if(query === ""){
        $(this).show();
        count++;
        $('.number-symbols').html(count);
      }
      else{
        $(this).hide();
      }
    });  
  });
};