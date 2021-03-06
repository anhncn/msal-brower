/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { StringUtils, Constants } from "nnanh3-msal-browser/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import {
  TemporaryCacheKeys,
  BrowserConstants,
  InteractionType,
} from "./BrowserConstants.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var PopupUtils = /** @class */ (function () {
  function PopupUtils(storageImpl, logger) {
    this.browserStorage = storageImpl;
    this.logger = logger;
    // Properly sets this reference for the unload event.
    this.unloadWindow = this.unloadWindow.bind(this);
  }
  /**
   * @hidden
   *
   * Configures popup window for login.
   *
   * @param urlNavigate
   * @param title
   * @param popUpWidth
   * @param popUpHeight
   * @ignore
   * @hidden
   */
  PopupUtils.prototype.openPopup = function (urlNavigate, popupName, popup) {
    try {
      var popupWindow = void 0;
      // Popup window passed in, setting url to navigate to
      if (popup) {
        popupWindow = popup;
        this.logger.verbosePii("Navigating popup window to: " + urlNavigate);
        popupWindow.location.assign(urlNavigate);
      } else if (typeof popup === "undefined") {
        // Popup will be undefined if it was not passed in
        this.logger.verbosePii("Opening popup window to: " + urlNavigate);
        popupWindow = PopupUtils.openSizedPopup(urlNavigate, popupName);
      }
      // Popup will be null if popups are blocked
      if (!popupWindow) {
        throw BrowserAuthError.createEmptyWindowCreatedError();
      }
      if (popupWindow.focus) {
        popupWindow.focus();
      }
      this.currentWindow = popupWindow;
      window.addEventListener("beforeunload", this.unloadWindow);
      return popupWindow;
    } catch (e) {
      this.logger.error("error opening popup " + e.message);
      this.browserStorage.removeItem(
        this.browserStorage.generateCacheKey(
          TemporaryCacheKeys.INTERACTION_STATUS_KEY
        )
      );
      throw BrowserAuthError.createPopupWindowError(e.toString());
    }
  };
  PopupUtils.openSizedPopup = function (urlNavigate, popupName) {
    /**
     * adding winLeft and winTop to account for dual monitor
     * using screenLeft and screenTop for IE8 and earlier
     */
    var winLeft = window.screenLeft ? window.screenLeft : window.screenX;
    var winTop = window.screenTop ? window.screenTop : window.screenY;
    /**
     * window.innerWidth displays browser window"s height and width excluding toolbars
     * using document.documentElement.clientWidth for IE8 and earlier
     */
    var width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    var height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    var left = Math.max(
      0,
      width / 2 - BrowserConstants.POPUP_WIDTH / 2 + winLeft
    );
    var top = Math.max(
      0,
      height / 2 - BrowserConstants.POPUP_HEIGHT / 2 + winTop
    );
    return window.open(
      urlNavigate,
      popupName,
      "width=" +
        BrowserConstants.POPUP_WIDTH +
        ", height=" +
        BrowserConstants.POPUP_HEIGHT +
        ", top=" +
        top +
        ", left=" +
        left +
        ", scrollbars=yes"
    );
  };
  /**
   * Event callback to unload main window.
   */
  PopupUtils.prototype.unloadWindow = function (e) {
    this.browserStorage.cleanRequestByInteractionType(InteractionType.Popup);
    if (this.currentWindow) {
      this.currentWindow.close();
    }
    // Guarantees browser unload will happen, so no other errors will be thrown.
    e.preventDefault();
  };
  /**
   * Closes popup, removes any state vars created during popup calls.
   * @param popupWindow
   */
  PopupUtils.prototype.cleanPopup = function (popupWindow) {
    if (popupWindow) {
      // Close window.
      popupWindow.close();
    }
    // Remove window unload function
    window.removeEventListener("beforeunload", this.unloadWindow);
    // Interaction is completed - remove interaction status.
    this.browserStorage.removeItem(
      this.browserStorage.generateCacheKey(
        TemporaryCacheKeys.INTERACTION_STATUS_KEY
      )
    );
  };
  /**
   * Monitors a window until it loads a url with the same origin.
   * @param popupWindow - window that is being monitored
   */
  PopupUtils.prototype.monitorPopupForSameOrigin = function (popupWindow) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var intervalId = setInterval(function () {
        if (popupWindow.closed) {
          // Window is closed
          _this.cleanPopup();
          clearInterval(intervalId);
          reject(BrowserAuthError.createUserCancelledError());
          return;
        }
        var href = Constants.EMPTY_STRING;
        try {
          /*
           * Will throw if cross origin,
           * which should be caught and ignored
           * since we need the interval to keep running while on STS UI.
           */
          href = popupWindow.location.href;
        } catch (e) {}
        // Don't process blank pages or cross domain
        if (StringUtils.isEmpty(href) || href === "about:blank") {
          return;
        }
        clearInterval(intervalId);
        resolve();
      }, BrowserConstants.POLL_INTERVAL_MS);
    });
  };
  /**
   * Generates the name for the popup based on the client id and request
   * @param clientId
   * @param request
   */
  PopupUtils.generatePopupName = function (clientId, request) {
    return (
      BrowserConstants.POPUP_NAME_PREFIX +
      "." +
      clientId +
      "." +
      request.scopes.join("-") +
      "." +
      request.authority +
      "." +
      request.correlationId
    );
  };
  /**
   * Generates the name for the popup based on the client id and request for logouts
   * @param clientId
   * @param request
   */
  PopupUtils.generateLogoutPopupName = function (clientId, request) {
    var homeAccountId = request.account && request.account.homeAccountId;
    return (
      BrowserConstants.POPUP_NAME_PREFIX +
      "." +
      clientId +
      "." +
      homeAccountId +
      "." +
      request.correlationId
    );
  };
  return PopupUtils;
})();

export { PopupUtils };
//# sourceMappingURL=PopupUtils.js.map
