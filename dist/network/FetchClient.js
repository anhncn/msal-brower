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
 * This class implements the Fetch API for GET and POST requests. See more here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 */
var FetchClient = /** @class */ (function () {
    function FetchClient() {
    }
    /**
     * Fetch Client for REST endpoints - Get request
     * @param url
     * @param headers
     * @param body
     */
    FetchClient.prototype.sendGetRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var response, e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fetch(url, {
                                method: HTTP_REQUEST_TYPE.GET,
                                headers: this.getFetchHeaders(options)
                            })];
                    case 1:
                        response = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _b.sent();
                        if (window.navigator.onLine) {
                            throw BrowserAuthError.createGetRequestFailedError(e_1, url);
                        }
                        else {
                            throw BrowserAuthError.createNoNetworkConnectivityError();
                        }
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        _a = {
                            headers: this.getHeaderDict(response.headers)
                        };
                        return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, (_a.body = (_b.sent()),
                            _a.status = response.status,
                            _a)];
                    case 5:
                        _b.sent();
                        throw BrowserAuthError.createFailedToParseNetworkResponseError(url);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetch Client for REST endpoints - Post request
     * @param url
     * @param headers
     * @param body
     */
    FetchClient.prototype.sendPostRequestAsync = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var reqBody, response, e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        reqBody = (options && options.body) || "";
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url, {
                                method: HTTP_REQUEST_TYPE.POST,
                                headers: this.getFetchHeaders(options),
                                body: reqBody
                            })];
                    case 2:
                        response = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _b.sent();
                        if (window.navigator.onLine) {
                            throw BrowserAuthError.createPostRequestFailedError(e_3, url);
                        }
                        else {
                            throw BrowserAuthError.createNoNetworkConnectivityError();
                        }
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        _a = {
                            headers: this.getHeaderDict(response.headers)
                        };
                        return [4 /*yield*/, response.json()];
                    case 5: return [2 /*return*/, (_a.body = (_b.sent()),
                            _a.status = response.status,
                            _a)];
                    case 6:
                        _b.sent();
                        throw BrowserAuthError.createFailedToParseNetworkResponseError(url);
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Fetch API Headers object from string map
     * @param inputHeaders
     */
    FetchClient.prototype.getFetchHeaders = function (options) {
        var headers = new Headers();
        if (!(options && options.headers)) {
            return headers;
        }
        var optionsHeaders = options.headers;
        Object.keys(optionsHeaders).forEach(function (key) {
            headers.append(key, optionsHeaders[key]);
        });
        return headers;
    };
    FetchClient.prototype.getHeaderDict = function (headers) {
        var headerDict = {};
        headers.forEach(function (value, key) {
            headerDict[key] = value;
        });
        return headerDict;
    };
    return FetchClient;
}());

export { FetchClient };
//# sourceMappingURL=FetchClient.js.map
