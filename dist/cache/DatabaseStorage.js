/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { __awaiter, __generator } from '../_virtual/_tslib.js';
import { BrowserAuthError } from '../error/BrowserAuthError.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Storage wrapper for IndexedDB storage in browsers: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage(dbName, tableName, version) {
        this.dbName = dbName;
        this.tableName = tableName;
        this.version = version;
        this.dbOpen = false;
    }
    /**
     * Opens IndexedDB instance.
     */
    DatabaseStorage.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // TODO: Add timeouts?
                        var openDB = window.indexedDB.open(_this.dbName, _this.version);
                        openDB.addEventListener("upgradeneeded", function (e) {
                            var event = e;
                            event.target.result.createObjectStore(_this.tableName);
                        });
                        openDB.addEventListener("success", function (e) {
                            var event = e;
                            _this.db = event.target.result;
                            _this.dbOpen = true;
                            resolve();
                        });
                        openDB.addEventListener("error", function (error) { return reject(error); });
                    })];
            });
        });
    };
    /**
     * Retrieves item from IndexedDB instance.
     * @param key
     */
    DatabaseStorage.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.dbOpen) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.open()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            // TODO: Add timeouts?
                            if (!_this.db) {
                                return reject(BrowserAuthError.createDatabaseNotOpenError());
                            }
                            var transaction = _this.db.transaction([_this.tableName], "readonly");
                            var objectStore = transaction.objectStore(_this.tableName);
                            var dbGet = objectStore.get(key);
                            dbGet.addEventListener("success", function (e) {
                                var event = e;
                                resolve(event.target.result);
                            });
                            dbGet.addEventListener("error", function (e) { return reject(e); });
                        })];
                }
            });
        });
    };
    /**
     * Adds item to IndexedDB under given key
     * @param key
     * @param payload
     */
    DatabaseStorage.prototype.put = function (key, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.dbOpen) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.open()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                            // TODO: Add timeouts?
                            if (!_this.db) {
                                return reject(BrowserAuthError.createDatabaseNotOpenError());
                            }
                            var transaction = _this.db.transaction([_this.tableName], "readwrite");
                            var objectStore = transaction.objectStore(_this.tableName);
                            var dbPut = objectStore.put(payload, key);
                            dbPut.addEventListener("success", function (e) {
                                var event = e;
                                resolve(event.target.result);
                            });
                            dbPut.addEventListener("error", function (e) { return reject(e); });
                        })];
                }
            });
        });
    };
    return DatabaseStorage;
}());

export { DatabaseStorage };
//# sourceMappingURL=DatabaseStorage.js.map
