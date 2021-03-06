/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { __awaiter, __generator } from '../_virtual/_tslib.js';
import { BrowserStringUtils } from '../utils/BrowserStringUtils.js';
import { BrowserAuthError } from '../error/BrowserAuthError.js';
import { KEY_FORMAT_JWK } from '../utils/BrowserConstants.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * See here for more info on RsaHashedKeyGenParams: https://developer.mozilla.org/en-US/docs/Web/API/RsaHashedKeyGenParams
 */
// RSA KeyGen Algorithm
var PKCS1_V15_KEYGEN_ALG = "RSASSA-PKCS1-v1_5";
// SHA-256 hashing algorithm
var S256_HASH_ALG = "SHA-256";
// MOD length for PoP tokens
var MODULUS_LENGTH = 2048;
// Public Exponent
var PUBLIC_EXPONENT = new Uint8Array([0x01, 0x00, 0x01]);
/**
 * This class implements functions used by the browser library to perform cryptography operations such as
 * hashing and encoding. It also has helper functions to validate the availability of specific APIs.
 */
var BrowserCrypto = /** @class */ (function () {
    function BrowserCrypto() {
        if (!(this.hasCryptoAPI())) {
            throw BrowserAuthError.createCryptoNotAvailableError("Browser crypto or msCrypto object not available.");
        }
        this._keygenAlgorithmOptions = {
            name: PKCS1_V15_KEYGEN_ALG,
            hash: S256_HASH_ALG,
            modulusLength: MODULUS_LENGTH,
            publicExponent: PUBLIC_EXPONENT
        };
    }
    /**
     * Returns a sha-256 hash of the given dataString as an ArrayBuffer.
     * @param dataString
     */
    BrowserCrypto.prototype.sha256Digest = function (dataString) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = BrowserStringUtils.stringToUtf8Arr(dataString);
                return [2 /*return*/, this.hasIECrypto() ? this.getMSCryptoDigest(S256_HASH_ALG, data) : this.getSubtleCryptoDigest(S256_HASH_ALG, data)];
            });
        });
    };
    /**
     * Populates buffer with cryptographically random values.
     * @param dataBuffer
     */
    BrowserCrypto.prototype.getRandomValues = function (dataBuffer) {
        var cryptoObj = window["msCrypto"] || window.crypto;
        if (!cryptoObj.getRandomValues) {
            throw BrowserAuthError.createCryptoNotAvailableError("getRandomValues does not exist.");
        }
        cryptoObj.getRandomValues(dataBuffer);
    };
    /**
     * Generates a keypair based on current keygen algorithm config.
     * @param extractable
     * @param usages
     */
    BrowserCrypto.prototype.generateKeyPair = function (extractable, usages) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (this.hasIECrypto() ?
                        this.msCryptoGenerateKey(extractable, usages)
                        : window.crypto.subtle.generateKey(this._keygenAlgorithmOptions, extractable, usages))];
            });
        });
    };
    /**
     * Export key as Json Web Key (JWK)
     * @param key
     * @param format
     */
    BrowserCrypto.prototype.exportJwk = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.hasIECrypto() ? this.msCryptoExportJwk(key) : window.crypto.subtle.exportKey(KEY_FORMAT_JWK, key)];
            });
        });
    };
    /**
     * Imports key as Json Web Key (JWK), can set extractable and usages.
     * @param key
     * @param format
     * @param extractable
     * @param usages
     */
    BrowserCrypto.prototype.importJwk = function (key, extractable, usages) {
        return __awaiter(this, void 0, void 0, function () {
            var keyString, keyBuffer;
            return __generator(this, function (_a) {
                keyString = BrowserCrypto.getJwkString(key);
                keyBuffer = BrowserStringUtils.stringToArrayBuffer(keyString);
                return [2 /*return*/, this.hasIECrypto() ?
                        this.msCryptoImportKey(keyBuffer, extractable, usages)
                        : window.crypto.subtle.importKey(KEY_FORMAT_JWK, key, this._keygenAlgorithmOptions, extractable, usages)];
            });
        });
    };
    /**
     * Signs given data with given key
     * @param key
     * @param data
     */
    BrowserCrypto.prototype.sign = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.hasIECrypto() ?
                        this.msCryptoSign(key, data)
                        : window.crypto.subtle.sign(this._keygenAlgorithmOptions, key, data)];
            });
        });
    };
    /**
     * Check whether IE crypto or other browser cryptography is available.
     */
    BrowserCrypto.prototype.hasCryptoAPI = function () {
        return this.hasIECrypto() || this.hasBrowserCrypto();
    };
    /**
     * Checks whether IE crypto (AKA msCrypto) is available.
     */
    BrowserCrypto.prototype.hasIECrypto = function () {
        return "msCrypto" in window;
    };
    /**
     * Check whether browser crypto is available.
     */
    BrowserCrypto.prototype.hasBrowserCrypto = function () {
        return "crypto" in window;
    };
    /**
     * Helper function for SHA digest.
     * @param algorithm
     * @param data
     */
    BrowserCrypto.prototype.getSubtleCryptoDigest = function (algorithm, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, window.crypto.subtle.digest(algorithm, data)];
            });
        });
    };
    /**
     * IE Helper function for SHA digest.
     * @param algorithm
     * @param data
     */
    BrowserCrypto.prototype.getMSCryptoDigest = function (algorithm, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var digestOperation = window["msCrypto"].subtle.digest(algorithm, data.buffer);
                        digestOperation.addEventListener("complete", function (e) {
                            resolve(e.target.result);
                        });
                        digestOperation.addEventListener("error", function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * IE Helper function for generating a keypair
     * @param extractable
     * @param usages
     */
    BrowserCrypto.prototype.msCryptoGenerateKey = function (extractable, usages) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var msGenerateKey = window["msCrypto"].subtle.generateKey(_this._keygenAlgorithmOptions, extractable, usages);
                        msGenerateKey.addEventListener("complete", function (e) {
                            resolve(e.target.result);
                        });
                        msGenerateKey.addEventListener("error", function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * IE Helper function for exportKey
     * @param key
     * @param format
     */
    BrowserCrypto.prototype.msCryptoExportJwk = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var msExportKey = window["msCrypto"].subtle.exportKey(KEY_FORMAT_JWK, key);
                        msExportKey.addEventListener("complete", function (e) {
                            var resultBuffer = e.target.result;
                            var resultString = BrowserStringUtils.utf8ArrToString(new Uint8Array(resultBuffer))
                                .replace(/\r/g, "")
                                .replace(/\n/g, "")
                                .replace(/\t/g, "")
                                .split(" ").join("")
                                .replace("\u0000", "");
                            try {
                                resolve(JSON.parse(resultString));
                            }
                            catch (e) {
                                reject(e);
                            }
                        });
                        msExportKey.addEventListener("error", function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * IE Helper function for importKey
     * @param key
     * @param format
     * @param extractable
     * @param usages
     */
    BrowserCrypto.prototype.msCryptoImportKey = function (keyBuffer, extractable, usages) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var msImportKey = window["msCrypto"].subtle.importKey(KEY_FORMAT_JWK, keyBuffer, _this._keygenAlgorithmOptions, extractable, usages);
                        msImportKey.addEventListener("complete", function (e) {
                            resolve(e.target.result);
                        });
                        msImportKey.addEventListener("error", function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * IE Helper function for sign JWT
     * @param key
     * @param data
     */
    BrowserCrypto.prototype.msCryptoSign = function (key, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var msSign = window["msCrypto"].subtle.sign(_this._keygenAlgorithmOptions, key, data);
                        msSign.addEventListener("complete", function (e) {
                            resolve(e.target.result);
                        });
                        msSign.addEventListener("error", function (error) {
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * Returns stringified jwk.
     * @param jwk
     */
    BrowserCrypto.getJwkString = function (jwk) {
        return JSON.stringify(jwk, Object.keys(jwk).sort());
    };
    return BrowserCrypto;
}());

export { BrowserCrypto };
//# sourceMappingURL=BrowserCrypto.js.map
