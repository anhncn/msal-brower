/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { __awaiter, __generator } from '../_virtual/_tslib.js';
import { GuidGenerator } from './GuidGenerator.js';
import { Base64Encode } from '../encode/Base64Encode.js';
import { Base64Decode } from '../encode/Base64Decode.js';
import { PkceGenerator } from './PkceGenerator.js';
import { BrowserCrypto } from './BrowserCrypto.js';
import { DatabaseStorage } from '../cache/DatabaseStorage.js';
import { BrowserStringUtils } from '../utils/BrowserStringUtils.js';
import { KEY_FORMAT_JWK } from '../utils/BrowserConstants.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * This class implements MSAL's crypto interface, which allows it to perform base64 encoding and decoding, generating cryptographically random GUIDs and
 * implementing Proof Key for Code Exchange specs for the OAuth Authorization Code Flow using PKCE (rfc here: https://tools.ietf.org/html/rfc7636).
 */
var CryptoOps = /** @class */ (function () {
    function CryptoOps() {
        // Browser crypto needs to be validated first before any other classes can be set.
        this.browserCrypto = new BrowserCrypto();
        this.b64Encode = new Base64Encode();
        this.b64Decode = new Base64Decode();
        this.guidGenerator = new GuidGenerator(this.browserCrypto);
        this.pkceGenerator = new PkceGenerator(this.browserCrypto);
        this.cache = new DatabaseStorage(CryptoOps.DB_NAME, CryptoOps.TABLE_NAME, CryptoOps.DB_VERSION);
    }
    /**
     * Creates a new random GUID - used to populate state and nonce.
     * @returns string (GUID)
     */
    CryptoOps.prototype.createNewGuid = function () {
        return this.guidGenerator.generateGuid();
    };
    /**
     * Encodes input string to base64.
     * @param input
     */
    CryptoOps.prototype.base64Encode = function (input) {
        return this.b64Encode.encode(input);
    };
    /**
     * Decodes input string from base64.
     * @param input
     */
    CryptoOps.prototype.base64Decode = function (input) {
        return this.b64Decode.decode(input);
    };
    /**
     * Generates PKCE codes used in Authorization Code Flow.
     */
    CryptoOps.prototype.generatePkceCodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.pkceGenerator.generateCodes()];
            });
        });
    };
    /**
     * Generates a keypair, stores it and returns a thumbprint
     * @param request
     */
    CryptoOps.prototype.getPublicKeyThumbprint = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var keyPair, publicKeyJwk, pubKeyThumprintObj, publicJwkString, publicJwkBuffer, publicJwkHash, privateKeyJwk, unextractablePrivateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.browserCrypto.generateKeyPair(CryptoOps.EXTRACTABLE, CryptoOps.POP_KEY_USAGES)];
                    case 1:
                        keyPair = _a.sent();
                        return [4 /*yield*/, this.browserCrypto.exportJwk(keyPair.publicKey)];
                    case 2:
                        publicKeyJwk = _a.sent();
                        pubKeyThumprintObj = {
                            e: publicKeyJwk.e,
                            kty: publicKeyJwk.kty,
                            n: publicKeyJwk.n
                        };
                        publicJwkString = BrowserCrypto.getJwkString(pubKeyThumprintObj);
                        return [4 /*yield*/, this.browserCrypto.sha256Digest(publicJwkString)];
                    case 3:
                        publicJwkBuffer = _a.sent();
                        publicJwkHash = this.b64Encode.urlEncodeArr(new Uint8Array(publicJwkBuffer));
                        return [4 /*yield*/, this.browserCrypto.exportJwk(keyPair.privateKey)];
                    case 4:
                        privateKeyJwk = _a.sent();
                        return [4 /*yield*/, this.browserCrypto.importJwk(privateKeyJwk, false, ["sign"])];
                    case 5:
                        unextractablePrivateKey = _a.sent();
                        // Store Keypair data in keystore
                        this.cache.put(publicJwkHash, {
                            privateKey: unextractablePrivateKey,
                            publicKey: keyPair.publicKey,
                            requestMethod: request.resourceRequestMethod,
                            requestUri: request.resourceRequestUri
                        });
                        return [2 /*return*/, publicJwkHash];
                }
            });
        });
    };
    /**
     * Signs the given object as a jwt payload with private key retrieved by given kid.
     * @param payload
     * @param kid
     */
    CryptoOps.prototype.signJwt = function (payload, kid) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedKeyPair, publicKeyJwk, publicKeyJwkString, header, encodedHeader, encodedPayload, tokenString, tokenBuffer, signatureBuffer, encodedSignature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.get(kid)];
                    case 1:
                        cachedKeyPair = _a.sent();
                        return [4 /*yield*/, this.browserCrypto.exportJwk(cachedKeyPair.publicKey)];
                    case 2:
                        publicKeyJwk = _a.sent();
                        publicKeyJwkString = BrowserCrypto.getJwkString(publicKeyJwk);
                        header = {
                            alg: publicKeyJwk.alg,
                            type: KEY_FORMAT_JWK
                        };
                        encodedHeader = this.b64Encode.urlEncode(JSON.stringify(header));
                        // Generate payload
                        payload.cnf = {
                            jwk: JSON.parse(publicKeyJwkString)
                        };
                        encodedPayload = this.b64Encode.urlEncode(JSON.stringify(payload));
                        tokenString = encodedHeader + "." + encodedPayload;
                        tokenBuffer = BrowserStringUtils.stringToArrayBuffer(tokenString);
                        return [4 /*yield*/, this.browserCrypto.sign(cachedKeyPair.privateKey, tokenBuffer)];
                    case 3:
                        signatureBuffer = _a.sent();
                        encodedSignature = this.b64Encode.urlEncodeArr(new Uint8Array(signatureBuffer));
                        return [2 /*return*/, tokenString + "." + encodedSignature];
                }
            });
        });
    };
    CryptoOps.POP_KEY_USAGES = ["sign", "verify"];
    CryptoOps.EXTRACTABLE = true;
    CryptoOps.DB_VERSION = 1;
    CryptoOps.DB_NAME = "msal.db";
    CryptoOps.TABLE_NAME = CryptoOps.DB_NAME + ".keys";
    return CryptoOps;
}());

export { CryptoOps };
//# sourceMappingURL=CryptoOps.js.map
