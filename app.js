document.getElementById('play-btn').onclick = function() {
  var base_url = "http://query.yahooapis.com/v1/public/yql?q=";
  var target_url = document.getElementById('url').value;
  var yql = "select * from html where url='" + target_url + "' and xpath='//a'";
  var url = base_url + encodeURIComponent(yql) + '&format=json&callback=parse';

  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = url;
  document.getElementById('yql').appendChild(script);
};

function parse(obj) {
  idSet = [];
  var idMap = {};
  for(var i = 0; i < obj.query.count; i++) {
    var url = obj.query.results.a[i].href;
    if(r = url.match(/https?:\/\/www.youtube.com\/watch\?v=(\w+)&?/)) {
      var id = r[1];
      if(id && !idMap.hasOwnProperty(id)) {
        idSet.push(id);
        idMap[id] = null;
      }
    }
  }

  player.loadPlaylist({
    playlist: idSet,
    suggestedQuality: 'hd720'
  });
}

(function() {
  var params = { allowScriptAccess: "always" };
  var atts = { id: "player" };
  swfobject.embedSWF("http://www.youtube.com/v/PLAYLIST_ID?enablejsapi=1&playerapiid=ytplayer&version=3",
                     "ytapiplayer", "800", "450", "8", null, null, params, atts);
})();