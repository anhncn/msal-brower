/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var NavigationClient = /** @class */ (function () {
    function NavigationClient() {
    }
    /**
     * Navigates to other pages within the same web application
     * @param url
     * @param options
     */
    NavigationClient.prototype.navigateInternal = function (url, options) {
        return NavigationClient.defaultNavigateWindow(url, options);
    };
    /**
     * Navigates to other pages outside the web application i.e. the Identity Provider
     * @param url
     * @param options
     */
    NavigationClient.prototype.navigateExternal = function (url, options) {
        return NavigationClient.defaultNavigateWindow(url, options);
    };
    /**
     * Default navigation implementation invoked by the internal and external functions
     * @param url
     * @param options
     */
    NavigationClient.defaultNavigateWindow = function (url, options) {
        if (options.noHistory) {
            window.location.replace(url);
        }
        else {
            window.location.assign(url);
        }
        return new Promise(function (resolve) {
            setTimeout(function () {
                resolve(true);
            }, options.timeout);
        });
    };
    return NavigationClient;
}());

export { NavigationClient };
//# sourceMappingURL=NavigationClient.js.map
