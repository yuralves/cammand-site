angular.module("menu") /* global angular */
  .controller("menuCtrl", function($scope, $http) {
  	$scope.dashboardclass = "";
  	$scope.checkinclass = "";
  	$scope.chargeclass = "";
  	$scope.balanceclass = "";
  	$scope.menuclass = "active";

    var getItems = function() {
        $http.get("/postgresql/getItems")
        .then(function(response) {
        	$scope.items = response.data['data'];
        	console.log(response.data['data']);
        });
    };

    $scope.items = getItems();

    $scope.createProduct = function(product) {
        $http.post("/postgresql/createItem", product)
        .then(function(response) {
          console.log(response.data);
          $scope.items = getItems();
        });
    }

  });