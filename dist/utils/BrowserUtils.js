/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { Constants, UrlString } from "nnanh3-msal-browser/msal-common";
import { FetchClient } from "../network/FetchClient.js";
import { XhrClient } from "../network/XhrClient.js";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import { BrowserConstants, InteractionType } from "./BrowserConstants.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Utility class for browser specific functions
 */
var BrowserUtils = /** @class */ (function () {
  function BrowserUtils() {}
  // #region Window Navigation and URL management
  /**
   * Clears hash from window url.
   */
  BrowserUtils.clearHash = function (contentWindow) {
    // Office.js sets history.replaceState to null
    contentWindow.location.hash = Constants.EMPTY_STRING;
    if (typeof contentWindow.history.replaceState === "function") {
      // Full removes "#" from url
      contentWindow.history.replaceState(
        null,
        Constants.EMPTY_STRING,
        "" +
          contentWindow.location.origin +
          contentWindow.location.pathname +
          contentWindow.location.search
      );
    }
  };
  /**
   * Replaces current hash with hash from provided url
   */
  BrowserUtils.replaceHash = function (url) {
    var urlParts = url.split("#");
    urlParts.shift(); // Remove part before the hash
    window.location.hash = urlParts.length > 0 ? urlParts.join("#") : "";
  };
  /**
   * Returns boolean of whether the current window is in an iframe or not.
   */
  BrowserUtils.isInIframe = function () {
    return window.parent !== window;
  };
  /**
   * Returns boolean of whether or not the current window is a popup opened by msal
   */
  BrowserUtils.isInPopup = function () {
    return (
      typeof window !== "undefined" &&
      !!window.opener &&
      window.opener !== window &&
      typeof window.name === "string" &&
      window.name.indexOf(BrowserConstants.POPUP_NAME_PREFIX + ".") === 0
    );
  };
  // #endregion
  /**
   * Returns current window URL as redirect uri
   */
  BrowserUtils.getCurrentUri = function () {
    return window.location.href.split("?")[0].split("#")[0];
  };
  /**
   * Gets the homepage url for the current window location.
   */
  BrowserUtils.getHomepage = function () {
    var currentUrl = new UrlString(window.location.href);
    var urlComponents = currentUrl.getUrlComponents();
    return urlComponents.Protocol + "//" + urlComponents.HostNameAndPort + "/";
  };
  /**
   * Returns best compatible network client object.
   */
  BrowserUtils.getBrowserNetworkClient = function () {
    if (window.fetch && window.Headers) {
      return new FetchClient();
    } else {
      return new XhrClient();
    }
  };
  /**
   * Throws error if we have completed an auth and are
   * attempting another auth request inside an iframe.
   */
  BrowserUtils.blockReloadInHiddenIframes = function () {
    var isResponseHash = UrlString.hashContainsKnownProperties(
      window.location.hash
    );
    // return an error if called from the hidden iframe created by the msal js silent calls
    if (isResponseHash && BrowserUtils.isInIframe()) {
      throw BrowserAuthError.createBlockReloadInHiddenIframeError();
    }
  };
  /**
   * Block redirect operations in iframes unless explicitly allowed
   * @param interactionType Interaction type for the request
   * @param allowRedirectInIframe Config value to allow redirects when app is inside an iframe
   */
  BrowserUtils.blockRedirectInIframe = function (
    interactionType,
    allowRedirectInIframe
  ) {
    var isIframedApp = BrowserUtils.isInIframe();
    if (
      interactionType === InteractionType.Redirect &&
      isIframedApp &&
      !allowRedirectInIframe
    ) {
      // If we are not in top frame, we shouldn't redirect. This is also handled by the service.
      throw BrowserAuthError.createRedirectInIframeError(isIframedApp);
    }
  };
  /**
   * Block redirectUri loaded in popup from calling AcquireToken APIs
   */
  BrowserUtils.blockAcquireTokenInPopups = function () {
    // Popups opened by msal popup APIs are given a name that starts with "msal."
    if (BrowserUtils.isInPopup()) {
      throw BrowserAuthError.createBlockAcquireTokenInPopupsError();
    }
  };
  /**
   * Throws error if token requests are made in non-browser environment
   * @param isBrowserEnvironment Flag indicating if environment is a browser.
   */
  BrowserUtils.blockNonBrowserEnvironment = function (isBrowserEnvironment) {
    if (!isBrowserEnvironment) {
      throw BrowserAuthError.createNonBrowserEnvironmentError();
    }
  };
  /**
   * Returns boolean of whether current browser is an Internet Explorer or Edge browser.
   */
  BrowserUtils.detectIEOrEdge = function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var msie11 = ua.indexOf("Trident/");
    var msedge = ua.indexOf("Edge/");
    var isIE = msie > 0 || msie11 > 0;
    var isEdge = msedge > 0;
    return isIE || isEdge;
  };
  return BrowserUtils;
})();

export { BrowserUtils };
//# sourceMappingURL=BrowserUtils.js.map
