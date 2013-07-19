function $(s) { return document.getElementById(s); }

$('play-btn').onclick = function() {
  var base_url = "http://query.yahooapis.com/v1/public/yql?q=";
  var target_url = $('url').value;
  var yql = "select * from html where url='" + target_url + "' and xpath='//a'";
  var url = base_url + encodeURIComponent(yql) + '&format=json&callback=parse';

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = url;
  $('yql').appendChild(script);
  if($('icon').classList) {
    $('icon').classList.remove('icon-play');
    $('icon').classList.add('icon-spinner', 'icon-spin');
  }
};

function parse(obj) {
  idSet = [];
  var idMap = {};
  rr = obj;
  for(var i = 0; i < obj.query.count; i++) {
    var url = obj.query.results.a[i].href;
    if(url) {
      var r = url.match(/https?:\/\/(www.youtube.com\/watch\?v=|youtu.be\/)(\w+)&?/);
      if(r && r[2]) {
        var id = r[2];
        if(id && !idMap.hasOwnProperty(id)) {
          idSet.push(id);
          idMap[id] = null;
        }
      }
    }
  }

  if(idSet.length != 0) {
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

(function() {
  var params = { allowScriptAccess: "always" };
  var atts = { id: "player" };
  swfobject.embedSWF("http://www.youtube.com/v/PLAYLIST_ID?enablejsapi=1&playerapiid=ytplayer&version=3",
                     "ytapiplayer", "800", "450", "8", null, null, params, atts);

  $('url').focus();
})();