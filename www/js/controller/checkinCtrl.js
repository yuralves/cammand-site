angular.module("checkin") /* global angular */
  .controller("checkinCtrl", function($scope, $http) {
  	$scope.dashboardclass = "";
  	$scope.checkinclass = "active";
  	$scope.chargeclass = "";
  	$scope.balanceclass = "";
  	$scope.menuclass = "";

    var getDocumentTypes = function() {
        $http.get("/postgresql/getDocumentTypes")
        .then(function(response) {
        	$scope.documentTypes = response.data['data']
        });
    };

    $scope.documentTypes = getDocumentTypes();

    $scope.checkin = function(user) {
        $http.post("/postgresql/checkin", user)
        .then(function(response) {
          console.log(response.data);
        });
    }

  });