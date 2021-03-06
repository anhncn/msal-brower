/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __extends } from "../_virtual/_tslib.js";
import { StringUtils, UrlString } from "nnanh3-msal-browser/msal-common";
import { InteractionHandler } from "./InteractionHandler.js";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import {
  TemporaryCacheKeys,
  BrowserConstants,
} from "../utils/BrowserConstants.js";
import { PopupUtils } from "../utils/PopupUtils.js";
import { BrowserUtils } from "../utils/BrowserUtils.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * This class implements the interaction handler base class for browsers. It is written specifically for handling
 * popup window scenarios. It includes functions for monitoring the popup window for a hash.
 */
var PopupHandler = /** @class */ (function (_super) {
  __extends(PopupHandler, _super);
  function PopupHandler(
    authCodeModule,
    storageImpl,
    authCodeRequest,
    browserRequestLogger
  ) {
    var _this =
      _super.call(
        this,
        authCodeModule,
        storageImpl,
        authCodeRequest,
        browserRequestLogger
      ) || this;
    // Properly sets this reference for the unload event.
    _this.popupUtils = new PopupUtils(storageImpl, browserRequestLogger);
    return _this;
  }
  /**
   * Opens a popup window with given request Url.
   * @param requestUrl
   */
  PopupHandler.prototype.initiateAuthRequest = function (requestUrl, params) {
    // Check that request url is not empty.
    if (!StringUtils.isEmpty(requestUrl)) {
      // Set interaction status in the library.
      this.browserStorage.setTemporaryCache(
        TemporaryCacheKeys.INTERACTION_STATUS_KEY,
        BrowserConstants.INTERACTION_IN_PROGRESS_VALUE,
        true
      );
      this.browserRequestLogger.infoPii("Navigate to: " + requestUrl);
      // Open the popup window to requestUrl.
      return this.popupUtils.openPopup(
        requestUrl,
        params.popupName,
        params.popup
      );
    } else {
      // Throw error if request URL is empty.
      this.browserRequestLogger.error("Navigate url is empty");
      throw BrowserAuthError.createEmptyNavigationUriError();
    }
  };
  /**
   * Monitors a window until it loads a url with a known hash, or hits a specified timeout.
   * @param popupWindow - window that is being monitored
   * @param timeout - milliseconds until timeout
   */
  PopupHandler.prototype.monitorPopupForHash = function (popupWindow) {
    var _this = this;
    return this.popupUtils
      .monitorPopupForSameOrigin(popupWindow)
      .then(function () {
        var contentHash = popupWindow.location.hash;
        BrowserUtils.clearHash(popupWindow);
        _this.popupUtils.cleanPopup(popupWindow);
        if (!contentHash) {
          throw BrowserAuthError.createEmptyHashError(
            popupWindow.location.href
          );
        }
        if (UrlString.hashContainsKnownProperties(contentHash)) {
          return contentHash;
        } else {
          throw BrowserAuthError.createHashDoesNotContainKnownPropertiesError();
        }
      });
  };
  return PopupHandler;
})(InteractionHandler);

export { PopupHandler };
//# sourceMappingURL=PopupHandler.js.map
