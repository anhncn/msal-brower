/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Utility functions for strings in a browser. See here for implementation details:
 * https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_JavaScript's_UTF-16_%3E_UTF-8_%3E_base64
 */
var BrowserStringUtils = /** @class */ (function () {
    function BrowserStringUtils() {
    }
    /**
     * Converts string to Uint8Array
     * @param sDOMStr
     */
    BrowserStringUtils.stringToUtf8Arr = function (sDOMStr) {
        var nChr;
        var nArrLen = 0;
        var nStrLen = sDOMStr.length;
        /* mapping... */
        for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
            nChr = sDOMStr.charCodeAt(nMapIdx);
            nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
        }
        var aBytes = new Uint8Array(nArrLen);
        /* transcription... */
        for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
            nChr = sDOMStr.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                aBytes[nIdx++] = nChr;
            }
            else if (nChr < 0x800) {
                /* two bytes */
                aBytes[nIdx++] = 192 + (nChr >>> 6);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
            else if (nChr < 0x10000) {
                /* three bytes */
                aBytes[nIdx++] = 224 + (nChr >>> 12);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
            else if (nChr < 0x200000) {
                /* four bytes */
                aBytes[nIdx++] = 240 + (nChr >>> 18);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
            else if (nChr < 0x4000000) {
                /* five bytes */
                aBytes[nIdx++] = 248 + (nChr >>> 24);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
            else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                aBytes[nIdx++] = 252 + (nChr >>> 30);
                aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
        }
        return aBytes;
    };
    /**
     * Converst string to ArrayBuffer
     * @param dataString
     */
    BrowserStringUtils.stringToArrayBuffer = function (dataString) {
        var data = new ArrayBuffer(dataString.length);
        var dataView = new Uint8Array(data);
        for (var i = 0; i < dataString.length; i++) {
            dataView[i] = dataString.charCodeAt(i);
        }
        return data;
    };
    /**
     * Converts Uint8Array to a string
     * @param aBytes
     */
    BrowserStringUtils.utf8ArrToString = function (aBytes) {
        var sView = "";
        for (var nPart = void 0, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
            nPart = aBytes[nIdx];
            sView += String.fromCharCode(nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
                /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
                (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
                    (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                    : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
                        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                        : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
                            (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                            : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                                (nPart - 192 << 6) + aBytes[++nIdx] - 128
                                : /* nPart < 127 ? */ /* one byte */
                                    nPart);
        }
        return sView;
    };
    return BrowserStringUtils;
}());

export { BrowserStringUtils };
//# sourceMappingURL=BrowserStringUtils.js.map