angular.module("balance") /* global angular */
  .controller("balanceCtrl", function($scope, $http) {
  	$scope.dashboardclass = "";
  	$scope.checkinclass = "";
  	$scope.chargeclass = "";
  	$scope.balanceclass = "active";
  	$scope.menuclass = "";

  	$scope.amount = 0;

    $scope.getBalance = function(amounts) {
    	console.log(amounts);
        $http.post("/postgresql/getBalance", amounts)
        .then(function(response) {
        	$scope.amount = response.data['data']['balance'];
        	$scope.phone = response.data['data']['phone_number'];
          	console.log(response.data['data']['balance']);
        });
    }
  });