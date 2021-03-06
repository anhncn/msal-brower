/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { __awaiter, __generator } from '../_virtual/_tslib.js';
import { BrowserAuthError } from '../error/BrowserAuthError.js';
import { HTTP_REQUEST_TYPE } from '../utils/BrowserConstants.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * This client implements the XMLHttpRequest class to send GET and POST requests.
 */
var XhrClient = /** @class */ (function () {
    function XhrClient() {
    }
    /**
     * XhrClient for REST endpoints - Get request
     * @param url
     * @param headers
     * @param body
     */
    XhrClient.prototype.sendGetRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAsync(url, HTTP_REQUEST_TYPE.GET, options)];
            });
        });
    };
    /**
     * XhrClient for REST endpoints - Post request
     * @param url
     * @param headers
     * @param body
     */
    XhrClient.prototype.sendPostRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAsync(url, HTTP_REQUEST_TYPE.POST, options)];
            });
        });
    };
    /**
     * Helper for XhrClient requests.
     * @param url
     * @param method
     * @param options
     */
    XhrClient.prototype.sendRequestAsync = function (url, method, options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, /* async: */ true);
            _this.setXhrHeaders(xhr, options);
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) {
                    if (method === HTTP_REQUEST_TYPE.POST) {
                        reject(BrowserAuthError.createPostRequestFailedError("Failed with status " + xhr.status, url));
                    }
                    else {
                        reject(BrowserAuthError.createGetRequestFailedError("Failed with status " + xhr.status, url));
                    }
                }
                try {
                    var jsonResponse = JSON.parse(xhr.responseText);
                    var networkResponse = {
                        headers: _this.getHeaderDict(xhr),
                        body: jsonResponse,
                        status: xhr.status
                    };
                    resolve(networkResponse);
                }
                catch (e) {
                    reject(BrowserAuthError.createFailedToParseNetworkResponseError(url));
                }
            };
            xhr.onerror = function () {
                if (window.navigator.onLine) {
                    if (method === HTTP_REQUEST_TYPE.POST) {
                        reject(BrowserAuthError.createPostRequestFailedError("Failed with status " + xhr.status, url));
                    }
                    else {
                        reject(BrowserAuthError.createGetRequestFailedError("Failed with status " + xhr.status, url));
                    }
                }
                else {
                    reject(BrowserAuthError.createNoNetworkConnectivityError());
                }
            };
            if (method === HTTP_REQUEST_TYPE.POST && options && options.body) {
                xhr.send(options.body);
            }
            else if (method === HTTP_REQUEST_TYPE.GET) {
                xhr.send();
            }
            else {
                throw BrowserAuthError.createHttpMethodNotImplementedError(method);
            }
        });
    };
    /**
     * Helper to set XHR headers for request.
     * @param xhr
     * @param options
     */
    XhrClient.prototype.setXhrHeaders = function (xhr, options) {
        if (options && options.headers) {
            var headers_1 = options.headers;
            Object.keys(headers_1).forEach(function (key) {
                xhr.setRequestHeader(key, headers_1[key]);
            });
        }
    };
    /**
     * Gets a string map of the headers received in the response.
     *
     * Algorithm comes from https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/getAllResponseHeaders
     * @param xhr
     */
    XhrClient.prototype.getHeaderDict = function (xhr) {
        var headerString = xhr.getAllResponseHeaders();
        var headerArr = headerString.trim().split(/[\r\n]+/);
        var headerDict = {};
        headerArr.forEach(function (value) {
            var parts = value.split(": ");
            var headerName = parts.shift();
            var headerVal = parts.join(": ");
            if (headerName && headerVal) {
                headerDict[headerName] = headerVal;
            }
        });
        return headerDict;
    };
    return XhrClient;
}());

export { XhrClient };
//# sourceMappingURL=XhrClient.js.map
