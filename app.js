function $(s) { return document.getElementById(s); }
sidMap = {};

$('play-btn').onclick = function() {
  var yql = "select href from html where url='" + $('url').value + "' and xpath='//a'";
  query(yql, parse_yt);
  $('ytplayer').style.visibility = 'visible';
  if($('icon').classList) {
    $('icon').classList.remove('icon-play');
    $('icon').classList.add('icon-spinner', 'icon-spin');
  }
};

function query(yql, callback, diagnostics) {
  var base_url = "http://query.yahooapis.com/v1/public/yql?q=";
  var url = base_url + encodeURIComponent(yql) + '&format=json&callback=' + callback.name;
  if(diagnostics) {
    url = url.concat('&diagnostics=true');
  }
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = url;
  $('yql').appendChild(script);
}

function extract_id(yt_url) {
  var r = yt_url.match(/https?:\/\/(www.youtube.com\/watch\?v=|youtu.be\/)([\w-]+)&?/);
  return (r && r[2]) ? r[2] : null;
}

function parse_yt(obj) {
  var idSet = [];
  idMap = {};
  rr = obj;
  for(var i = 0; i < obj.query.count; i++) {
    var url = obj.query.results.a[i].href;
    if(url) {
      var id = extract_id(url);
      if(id && !idMap.hasOwnProperty(id)) {
        idSet.push(id);
        idMap[id] = null;
      }
      if(url.match(/http:\/\/(ppt.cc|tinyurl.com)\//)) {
        var yql = "select none from html where url='" + url + "'";
        query(yql, parse_short_url, true);
      }
    }
  }
  console.log(idSet);

  if(idSet.length !== 0) {
    player.loadPlaylist({
      playlist: idSet,
      suggestedQuality: 'hd720'
    });
  } else {
    alert('There is no any youtube link');
  }

  if($('icon').classList) {
    $('icon').classList.remove('icon-spinner', 'icon-spin');
    $('icon').classList.add('icon-play');
  }
}

function parse_short_url(obj) {
  if(obj.query.diagnostics.redirect) {
    var id = extract_id(obj.query.diagnostics.redirect.content);
    if(id && !sidMap.hasOwnProperty(id)) {
      sidMap[id] = null;
    }
  }
}

(function() {
  var params = { allowScriptAccess: "always" };
  var atts = { id: "player", class: '' };
  swfobject.embedSWF("http://www.youtube.com/v/PLAYLIST_ID?enablejsapi=1&playerapiid=ytplayer&version=3",
                     "ytapiplayer", "800", "450", "8", null, null, params, atts);

  $('url').focus();
})();

function onYouTubePlayerReady(playerId) {
  player.addEventListener("onStateChange", "onVideoEnded");
  loadFromQueryString();
}

function onVideoEnded(newState) {
  if(newState === 0) {
    var sidSet = [];
    for(var k in sidMap)
      sidSet.push(k);

    if(sidSet.length > 0) {
      player.loadPlaylist({
        playlist: sidSet,
        suggestedQuality: 'hd720'
      });
      sidMap = {};
    }
  }
}

function loadFromQueryString() {
  var s = decodeURIComponent(window.location.search.substring(1));
  var pairs = s.split('&');
  var params = {};
  for(var i = 0; i < pairs.length; i++) {
    var p = pairs[i].split('=');
    params[p[0]] = p[1];
  }

  if(params['url']) {
    $('url').value = params['url'];
    $('play-btn').click();
  }
}
