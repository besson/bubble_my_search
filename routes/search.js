var solr = require("solr-client");
var HashMap = require("hashmap").HashMap;
var map = new HashMap();
var async = require("async");
var config = require("../config.js")

exports.go = function(req, res){
  var keywords = (req.body.keywords).split(",");
  var client = solr.createClient(config.solr.host, config.solr.port, config.solr.core, "/solr");

  var searches = 0;

  async.each(keywords,
    function(entry, e ) {
      var query = client.createQuery().q(entry).rows(config.query.rows).fl(config.query.fl).sort(config.query.sort);
      client.search(query,function(err,obj) {
        console.log(obj.response.docs);
        map.set(entry, obj.response.docs);
        searches++;

        if (searches == keywords.length) {
          res.render("search", { title: "results", results: map });
        }

      });
      e();
    }
  );
}
