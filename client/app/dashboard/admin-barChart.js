
function StolpicniGraf2(pos, data, originalData) {

    createTypeRadios(originalData);

    var n = 2,
        m = 48,
        stack = d3.layout.stack(),
        layers = podatkiVgraf(data);

    yGroupMax = d3.max(layers, function (layer) {
        return d3.max(layer, function (d) {
            return d.y;
        });
    }),
        yStackMax = d3.max(layers, function (layer) {
            return d3.max(layer, function (d) {
                return d.y0 + d.y;
            });
        });

    //console.log(layers);

    var margin = {top: 40, right: 10, bottom: 25, left: 25},
        width = 980 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var xLabels = [];
    var sedaj = new Date();
    for (i = 1; i <= 48; i++) {
        if (i % 2 === 0) {
            xLabels[xLabels.length] = new Date(sedaj - i * 1800000).toTimeString().split(" ")[0].substring(0, 5);
        } else {
            xLabels[xLabels.length] = "";
        }
    }

    var x = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangeRoundBands([0, width], .3);

    var y = d3.scale.linear()
        .domain([0, yStackMax])
        .range([height, 0]);

    var color = d3.scale.linear()   // nastavitve barve
        .domain([0, n - 1])
        .range(["#82AFC5", "#C45454"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function (d) {
            return xLabels[d];
        })
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .tickPadding(6)
        .orient("left");

    var svg = d3.select(pos).append("svg")
        .attr("id","barChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var layer = svg.selectAll(".layer")
        .data(layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function (d, i) {
            return color(i);
        });

    var rect = layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.x); // tole vrne x os
        })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);

    rect.transition()
        .delay(function (d, i) {
            return i * 10;
        })
        .attr("y", function (d) {
            return y(d.y0 + d.y);
        })
        .attr("height", function (d) {
            return y(d.y0) - y(d.y0 + d.y);
        });


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis);

    d3.selectAll("input").on("change", change);

    var timeout = setTimeout(function () {
        d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
    }, 3000);

    function change() {
        clearTimeout(timeout);
        if (getRadValue() === "grouped") transitionGrouped();
        else transitionStacked();
    }

    function transitionGrouped() {
        y.domain([0, yGroupMax]);

        d3.select(".yaxis").remove();

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        rect.transition()
            .duration(500)
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("x", function (d, i, j) {
                return x(d.x) + x.rangeBand() / n * j;
            })
            .attr("width", x.rangeBand() / n)
            .transition()
            .attr("y", function (d) {
                return y(d.y);
            })
            .attr("height", function (d) {
                return height - y(d.y);
            });
    }

    function transitionStacked() {
        y.domain([0, yStackMax]);

        d3.select(".yaxis").remove();

        svg.append("g")
            .attr("class", "yaxis")
            .call(yAxis);

        rect.transition()
            .duration(500)
            .delay(function (d, i) {
                return i * 10;
            })
            .attr("y", function (d) {
                return y(d.y0 + d.y);
            })
            .attr("height", function (d) {
                return y(d.y0) - y(d.y0 + d.y);
            })
            .transition()
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("width", x.rangeBand());
    }

    function razlikaCasov($cas1, $cas2) {
        var datum1 = new Date($cas1);
        var datum2 = new Date($cas2);
        var razlika = Math.abs(datum1 - datum2) * 1.66666667 * Math.pow(10, -5);
        return razlika;
    }

    function urediCas(casi) {
        var vrni = new Array();
        var currentDate = new Date();
        for (var i = 0; i < casi.length; i++) {
            var preteklicCas = razlikaCasov(currentDate, casi[i]);
            if (preteklicCas <= 1440) {
                vrni[vrni.length] = [preteklicCas, casi[i]];
            }
            //} else {
            //    vrni[vrni.length] = [preteklicCas, casi[i]];
            //}
        }
        return vrni;
    }

    function podatkiVgraf(data) {
        var checkOut24 = urediCas(data.checkoutTimers);
        var checkIn24 = urediCas(data.checkinTimers);
        var checkOutDict = [];
        var checkInDict = [];
        for (j = 0; j < 48; j++) {
            checkOutDict[checkOutDict.length] = {x: j, y: 0, y0: 0};
            checkInDict[checkInDict.length] = {x: j, y: 0, y0: 0};
        }
        for (i = 0; i < checkOut24.length; i++) {
            var xos = Math.round((parseInt(checkOut24[i][0]) / 30));
            for (j = 0; j < checkOutDict.length; j++) {
                if (checkOutDict[j].x === xos) {
                    checkOutDict[j].y += 1;
                    checkInDict[j].y0 += 1;
                }
            }
        }
        for (i = 0; i < checkIn24.length; i++) {
            var xos = Math.round((parseInt(checkIn24[i][0]) / 30));
            for (j = 0; j < checkInDict.length; j++) {
                if (checkInDict[j].x === xos) {
                    checkInDict[j].y += 1;
                }
            }
        }
        return [checkOutDict, checkInDict];
    }
    function createTypeRadios(inputTable){ // create radios and button
        var div = document.getElementById("visualisation2");
        var form2 = document.createElement("FORM");
            form2.id = "vis2form";

        var radio2 = document.createElement("input"); // grouped
            radio2.type="radio";
            radio2.name="mode";
            radio2.id="rad2";
            radio2.value="grouped";
            radio2.onclick = function(){
                change();
            }
            
        
        var radio3 = document.createElement("input"); // stacked
            radio3.type="radio";
            radio3.name="mode";
            radio3.id="rad3";
            radio3.value="stacked";
            radio3.onclick = function(){
                change();
            }
            radio3.defaultChecked = true;
            radio3.checked = true;
        var textNodeGrouped = document.createTextNode("Grouped");
        var textNodeSelected = document.createTextNode("Selected");

        var label2 = document.createElement("label"); // labela za grouped
            label2.htmlFor = radio2.id;
            label2.appendChild(radio2);
            label2.appendChild(textNodeGrouped);

        var label3 = document.createElement("label"); // labela za stacked
            label3.htmlFor = radio3.id;
            label3.appendChild(radio3);
            label3.appendChild(textNodeSelected);

        form2.appendChild(label2);
        form2.appendChild(label3);
        div.appendChild(form2);

        // createButtons(inputTable);
    }
    
    function getRadValue(){
        var value = "";
        var radios = document.getElementsByName("mode");
        if(radios != null){
            for(var i = 0; i<radios.length;i++){
                if(radios[i].checked){
                    value=radios[i].value;
                }
            }
        }
        return value; 
    }

}
