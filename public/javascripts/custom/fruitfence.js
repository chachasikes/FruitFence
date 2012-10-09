window.onload = function() { init() };

function init() {
/*
  Tabletop.init( { 
    url: "https://docs.google.com/spreadsheet/pub?key=0AnUUGMHge9o_dFVnMXJyZlY3Z2RBMGdId3d1dGZ2dVE&single=true&gid=1&output=html",
    key: "0AnUUGMHge9o_dFVnMXJyZlY3Z2RBMGdId3d1dGZ2dVE",
    callback: showInfo,
    simpleSheet: true
  });
*/
  
  
/*
    $.ajax({
    url: "/symbols",
    dataType: 'json',
    success: showInfo,
    error: function(error) { console.log("query error! " + error); console.log(error); return false; }
  });
*/
  
  bindTabs(); 
  tabInteractionsURL();
}


function showInfo(data) {
  var data = data.symbols;

 /*
 var template = $("#symbolsTemplate").html();  
  $("#symbols-list").html(_.template(template,{symbols: data}));  
  loadOembed('#symbols-list .media');
  loadAutocomplete(data);
  setupFilter(); 
  
  $('.expand').toggle(
    function(){$(this).parent().find('.content').show(); $(this).html('<i class="icon-minus"></i>Hide'); },
    function(){$(this).parent().find('.content').hide(); $(this).html('<i class="icon-plus"></i>Details'); }

  );

  $('.symbol .content').hide();
*/

}


loadOembed = function(container) {
  var container = container;
  // https://github.com/starfishmod/jquery-oembed-all
    $(container).each(function(){
      var url = $(this).find('.image').attr('href');
      if(url !== undefined) {

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
        var link = '<a href="' + url + '" target="_blank" class="image"><img src="' + url + '" /></a>';
        $(this).find('.media').html(link);
        
      }
      else {
        var link = "";
        $(this).find('.media').css("height","auto");
      }
  }    
  });
};

function loadAutocomplete(data) {
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
}

var ua = navigator.userAgent,
    clickEvent = (ua.match(/iPad/i)) ? "touchstart" : "click";

// Add a hash to the URL when the user clicks on a tab.
function bindTabs() {

  // Prevent multiple click event bindings, while still keeping the event listener for tab 'shown'
  $('a[data-toggle="tab"]').unbind(clickEvent);
  // Not IE7 compatible but oh well. If we need that we can switch to jquery address.
  $('a[data-toggle="tab"]').bind(clickEvent, function(e) {
    //console.log("-----BINDING TABS-----" + $(this).attr('href'));
    history.pushState(null, null, $(this).attr('href'));
    e.preventDefault();
    $(this).tab('show');
  });
};

// Navigate to a tab when the history changes
function tabInteractionsURL(){
  window.addEventListener("popstate", function(e) {
    
    var activeTab = $('[href=' + location.hash + ']');

    if (activeTab.length) {
      activeTab.tab('show');
      
    } else {
      $('#home').tab('show');
    }
    $('html, body').animate({scrollTop:0}, 'fast');
  });
};

function setupFilter() {
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
  
  
  
}