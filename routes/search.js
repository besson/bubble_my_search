var HashMap = require("hashmap").HashMap;
var map = new HashMap();
var async = require("async");
var request = require("request")
var http = require("http")
var JSONStream = require("JSONStream")
var es = require("event-stream")

exports.go = function(req, res){
  var keywords = (req.body.keywords).split(",");
  var searches = 0;

  async.each(keywords,
    function(entry, e ) {

      var country_options = {
        hostname: "api.worldbank.org",
        port: 80,
        path: "/countries/" + entry + "?format=json",
        method: "GET"
      }

    http.get(country_options, function(response) {
      response.pipe(JSONStream.parse("*.*")).pipe(es.mapSync(function(data) {

       if (data.id) {
          map.set(data.id, data);
          searches++;
       }

        if (searches == keywords.length) {
          res.render("search", { title: "results", results: map });
        }

      }))})
      e();
    }
  );
}
