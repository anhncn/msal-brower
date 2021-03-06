/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var EventHandler = /** @class */ (function () {
    function EventHandler(logger, browserCrypto) {
        this.eventCallbacks = new Map();
        this.logger = logger;
        this.browserCrypto = browserCrypto;
    }
    /**
     * Adds event callbacks to array
     * @param callback
     */
    EventHandler.prototype.addEventCallback = function (callback) {
        if (typeof window !== "undefined") {
            var callbackId = this.browserCrypto.createNewGuid();
            this.eventCallbacks.set(callbackId, callback);
            this.logger.verbose("Event callback registered with id: " + callbackId);
            return callbackId;
        }
        return null;
    };
    /**
     * Removes callback with provided id from callback array
     * @param callbackId
     */
    EventHandler.prototype.removeEventCallback = function (callbackId) {
        this.eventCallbacks.delete(callbackId);
        this.logger.verbose("Event callback " + callbackId + " removed.");
    };
    /**
     * Emits events by calling callback with event message
     * @param eventType
     * @param interactionType
     * @param payload
     * @param error
     */
    EventHandler.prototype.emitEvent = function (eventType, interactionType, payload, error) {
        var _this = this;
        if (typeof window !== "undefined") {
            var message_1 = {
                eventType: eventType,
                interactionType: interactionType || null,
                payload: payload || null,
                error: error || null,
                timestamp: Date.now()
            };
            this.logger.info("Emitting event: " + eventType);
            this.eventCallbacks.forEach(function (callback, callbackId) {
                _this.logger.verbose("Emitting event to callback " + callbackId + ": " + eventType);
                callback.apply(null, [message_1]);
            });
        }
    };
    return EventHandler;
}());

export { EventHandler };
//# sourceMappingURL=EventHandler.js.map
