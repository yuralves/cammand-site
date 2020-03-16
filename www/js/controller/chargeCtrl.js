angular.module("charge") /* global angular */
  .controller("chargeCtrl", function($scope, $http) {
  	$scope.dashboardclass = "";
  	$scope.checkinclass = "";
  	$scope.chargeclass = "active";
  	$scope.balanceclass = "";
  	$scope.menuclass = "";

    $scope.charge = function(user) {
        $http.post("/postgresql/charge", user)
        .then(function(response) {
          console.log(response.data);
        });
    }

  });