/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { BrowserStringUtils } from '../utils/BrowserStringUtils.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Class which exposes APIs to decode base64 strings to plaintext. See here for implementation details:
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_JavaScript's_UTF-16_%3E_UTF-8_%3E_base64
 */
var Base64Decode = /** @class */ (function () {
    function Base64Decode() {
    }
    /**
     * Returns a URL-safe plaintext decoded string from b64 encoded input.
     * @param input
     */
    Base64Decode.prototype.decode = function (input) {
        var encodedString = input.replace(/-/g, "+").replace(/_/g, "/");
        switch (encodedString.length % 4) {
            case 0:
                break;
            case 2:
                encodedString += "==";
                break;
            case 3:
                encodedString += "=";
                break;
            default:
                throw new Error("Invalid base64 string");
        }
        var inputUtf8Arr = this.base64DecToArr(encodedString);
        return BrowserStringUtils.utf8ArrToString(inputUtf8Arr);
    };
    /**
     * Decodes base64 into Uint8Array
     * @param base64String
     * @param nBlockSize
     */
    Base64Decode.prototype.base64DecToArr = function (base64String, nBlockSize) {
        var sB64Enc = base64String.replace(/[^A-Za-z0-9\+\/]/g, "");
        var nInLen = sB64Enc.length;
        var nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2;
        var aBytes = new Uint8Array(nOutLen);
        for (var nMod3 = void 0, nMod4 = void 0, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                    aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return aBytes;
    };
    /**
     * Base64 string to array decoding helper
     * @param charNum
     */
    Base64Decode.prototype.b64ToUint6 = function (charNum) {
        return charNum > 64 && charNum < 91 ?
            charNum - 65
            : charNum > 96 && charNum < 123 ?
                charNum - 71
                : charNum > 47 && charNum < 58 ?
                    charNum + 4
                    : charNum === 43 ?
                        62
                        : charNum === 47 ?
                            63
                            :
                                0;
    };
    return Base64Decode;
}());

export { Base64Decode };
//# sourceMappingURL=Base64Decode.js.map
