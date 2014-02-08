var request = require("request")
var JSONStream = require("JSONStream")
var es = require("event-stream")
var http = require("http")
var fs = require('fs')

// Still imcomplete 

  var file = fs.createWriteStream("terms.json")
  file.write('{"nodes": [\n')

  var country_options = {
    hostname: "api.worldbank.org",
    port: 80,
    path: "/countries?per_page=256&format=json",
    method: "GET"
  }

  var get_content = function() {
    http.get(country_options, function(res) {
      res.pipe(JSONStream.parse("*.*")).pipe(es.mapSync(function(data) {

        if (data.id && data.id != "MIC" && data.id != "WLD" && data.id != "LMY" && data.id != "SYC") {
          save_country_data(data)
        }

      }))
    })
  }

  var save_country_data = function(country) {
    var population_options = {
      hostname: "api.worldbank.org",
      port: 80,
      path: "/countries/" + country.id + "/indicators/SP.POP.TOTL?per_page=10&date=2012:2012&format=json",
      method: "GET"
    }

    http.get(population_options, function(pop_res) {
      pop_res.pipe(JSONStream.parse("*.*.value")).pipe(es.mapSync(function(pop_data) {
        file.write('{"label": "' + country.id + '", "size": ' + (pop_data / 10000) + 
                   ', "name": "' + country.name + ', "cluster": "' + country.region.id + '"},\n')
      }))
    })
  }


get_content();