/*-----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                               */
/*          Date: 23-12-2018                                                                           */
/*          Discription: This is cetralized Ajax service to be used by across application.             */
/*-----------------------------------------------------------------------------------------------------*/

define(['app'], function (app) {

    //------------ Common Ajax Service ------------//
    app.register.service('AjaxService', ['$http', function ($http) {
        var data = [];
        var LoginUrl;
        var LogoutUrl;
        var ShowAlert = true;
        let layoutScope = {};

        this.initialize = function (layoutValue) {
            layoutScope = layoutValue;
        }

        var CheckResponse = function (response) {
            if (response.status == 401 && ShowAlert) {
                layoutScope.setLoader(false);
                var logout = function () { window.location = '../Home/logout'; }
                layoutScope.customAlert("Session Timeout", "ALERT", logout, logout, "OK");
                setTimeout(function () { logout(); }, 10000);
            }
        }

        let AjaxTrackAPI = function (route, status, ApiTime, module, data) {
            setTimeout(function () { 
            let value = "TimeTaken:" + ApiTime + ";status:" + status;
            let routesplit = route.split('/');
            $http.post(apiUrl + "/Common/TrackAPIResp", { 'value': value, 'moduleName': module + " " + routesplit[routesplit.length - 1] }).then(function successCallback() { }, function errorCallback(response) { });
            }, 10000);
        }

        this.AjaxTrackModule = function (module) {
            setTimeout(function () { 
            $http.post(apiUrl + "/Common/TrackModule", { 'moduleName': module }).then(function successCallback() { },
                function errorCallback(response) {
                    CheckResponse(response);
                });
            }, 10000);
        }

        this.AjaxGet = function (route, successFunction, errorFunction, module) {
            let sentTime = (new Date()).getTime();
            return $http({
                    method: 'GET',url: route
                }).then(function successCallback(response, status, headers, config) {
                    successFunction(response, response.status);
                    AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module);
                }, function errorCallback(response) {
                    errorFunction(response);
                    CheckResponse(response);
                    AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module);
                });
        }

        this.AjaxGetWithData = function (data, route, successFunction, errorFunction, module) {
            let sentTime = (new Date()).getTime();
            return $http({
                method: 'GET', url: route, params: data
            }).then(function successCallback(response, status, headers, config) {
                successFunction(response, response.status);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module, data);
            }, function errorCallback(response) {
                CheckResponse(response);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module, data);
            });
        }

        this.AjaxPost = function (data, route, successFunction, errorFunction, module) {
            let sentTime = (new Date()).getTime();
            return $http.post(route, data).then(function successCallback(response, status, headers, config) {
                successFunction(response, response.status);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module, data);
            }, function errorCallback(response) {
                errorFunction(response);
                CheckResponse(response);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module, data);
            });
        }

        this.AjaxFileUpload = function (data, route, successFunction, errorFunction, module) {
            let sentTime = (new Date()).getTime();
            $http.post(route, data, {
                transformRequest: angular.identity,
                headers: { "Content-Type": undefined }
            }).then(function successCallback(response, status, headers, config) {
                successFunction(response, response.status);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module);
            }, function errorCallback(response) {
                errorFunction(response);
                CheckResponse(response);
                AjaxTrackAPI(route, response.status, (new Date()).getTime() - sentTime, module);
            });
        }
    }]);
});