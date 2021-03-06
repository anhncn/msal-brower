/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { EventType } from './EventType.js';
import { InteractionType, InteractionStatus } from '../utils/BrowserConstants.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var EventMessageUtils = /** @class */ (function () {
    function EventMessageUtils() {
    }
    /**
     * Gets interaction status from event message
     * @param message
     */
    EventMessageUtils.getInteractionStatusFromEvent = function (message) {
        switch (message.eventType) {
            case EventType.LOGIN_START:
                return InteractionStatus.Login;
            case EventType.SSO_SILENT_START:
                return InteractionStatus.SsoSilent;
            case EventType.ACQUIRE_TOKEN_START:
                if (message.interactionType === InteractionType.Redirect || message.interactionType === InteractionType.Popup) {
                    return InteractionStatus.AcquireToken;
                }
                break;
            case EventType.HANDLE_REDIRECT_START:
                return InteractionStatus.HandleRedirect;
            case EventType.LOGOUT_START:
                return InteractionStatus.Logout;
            case EventType.LOGIN_SUCCESS:
            case EventType.SSO_SILENT_SUCCESS:
            case EventType.HANDLE_REDIRECT_END:
            case EventType.LOGIN_FAILURE:
            case EventType.SSO_SILENT_FAILURE:
            case EventType.LOGOUT_END:
                return InteractionStatus.None;
            case EventType.ACQUIRE_TOKEN_SUCCESS:
            case EventType.ACQUIRE_TOKEN_FAILURE:
                if (message.interactionType === InteractionType.Redirect || message.interactionType === InteractionType.Popup) {
                    return InteractionStatus.None;
                }
                break;
        }
        return null;
    };
    return EventMessageUtils;
}());

export { EventMessageUtils };
//# sourceMappingURL=EventMessage.js.map
