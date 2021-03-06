/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Utility class for math specific functions in browser.
 */
var MathUtils = /** @class */ (function () {
    function MathUtils() {
    }
    /**
     * Decimal to Hex
     *
     * @param num
     */
    MathUtils.decimalToHex = function (num) {
        var hex = num.toString(16);
        while (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };
    return MathUtils;
}());

export { MathUtils };
//# sourceMappingURL=MathUtils.js.map
