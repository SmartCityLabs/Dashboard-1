'use strict';

function razlikaCasov($cas1, $cas2) {
    var datum1 = new Date($cas1);
    var datum2 = new Date($cas2);
    var razlika = Math.abs(datum1 - datum2) * 1.66666667 * Math.pow(10, -5);
    return razlika;
}

function prikazi(num){
    $(".skrij").hide();
    $("#section" + num).show();
    $('ul.nav > li').click(function (e) {
        e.preventDefault();
        $('ul.nav > li').removeClass('active');
        $(this).addClass('active');
    });
}

angular.module('editApp')

    .controller('DashboardCtrl', function ($scope, $http, Auth) {

        $http.get('https://maas-testapi.comtrade.com/api/users/me').success(function (data) {

            var obj = $.parseJSON(JSON.stringify(data));

            var user_type = obj["role"];

            if (user_type == "admin") {
                Administrator($scope, $http);
                console.log("Administrator");
            }
            if (user_type == "locationManager") {
                Manager($scope, $http);
                console.log("locationManager");
            }

        });



    });