function Administrator($scope, $http) {

    var el=$("#main");
    el.css('margin-left','auto');

    var el2=$("#visualisation2");
    el2.css("height", "600px");

    $scope.data = {};
    var mainDiv = document.getElementById("main");
        mainDiv.setAttribute("class","container");
        mainDiv.setAttribute("width","100%");
    
    adminFirstChartRadios(); // create radio buttons for first graph

    getData();

    function getData(stat, inputData) {
        $http.get("https://maas-testapi.comtrade.com/api/locations").success(function (response) {
            $scope.data.locations = response;
            getData2(stat, inputData);
        })
    }

    function getData2(stat, inputData) {
        var vizualizacija01and02 = new Array();
        var vizualizacija03 = new Array();
        var numberRunningRequests = 0;
        numberRunningRequests++;
        $http.get("https://maas-testapi.comtrade.com/api/reservationHistories").success(function (responseReservationHistory) {
            numberRunningRequests--;

            $scope.data.ReservationHistory = responseReservationHistory;
            $scope.data.locations.forEach(function (lok) {
                var myObject = {};
                myObject.id_lokacije = lok["_id"];
                myObject.ime_lokacije = lok["name"];
                myObject.checkinTimers = new Array();
                myObject.checkoutTimers = new Array();
                vizualizacija01and02[vizualizacija01and02.length] = myObject;
            });

            var avtomobiliInCasi = [];

            for (u = 0; u < $scope.data.ReservationHistory.length; u++) {
                var rezervacija = $scope.data.ReservationHistory[u];

                if (rezervacija["status"] !== "No Show" && rezervacija["status"] !== "Cancelled") {
                    var id_pickup = rezervacija["pickUpLocationID"]["_id"];
                    var id_dropoff = rezervacija["dropOffLocationID"];
                    vizualizacija01and02.forEach(function (lokacija) {
                        if (id_dropoff === lokacija.id_lokacije) {
                            lokacija.checkoutTimers[lokacija.checkoutTimers.length] = rezervacija["checkOutTime"];
                        } else if (id_pickup === lokacija.id_lokacije) {
                            lokacija.checkinTimers[lokacija.checkinTimers.length] = rezervacija["checkInTime"];
                        }
                    });
                    var cas_rezervacije = rezervacija["created"]
                    var sposodil_avto = rezervacija["checkOutTime"];
                    var vrnil_avto = rezervacija["checkInTime"];
                    var currentDate = new Date();
                    if (razlikaCasov(currentDate, new Date(cas_rezervacije)) <= 1440) {
                        numberRunningRequests++;
                        $http.get(rezervacija["carID"]["href"]).success(function (avto) {
                            numberRunningRequests--;
                            avtomobiliInCasi.push({
                                'modelAvtomobila': avto["carModelID"]["name"],
                                'casRezervacije': razlikaCasov(cas_rezervacije, sposodil_avto),
                                'casUporabe': razlikaCasov(sposodil_avto, vrnil_avto)
                            });
                            if (numberRunningRequests === 0) {

                                var vizualizacija03 = carData(avtomobiliInCasi);
                                var dataInput = 0;
                                // var pieCHartButtons = document.getElementById("formButton2");

                                // if(pieCHartButtons == null)
                                //     createNavBar(vizualizacija01and02);

                                if(inputData != null){
                                    dataInput = inputData;
                                }
                                if(stat == 0){
                                    drawGraph(vizualizacija01and02);// create first chart
                                } else if(stat == 1){
                                    drawGraph2(vizualizacija01and02, dataInput);
                                }
                                else if(stat == null){
                                    drawGraph(vizualizacija01and02);
                                    drawGraph2(vizualizacija01and02, dataInput);
                                    Torta("#visualization3", vizualizacija03[0]);
                                }
                            }
                        })
                    }
                }
            }
        })
    }
    d3.select(".randomize")
    .on("click", function () {
        update2();
    });
    function update2(){
        update(2);
    }
    function drawGraph(inputArray){
        // fillArray() creates array for first graph and returns it
        Dashboard('#visualisation1',fillArray(inputArray));
    }
    function drawGraph2(inputTable, stat){ 
        var pieCHartButtons = document.getElementById("formButton2");
        if(pieCHartButtons == null)
            createNavBar(inputTable);
        StolpicniGraf2("#visualisation2", inputTable[stat], inputTable);
    }

/* Dodatne funckije za prvi graf */    
    function update(a, inputData){
        var tab = document.getElementById('charTab'); //remove first graph
        var pie = document.getElementById('pieChart');
        var hist = document.getElementById('histogram');

        var pieChart = document.getElementById('barChart'); // removing second graph
        var pieChartRadios = document.getElementById("vis2form");
        var pieCHartButtons = document.getElementById("formButton2");

        var form2radio = document.getElementById('vis2form'); // third graph
        var cakePie = document.getElementById('cakePieChart');

        if(a == 0){
            tab.remove();
            hist.remove();
            pie.remove();     
        } else if(a == 1){
            pieChart.remove();
            pieChartRadios.remove();
            // pieCHartButtons.remove();
        }  

        getData(a, inputData);
    }
    function carData(avtomobiliInCasi){
        var arr = [];
        var smartData = {
            model: "Smart ED",
            Reserved: 0,
            Used: 0,
            Free: 1440,
            numCars: 0
        };
        var zoeData = {
            model: "Zoe",
            Reserved: 0,
            Used: 0,
            Free: 1440,
            numCars: 0
        };
        var total = {
            model: "Skupno",
            Reserved: 0,
            Used: 0,
            Free: 1440,
            numCars: 0
        };
        for (i = 0; i < avtomobiliInCasi.length; i++) {
            if (avtomobiliInCasi[i].modelAvtomobila === "Smart ED") {
                smartData.Reserved += avtomobiliInCasi[i].casRezervacije;
                smartData.Used += avtomobiliInCasi[i].casUporabe;
                smartData.numCars += 1;
            } else if (avtomobiliInCasi[i].modelAvtomobila === "Zoe") {
                zoeData.Reserved += avtomobiliInCasi[i].casRezervacije;
                zoeData.Used += avtomobiliInCasi[i].casUporabe;
                zoeData.numCars += 1;
            }
        }
        smartData.Used = smartData.Used / smartData.numCars;
        smartData.Reserved = smartData.Reserved / smartData.numCars;

        zoeData.Used = zoeData.Used / zoeData.numCars;
        zoeData.Reserved = zoeData.Reserved / zoeData.numCars;

        smartData.Free = (smartData.Free * smartData.numCars - smartData.Used - smartData.Reserved) / 60;
        zoeData.Free = (zoeData.Free * zoeData.numCars - zoeData.Used - zoeData.Reserved) / 60;
        
        var firstCondition = (!isNaN(smartData.Used) && !isNaN(smartData.Reserved) && !isNaN(smartData.Free));
        var secondCondition = (!isNaN(zoeData.Used) && !isNaN(zoeData.Reserved) && !isNaN(zoeData.Free));
        if(firstCondition){ //first
            total.Used = (smartData.Used); 
            total.Reserved = (smartData.Reserved);
            total.Free = (smartData.Free);            
        } else if(secondCondition){ // second
            total.Used = (zoeData.Used); 
            total.Reserved = (zoeData.Reserved);
            total.Free = (zoeData.Free);
        } else if(firstCondition && secondCondition){ //first + second
            total.Used = (smartData.Used + zoeData.Used); 
            total.Reserved = (smartData.Reserved + zoeData.Reserved);
            total.Free = (smartData.Free + zoeData.Free);

        }
        arr = [total];
        return arr;
    }

    function adminFirstChartRadios(){
        // var myElem = document.getElementById("radioForm");
        var div = document.getElementById("visualisation1");
        var form = document.createElement("FORM");
            form.id = "visualisationForm";

        var radio0 = document.createElement("input");
            radio0.type = "radio";
            radio0.name = "timePeriod";
            radio0.id = "rad0";
            radio0.value = "0";
            radio0.onclick = function(){
                update(0);
            };
            radio0.defaultChecked = true;
            radio0.checked = true;

        var radio1 = document.createElement("input");
            radio1.type="radio";
            radio1.id = "rad1";
            radio1.name="timePeriod";
            radio1.value="1";
            radio1.onclick = function(){
                update(0);
            };


        var text0 = document.createTextNode("24h");
        var text1 = document.createTextNode("1week");

        var label0 = document.createElement("label");
                label0.htmlFor=radio0.id;
                label0.appendChild(radio0);
                label0.appendChild(text0);

        var label1 = document.createElement("label");
                label1.htmlFor=radio1.id;
                label1.appendChild(radio1);
                label1.appendChild(text1);  

        form.appendChild(label0);
        form.appendChild(label1);

        div.appendChild(form);

    }

    function changeLocation(stat, inputData, name){
        update(stat, inputData);
    }

    function createNavBar(inputTable){
        var arr = inputTable;

        var divContainer = document.createElement("div"); // main div
            divContainer.setAttribute("class","container-fluid");
            divContainer.setAttribute("id","formButton2");

        var divNavHeader = document.createElement("div");   //first sub div
            divNavHeader.setAttribute("class","navbar-header");
            // divNavHeader.attr("class","navbar-header");
        var buttonToggle = document.createElement("button");
            buttonToggle.setAttribute("type","button");
            buttonToggle.setAttribute("class","navbar-toggle");
            buttonToggle.setAttribute("data-toggle","collapse");
            buttonToggle.setAttribute("data-target","#myNavbar");
        var aNavbarBrand = document.createElement("a");
            aNavbarBrand.setAttribute("class","navbar-brand");
            aNavbarBrand.setAttribute("href","#");

        divNavHeader.appendChild(buttonToggle);
        divNavHeader.appendChild(aNavbarBrand);

        var div = document.createElement("div"); //second sub div
        var divCollapse = document.createElement("div");
            divCollapse.setAttribute("class","collapse navbar-collapse");
            divCollapse.setAttribute("id","myNavbar");
        var ul = document.createElement("ul");
            ul.setAttribute("class","nav navbar-nav");
        /*GENERIRANJE KRAJEV*/
        for(var i = 0; i<arr.length;i++){
            var lokacija = arr[i]["ime_lokacije"];

            var li1 = document.createElement("li");
            var a1 = document.createElement("a");
                a1.id = "0"+i;
                a1.setAttribute("href","#");
                a1.name = i;
                a1.value=lokacija;
                a1.onclick=function(){
                    changeLocation(1,this.name, this.value);
                };
            var text1 = document.createTextNode(lokacija);
            a1.appendChild(text1);
            li1.appendChild(a1);
            ul.appendChild(li1);
        }
        /*KONEC GENERIRANJA*/
        divCollapse.appendChild(ul);
        div.appendChild(divCollapse);

        divContainer.appendChild(divNavHeader);
        divContainer.appendChild(div);

        var divViz= document.getElementById("visualisation2");
        divViz.appendChild(divContainer);
    }

    function createLabel(id,location,locationName){
        // id of label
        // location - which visualisation div
        var temp = document.getElementById(id);
        if(temp != null){
            temp.remove();
        }
        var label = document.createElement("label");
        var text = document.createTextNode(locationName);
            label.id=id;
            label.appendChild(text);
        var div = document.getElementById(location);
        div.appendChild(label);
    }

}
