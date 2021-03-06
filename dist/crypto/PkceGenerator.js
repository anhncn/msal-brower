/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { __awaiter, __generator } from '../_virtual/_tslib.js';
import { BrowserAuthError } from '../error/BrowserAuthError.js';
import { Base64Encode } from '../encode/Base64Encode.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Constant byte array length
var RANDOM_BYTE_ARR_LENGTH = 32;
/**
 * Class which exposes APIs to generate PKCE codes and code verifiers.
 */
var PkceGenerator = /** @class */ (function () {
    function PkceGenerator(cryptoObj) {
        this.base64Encode = new Base64Encode();
        this.cryptoObj = cryptoObj;
    }
    /**
     * Generates PKCE Codes. See the RFC for more information: https://tools.ietf.org/html/rfc7636
     */
    PkceGenerator.prototype.generateCodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var codeVerifier, codeChallenge;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        codeVerifier = this.generateCodeVerifier();
                        return [4 /*yield*/, this.generateCodeChallengeFromVerifier(codeVerifier)];
                    case 1:
                        codeChallenge = _a.sent();
                        return [2 /*return*/, {
                                verifier: codeVerifier,
                                challenge: codeChallenge
                            }];
                }
            });
        });
    };
    /**
     * Generates a random 32 byte buffer and returns the base64
     * encoded string to be used as a PKCE Code Verifier
     */
    PkceGenerator.prototype.generateCodeVerifier = function () {
        try {
            // Generate random values as utf-8
            var buffer = new Uint8Array(RANDOM_BYTE_ARR_LENGTH);
            this.cryptoObj.getRandomValues(buffer);
            // encode verifier as base64
            var pkceCodeVerifierB64 = this.base64Encode.urlEncodeArr(buffer);
            return pkceCodeVerifierB64;
        }
        catch (e) {
            throw BrowserAuthError.createPkceNotGeneratedError(e);
        }
    };
    /**
     * Creates a base64 encoded PKCE Code Challenge string from the
     * hash created from the PKCE Code Verifier supplied
     */
    PkceGenerator.prototype.generateCodeChallengeFromVerifier = function (pkceCodeVerifier) {
        return __awaiter(this, void 0, void 0, function () {
            var pkceHashedCodeVerifier, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cryptoObj.sha256Digest(pkceCodeVerifier)];
                    case 1:
                        pkceHashedCodeVerifier = _a.sent();
                        // encode hash as base64
                        return [2 /*return*/, this.base64Encode.urlEncodeArr(new Uint8Array(pkceHashedCodeVerifier))];
                    case 2:
                        e_1 = _a.sent();
                        throw BrowserAuthError.createPkceNotGeneratedError(e_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PkceGenerator;
}());

export { PkceGenerator };
//# sourceMappingURL=PkceGenerator.js.map
