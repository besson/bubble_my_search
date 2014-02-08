var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 1500 - margin.left - margin.right,
    height = 960 - margin.top - margin.bottom;

var n = 200,
    m = 100,
    padding = 3,
    radius = d3.scale.linear().domain([13000,1100000]).range([20,150]),
    color = d3.scale.category20c().domain(d3.range(m));

d3.json("/data/terms.json", function(error, json) {
  var nodes = json.nodes.map(function(node) {
    return {
      radius: radius(Math.floor(node.size)),
      color: color(node.cluster),
      label: node.label,
    };
  });

  var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(0)
      .charge(0)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  var elem = svg.selectAll("g myCircleText").data(nodes);

  var elementEnter = elem.enter()
  .append("g");

  var circle = elementEnter
      .append("circle")
      .attr("r", function(d) { return d.radius; })
      .style("fill", function(d) { return d.color; })
      .on("click", expand)
      .call(force.drag)
      elementEnter.append("text")
      .style("text-anchor", "middle");

function tick(e) {
  elementEnter.select("circle")
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

  elementEnter.select("text")
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      .attr("dx", function(d) {return d.x})
      .attr("dy", function(d) {return d.y})
      .text(function(d){return (d.label).substring(0, d.radius/6);})
      .attr("fill", function(d){ return 'black';});
}

function expand(e) {

  if (e.class == "selected") {
      e.fixed = 0;
      e.radius = e.radius / 1.8;
      force.start();
      e.class = "default"
      d3.select("#search-options").select("#opt-" + e.label.replace(" ","")).remove();
  } else {
      e.radius = e.radius * 1.8;
      e.fixed = 1;
      e.class = "selected"
      d3.select("#search-options").append("p").attr("id", "opt-" + e.label.replace(" ", "")).attr("name", e.label).attr("style", "font: 17px sans-serif;").text(e.label);
  }
}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  var max = {};

  // Find the largest node for each cluster.
  nodes.forEach(function(d) {
    if (!(d.color in max) || (d.radius > max[d.color].radius)) {
      max[d.color] = d;
    }
  });

  return function(d) {
    var node = max[d.color],
        l,
        r,
        x,
        y,
        k = 1,
        i = -1;

    // For cluster nodes, apply custom gravity.
    if (node == d) {
      node = {x: width / 2, y: height / 2, radius: -d.radius};
      k = .1 * Math.sqrt(d.radius);
    }

    x = d.x - node.x;
    y = d.y - node.y;
    l = Math.sqrt(x * x + y * y);
    r = d.radius + node.radius;
    if (l != r) {
      l = (l - r) / l * alpha * k;
      d.x -= x *= l;
      d.y -= y *= l;
      node.x += x;
      node.y += y;
    }
  };
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + radius.domain()[1] + padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
  };
}

  d3.select("#search").on("click", function(e) {
    var keyWords = "";
     d3.select("#search-options").selectAll("p").each(function(d,i){
       keyWords = keyWords + this.innerText + ",";
     });

     keyWords = keyWords.substring(0, keyWords.length - 1);
     $("#keywords").val(keyWords);
     $("#search-form").submit();
  });
});
