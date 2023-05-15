/*  
    Developed By: ajash
    Developed on: 26/09/2019
*/
var MapChartIndia = { Drowchart: null, MapChartLegendHTML: "MapChartLegendHTML = 'your HTML here'" };
var mapColorCodes = ["Kerala|#F6D892"];
MapChartIndia.Drawchart = function drawIndia(container) {
    // var width = window.innerWidth, height = window.innerHeight;
    var width = document.getElementById(container).offsetWidth, height = document.getElementById(container).offsetHeight;
    var projection = d3.geoMercator();

    var path = d3.geoPath()
        .projection(projection)
        .pointRadius(2);

    var svg = d3.select("#" + container).append("svg")
        .attr("width", width)
        .attr("height", height);

    var g = svg.append("g");

    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    d3.json("../../../../scripts/Plugin/IndiaMaps/IndianStatePoints.json", function (error, data) {

        var boundary = centerZoom(data);
        drawOuterBoundary(data, boundary);
        var subunits = drawSubUnits(data);
        colorSubunits(subunits);
        // drawSubUnitLabels(data);
        //drawPlaces(data);
        //appentLegend(d3.select("#" + container), width, height);
        //document.getElementById("MapChartLegend").innerHTML = MapChartIndia.MapChartLegendHTML;

    });

    function centerZoom(data) {

        var o = topojson.mesh(data, data.objects.polygons, function (a, b) { return a === b; });

        projection
            .scale(1)
            .translate([0, 0]);

        var b = path.bounds(o),
            s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        var p = projection
            .scale(s)
            .translate(t);

        return o;

    }

    function drawOuterBoundary(data, boundary) {

        g.append("path")
            .datum(boundary)
            .attr("d", path)
            .attr("class", "subunit-boundary")
            .attr("fill", "none")
            .attr("stroke", "black");//"#3a403d"); //India outer line

    }

    function drawPlaces(data) {

        g.append("path")
            .datum(topojson.feature(data, data.objects.places))
            .attr("d", path)
            .attr("class", "place");

        g.selectAll(".place-label")
            .data(topojson.feature(data, data.objects.places).features)
          .enter().append("text")
            .attr("class", "place-label")
            .attr("transform", function (d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("font-size", ".8em")
            //.style("display", "none")
            .style("cursor", "pointer")
            .style("text-shadow", "0px 0px 2px #fff")
        .on('click', function (d, i) {
            d3.select("#MapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
            d3.select("#ZoomedMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
            d3.selectAll("text").style("fill", "black").style("font-size", ".8em");
            d3.select(this).style("fill", "red").style("font-size", "1em");
            // return alert(d.properties.ID);
        });

    }

    function drawSubUnits(data) {

        var subunits = g.selectAll(".subunit")
            .data(topojson.feature(data, data.objects.polygons).features)
          .enter().append("path")
            .attr("class", "subunit")
            .attr("id", (function (d) { return d.properties.st_ID; }))//
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1px")
            .style("cursor", "pointer")
            .style("cursor", "pointer!important;")
            .on('click', function (d, i) {
                var temp_list = [];

                mapColorCodes.forEach(function (d) {
                    temp_list.push(d.split('|')[0])
                })

                if (temp_list.indexOf(d["properties"].st_nm) == -1)
                    return null;
                else {
                    d3.select("#MapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.35).style("stroke", "white");//.attr("fill", "white");
                    d3.select("#ZoomedMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.35).style("stroke", "white");//.attr("fill", "white");

                    if (sessionStorage.id == d.properties.st_ID) {
                        sessionStorage.id = 0;
                        d3.select("#MapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
                        d3.select("#ZoomedMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
                        currentStateID = 0;
                        selectState('India');
                    }
                    else {
                        sessionStorage.id = d.properties.st_ID;
                        //d3.select(this).transition().duration(300).style("opacity", 1).style("stroke", "black");
                        $('#MapContainer #' + $(this).attr('id')).css("opacity", 1).css("stroke", "black")
                        $('#ZoomedMapContainer #' + $(this).attr('id')).css("opacity", 1).css("stroke", "black")
                        currentStateID = d.properties.st_ID;
                        selectState(d.properties.st_nm, d.properties.st_ID);
                    }
                }

            })
            .on('mouseover', function (d, i) {
                div.transition()
                .duration(200)
                .style("opacity", .9);
                div.html(d.properties.st_nm)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                //alert(d.properties.st_nm);
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        return subunits;

    }

    function drawSubUnitLabels(data) {

        g.selectAll(".subunit-label")
            .data(topojson.feature(data, data.objects.polygons).features)
          .enter().append("text")
            .attr("class", "subunit-label")
            .attr("transform", function (d) { return "translate(" + path.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-size", ".5em")
            .style("text-shadow", "0px 0px 2px #fff")
            .style("text-transform", "uppercase")
            .text(function (d) { return d.properties.st_nm; });

    }

    function colorSubunits(subunits) {

        subunits
            .style("fill", "#FFFFFF")
            .style("fill", function (d, i) {
                for (var j = 0; j < mapColorCodes.length; j++) {
                    if (mapColorCodes[j].split('|')[0] == d["properties"].st_nm) {
                        return mapColorCodes[j].split('|')[1];
                    }
                }
                return "grey"
            })
            .style("opacity", "1")
    }
}

function appentLegend(container, width, height) {
    container.append("div")
    .attr("class", "MapChartLegend")
    .attr("id", "MapChartLegend")
    .style("width", (43 * width) / 100 + "px")
    .style("height", (40 * height) / 100 + "px")
    .style("font-size", "0.8em");

}