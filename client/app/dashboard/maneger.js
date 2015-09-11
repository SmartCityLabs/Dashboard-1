function Manager($scope, $http) {

  var vizData1 = [];

  var vizData2 = [];

  var vizData3 = {};
  vizData3.cas = 0;
  vizData3.casStevec = 0;
  vizData3.cistoca = 0;
  vizData3.cistocaStevec = 0;
  vizData3.pot = 0;
  vizData3.potStevec = 0;

  var numberRunningRequests = 0;
  numberRunningRequests++;
  $http.get('https://maas-testapi.comtrade.com/api/users/me/myLocations').success(function (moje_lokacije) {
    numberRunningRequests--;

    var lokacije_managerja = moje_lokacije["locations"];
    //console.log("Lokacije managerja: ", lokacije_managerja);

    lokacije_managerja.forEach(function (lokacija) {
      var id_lokacije = lokacija["locationID"]["_id"];

      numberRunningRequests++;
      $http.get("https://maas-testapi.comtrade.com/api/locations/" + id_lokacije).success(function (lokacija_podatki) {
        numberRunningRequests--;

        var ime = lokacija_podatki["name"];
        var myObject2 = {};
        myObject2.ime_lokacije = ime;
        myObject2.id_lokacije = id_lokacije;
        myObject2.checkoutTimers = [];
        myObject2.checkinTimers = [];
        var parkirna_mesta = lokacija_podatki["parkingPlaces"];

        //console.log("Podatki o lokaciji: ", ime, " : ", lokacija_podatki);

        numberRunningRequests++;
        $http.get("https://maas-testapi.comtrade.com/api/locations/" + id_lokacije + "/cars?list=all").success(function (avto) {
          numberRunningRequests--;
          //console.log("Avtomobili na lokaciji: ", ime ," : ",avto);

          var avtomobili = avto.length;
          var smartPolnjenje = 0;
          var smartFree = 0;
          var smartReserved = 0;
          var zoePolnjenje = 0;
          var zoeFree = 0;
          var zoeReserved = 0;

          avto.forEach(function (avtoX) {
            var name = avtoX["carModelID"]["name"];
            if (parseInt(avtoX["odometer"])) {
              vizData3.pot += parseInt(avtoX["odometer"]);
              vizData3.potStevec += 1;
            }
            if (parseInt(avtoX["cleanliness"])) {
              vizData3.cistoca += parseInt(avtoX["cleanliness"]);
              vizData3.cistocaStevec += 1;
            }
            var baterija = parseInt(avtoX["batteryChargeLevel"]);
            if (baterija >= 30) {
              var status = avtoX["status"];
              if (status === "Free") {
                if (name === "Smart ED") {
                  smartFree += 1;
                } else if (name === "Zoe") {
                  zoeFree += 1;
                }
              } else if (status === "Reserved") {
                if (name === "Smart ED") {
                  smartReserved += 1;
                } else if (name === "Zoe") {
                  zoeReserved += 1;
                }
              }
            } else if (baterija < 30) {
              if (name === "Smart ED") {
                smartPolnjenje += 1;
              } else if (name === "Zoe") {
                zoePolnjenje += 1;
              }
            }
          });

          var myObject1 = {};
          myObject1.imeLokacije = ime;
          myObject1.parkirnamesta = parkirna_mesta;
          myObject1.avtomobili = avtomobili;
          myObject1.polnjenjeSmart = smartPolnjenje;
          myObject1.prostiSmart = smartFree;
          myObject1.reservedSmart = smartReserved;
          myObject1.polnjenjeZoe = zoePolnjenje;
          myObject1.prostiZoe = zoeFree;
          myObject1.reservedZoe = zoeReserved;

          numberRunningRequests++;
          $http.get("https://maas-testapi.comtrade.com/api/reservationHistories").success(function (responseReservationHistory) {
            numberRunningRequests--;

            responseReservationHistory.forEach(function (rezervacija) {
              var statusRezervacije = rezervacija["status"];
              //console.log(statusRezervacije);
              if (rezervacija["checkOutTime"] && rezervacija["checkInTime"]) {
                //console.log(rezervacija);
                //console.log(" Contract: " + rezervacija["contract"]);
                //console.log(" this ID: " + id_lokacije, rezervacija["dropOffLocationID"]["_id"], rezervacija["pickUpLocationID"]["_id"])
                //console.log(" Status rezervacije: ", ime, " : ", statusRezervacije);
                //console.log(" CheckOutTime ", rezervacija["checkOutTime"]);
                //console.log(" CheckInTime  ", rezervacija["checkInTime"]);
                var razlika_casov = razlikaCasov(rezervacija["checkOutTime"], rezervacija["checkInTime"]);
                if (razlika_casov) {
                  vizData3.cas += razlikaCasov(rezervacija["checkOutTime"], rezervacija["checkInTime"]);
                  vizData3.casStevec += 1;
                }
                if (id_lokacije === rezervacija["dropOffLocationID"]["_id"]) {
                  //console.log("DropOffLocation ID: ", id_lokacije, rezervacija["dropOffLocationID"]);
                  myObject2.checkinTimers.push(rezervacija["checkInTime"]);
                } else if (id_lokacije === rezervacija["pickUpLocationID"]["_id"]) {
                  //console.log("PickUpLocation ID: ", id_lokacije, rezervacija["pickUpLocationID"]["_id"]);
                  myObject2.checkoutTimers.push(rezervacija["checkOutTime"]);
                }

                if (vizData2.indexOf(myObject2) === -1) {
                  vizData2.push(myObject2);
                }
              }
            });
            vizData1.push(myObject1);

            if (numberRunningRequests === 0) {

              /*
              console.log("\n\nPrva vizualizacija: ", vizData1);
              console.log("Druga vizualizacija: ", vizData2);
              console.log("Tretja vizualizacija: ", vizData3);
              console.log("\n\n");
              */

              $(
                '<nav class="navbar navbar-default">' +
                '<div class="container-fluid">' +
                '<a class="navbar-brand" href="">Show location: </a>' +
                '<div class="collapse navbar-collapse" id="myNavbar">' +
                '<ul id="seznamLokacij" class="nav navbar-nav"></ul>' +
                '</div>' +
                '</div>' +
                '</nav>'
              ).appendTo("#navbar");

              var skupni_podatki1 = {
                avtomobili: 0,
                imeLokacije: "All locations",
                parkirnamesta: 0,
                polnjenjeSmart: 0,
                polnjenjeZoe: 0,
                prostiSmart: 0,
                prostiZoe: 0,
                reservedSmart: 0,
                reservedZoe: 0
              };
              var skupni_podatki2 = {
                ime_lokacije: "All locations",
                id_lokacije: "",
                checkoutTimers: [],
                checkinTimers: []
              };

              vizData1.forEach(function (tren) {
                skupni_podatki1.avtomobili += tren.avtomobili;
                skupni_podatki1.parkirnamesta += tren.parkirnamesta;
                skupni_podatki1.polnjenjeSmart += tren.polnjenjeSmart;
                skupni_podatki1.polnjenjeZoe += tren.polnjenjeZoe;
                skupni_podatki1.prostiSmart += tren.prostiSmart;
                skupni_podatki1.prostiZoe += tren.prostiZoe;
                skupni_podatki1.reservedSmart += tren.reservedSmart;
                skupni_podatki1.reservedZoe += tren.reservedZoe;
              });

              vizData2.forEach(function (tren) {
                tren.checkinTimers.forEach(function (tren) {
                  skupni_podatki2.checkinTimers.push(tren);
                });
                tren.checkoutTimers.forEach(function (tren) {
                  skupni_podatki2.checkoutTimers.push(tren);
                });
              });

              $('<div id="opis1" style="text-align: center" class="col-sm-6"> Cars status on location: </div>' +
                '<div style="align-content: center;" id="opis2" class="col-sm-6"><ul class="legend">' +
                '<li>&nbsp - Check out <span class="checkout"></span></li>' +
                '<li>&nbsp - Check in <span class="checkin"></span></li>' +
                '</ul>' +
                '</div>').appendTo("#visualisation1");


              // vstavi skupne podatke
              $('ul.nav > li').removeClass('active');
              $('<li class="active"><a onclick=prikazi(0)>' + skupni_podatki1.imeLokacije + '</a></li>').appendTo("#seznamLokacij");
              $('<div class="skrij" class="col-sm-12" id="section0"></div>').appendTo("#visualisation1");
              $('<div style="margin-top: 100px;" id="mehurcki0" class="col-sm-5"></div><div vertical-align="middle" id="stolpGraf0" class="col-sm-6"></div>').appendTo('#section0');
              Bubble("#mehurcki0", skupni_podatki1);
              StolpicniGraf("#stolpGraf0", skupni_podatki2);
              $("#section0").show();

              // vstavi podatke po postajah
              for (ii = 0; ii < vizData1.length; ii++) {
                $('<li><a onclick=prikazi(' + parseInt(ii + 1) + ')>' + vizData1[ii].imeLokacije + '</a></li>').appendTo("#seznamLokacij");
                $('<div class="skrij" class="col-sm-12" id="section' + parseInt(ii + 1) + '"></div>').appendTo("#visualisation1");
                $('<div style="margin-top: 100px;" id="mehurcki' + parseInt(ii + 1) + '" class="col-sm-5"></div><div vertical-align="middle" id="stolpGraf' + parseInt(ii + 1) + '" class="col-sm-6"></div>').appendTo('#section' + parseInt(ii + 1));
                Bubble("#mehurcki" + parseInt(ii + 1), vizData1[ii]);
                StolpicniGraf("#stolpGraf" + parseInt(ii + 1), vizData2[ii]);
              }

              // tretje vizualizacije za vse postaje
              $('<div id="dig1" class="col-sm-4" class="clock";>Average rent time: </div><div id="dig3" class="col-sm-4" class="clock">Average rent distance: </div><div id="dig2" class="col-sm-4" class="clock">Level of cleanliness: </div>').appendTo("#visualization3");
              $("#dig1").append('<canvas id="display0" width="120" height="34"></canvas>in minutes.');
              $("#dig2").append('<canvas id="display1" width="120" height="34"></canvas>out of 5.');
              $("#dig3").append('<canvas id="display2" width="120" height="34"></canvas>in kilometres. ');

              var display = new SegmentDisplay("display0");
              display.pattern = "####";
              display.cornerType = 2;
              display.displayType = 7;
              display.displayAngle = 9;
              display.digitHeight = 20;
              display.digitWidth = 12;
              display.digitDistance = 2;
              display.segmentWidth = 3;
              display.segmentDistance = 0.5;
              display.colorOn = "rgba(0, 0, 0, 0.9)";
              display.colorOff = "rgba(0, 0, 0, 0.1)";

              var display1 = new SegmentDisplay("display1");
              display1.pattern = "#.#";
              display1.cornerType = 2;
              display1.displayType = 7;
              display1.displayAngle = 9;
              display1.digitHeight = 20;
              display1.digitWidth = 12;
              display1.digitDistance = 2;
              display1.segmentWidth = 3;
              display1.segmentDistance = 0.5;
              display1.colorOn = "rgba(0, 0, 0, 0.9)";
              display1.colorOff = "rgba(0, 0, 0, 0.1)";

              var display2 = new SegmentDisplay("display2");
              display2.pattern = "####";
              display2.cornerType = 2;
              display2.displayType = 7;
              display2.displayAngle = 9;
              display2.digitHeight = 20;
              display2.digitWidth = 12;
              display2.digitDistance = 2;
              display2.segmentWidth = 3;
              display2.segmentDistance = 0.5;
              display2.colorOn = "rgba(0, 0, 0, 0.9)";
              display2.colorOff = "rgba(0, 0, 0, 0.1)";

              var prvo = JSON.stringify(Math.round(vizData3.cas / vizData3.casStevec));
              var drugo = JSON.stringify(vizData3.cistoca / vizData3.cistocaStevec);
              var tretje = JSON.stringify(Math.round(vizData3.pot / vizData3.potStevec));
              display.setValue(prvo);
              display1.setValue(drugo);
              display2.setValue(tretje);
            }
          })
        })
      })
    })
  })
}
