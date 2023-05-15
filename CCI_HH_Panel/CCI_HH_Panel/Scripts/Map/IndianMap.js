
var MapStates = { Drowchart: null, MapChartLegendHTML: "MapChartLegendHTML = 'your HTML here'" };
MapStates.Drawchart = function drawIndia(container) {
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

    d3.json("../../Scripts/Map/IndianStatePoints.json", function (error, data) {

        var boundary = centerZoom(data);
        drawOuterBoundary(data, boundary);
        var subunits = drawSubUnits(data);
        colorSubunits(subunits);

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
                    d3.select("#mapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.35).style("stroke", "white");//.attr("fill", "white");
                    d3.select("#zoomMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.35).style("stroke", "white");//.attr("fill", "white");

                    if ((sessionStorage.stateid == d.properties.st_ID) || ((sessionStorage.stateid == '8' && d.properties.st_ID == '23') || (sessionStorage.stateid == '23' && d.properties.st_ID == '8'))) {
                        sessionStorage.stateid = 0;
                        d3.select("#mapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
                        d3.select("#zoomMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 1).style("stroke", "white");
                        currentMapType = '450';
                        demographicFilterId = '1948';
                        $('.demographic-container').show();
                        //plotMap('0');
                    }
                    else {
                        sessionStorage.stateid = d.properties.st_ID;
                        if (d.properties.st_ID == '8' || d.properties.st_ID == '23') {
                            $('#mapContainer #8').css("opacity", 1).css("stroke", "black")
                            $('#zoomMapContainer #8').css("opacity", 1).css("stroke", "black")
                            $('#mapContainer #23').css("opacity", 1).css("stroke", "black")
                            $('#zoomMapContainer #23').css("opacity", 1).css("stroke", "black")
                        }
                        else {
                            $('#mapContainer #' + $(this).attr('id')).css("opacity", 1).css("stroke", "black")
                            $('#zoomMapContainer #' + $(this).attr('id')).css("opacity", 1).css("stroke", "black")
                        }

                        statesMapData.forEach(function (value, index) {
                            if (value.MeasureName == d.properties.st_nm)
                                currentMapType = value.MeasureCode;
                        })

                        demographicFilterId = '';
                        $('.demographic-container').hide();
                    }
                    widgetType = 'Map';
                    selectedWidgetId = '2886';
                    currentView = checkDefaultView();
                    getDashboardData('state-selection');
                    plotDirections();
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

var MapCities = { Drowchart: null, MapChartLegendHTML: "MapChartLegendHTML = 'your HTML here'" };
MapCities.Drawchart = function drawIndia(container) {
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

    d3.json("../../Scripts/Map/IndianStatePoints.json", function (error, data) {

        var boundary = centerZoom(data);
        drawOuterBoundary(data, boundary);
        var subunits = drawSubUnits(data);
        colorSubunits(subunits);
        drawPlaces(data);
        $('.map-image').click(function () {
            $(this).attr('width', '27')
            $(this).attr('height', '27')
            .attr('href', "../Content/Images/KH_Sprite_black dot.svg")
        })

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
            .attr("stroke", "grey")//"#3a403d"); //India outer line
    }

    function drawPlaces(data) {
        g.selectAll('.place-label')
            .data(topojson.feature(data, data.objects.places).features)
            .enter()
            .append('image')
            .attr("class", "map-image")
            .attr('id', function (d) {
                flag = '';
                mapData.forEach(function (value) {
                    if (value.MeasureName == d.properties.name) {
                        flag = d.properties.ID;
                        return;
                    }
                })
                return flag;
            })
            .attr('xlink:href', "../Content/Images/KH_Sprite_gery dot.svg")
            .attr("transform", function (d) {
                flag = false;
                mapData.forEach(function (value) {
                    if (value.MeasureName == d.properties.name) {
                        flag = true;
                        return;
                    }
                })
                return flag ? "translate(" + projection(d.geometry.coordinates) + ")" : "";
            })
            .attr('width', '25').attr('height', '25').attr('x', '-13').attr('y', '-11')


        g.selectAll(".place-label")
            .data(topojson.feature(data, data.objects.places).features)
            .enter().append("text")
            .attr("class", "place-label")
            .attr("transform", function (d) {
                coordinates = projection(d.geometry.coordinates);
                
                //hardcoding position for some cities
                if (d.properties.name == 'Bangalore') {
                    coordinates[0] -= 25;
                    coordinates[1] += 10;
                }
                else if (d.properties.name == 'Mumbai') {
                    coordinates[0] -= 45;
                }
                else if (d.properties.name == 'Bihar excl Jharkhand') {
                    coordinates[0] -= 55;
                    coordinates[1] += 10;
                }
                else {
                    coordinates[0] += 4;
                }
                return "translate(" + coordinates + ")";
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "start")
            .style("font-size", '0.7em')
            //.style("display", "none")
            .style("cursor", "pointer")
            .style("fill", function (d, i) {
                for (var j = 0; j < mapColorCodes.length; j++) {
                    if (mapColorCodes[j].split('|')[0] == d["properties"].name) {
                        return mapColorCodes[j].split('|')[1];
                    }
                }
                return ""
            })
            .style("text-shadow", "0px 0px 2px #fff")

            .text(function (d) {
                flag = '';
                mapData.forEach(function (value) {
                    if (value.MeasureName == d.properties.name) {
                        flag = value.MeasureName;
                        return;
                    }
                })
                return flag;
            })
            .attr('id', function (d) {
                flag = '';
                mapData.forEach(function (value) {
                    if (value.MeasureName == d.properties.name) {
                        flag = d.properties.ID;
                        return;
                    }
                })
                return flag;
            })
            .attr('name', function (d) {
                flag = '';
                mapData.forEach(function (value) {
                    if (value.MeasureName == d.properties.name) {
                        flag = d.properties.ID;
                        return;
                    }
                })
                return flag;
            })
            .on('click', function (d, i) {
                d3.select("#mapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.6).style("stroke", "white");
                d3.select("#zoomMapContainer").selectAll("path").filter(function () { try { return !this.classList.contains('subunit-boundary') } catch (ex) { return this } }).style("opacity", 0.6).style("stroke", "white");
                d3.selectAll(".place-label").style('font-family', 'Montserrat')
                d3.selectAll('.map-image').attr('width', '25').attr('height', '25')
                .attr('xlink:href', "../Content/Images/KH_Sprite_gery dot.svg")

                if (sessionStorage.cityid == d.properties.ID) {
                    sessionStorage.cityid = 0;
                    currentMapType = '450';
                    demographicFilterId = '1948';
                    $('.demographic-container').show();
                    plotMap('1');
                }
                else {
                    sessionStorage.cityid = d.properties.ID;
                    $('#mapContainer #' + $(this).attr('id')).css('font-family', 'Montserrat-Bold');
                    $('#zoomMapContainer #' + $(this).attr('id')).css('font-family', 'Montserrat-Bold');
                    //d3.select(this).style('font-family', 'Montserrat-Bold')
                    $('#' + $(this).attr('id')).click() //For growing the width and height of the image

                    citiesMapData.forEach(function (value, index) {
                        if (value.MeasureName == d.properties.name)
                            currentMapType = value.MeasureCode;
                    })
                    demographicFilterId = '';
                    $('.demographic-container').hide();
                }
                widgetType = 'Map';
                selectedWidgetId = '2886';
                currentView = checkDefaultView();
                getDashboardData('city-selection');
                plotDirections();
        })

    }

    function drawSubUnits(data) {

        var subunits = g.selectAll(".subunit")
            .data(topojson.feature(data, data.objects.polygons).features)
          .enter().append("path")
            .attr("class", "subunit")
            .attr("id", (function (d) { return d.properties.st_ID; }))
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1px")

        return subunits;

    }

    function colorSubunits(subunits) {
        subunits
            .style("fill", "white")
            .style("opacity", "0.6");
    }
}