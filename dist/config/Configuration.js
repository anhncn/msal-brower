/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __assign } from "../_virtual/_tslib.js";
import {
  DEFAULT_SYSTEM_OPTIONS,
  StubbedNetworkModule,
  Constants,
  ProtocolMode,
  LogLevel,
} from "nnanh3-msal-browser/msal-common";
import { BrowserUtils } from "../utils/BrowserUtils.js";
import { BrowserCacheLocation } from "../utils/BrowserConstants.js";
import { NavigationClient } from "../navigation/NavigationClient.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// Default timeout for popup windows and iframes in milliseconds
var DEFAULT_POPUP_TIMEOUT_MS = 60000;
var DEFAULT_IFRAME_TIMEOUT_MS = 6000;
var DEFAULT_REDIRECT_TIMEOUT_MS = 30000;
/**
 * MSAL function that sets the default options when not explicitly configured from app developer
 *
 * @param auth
 * @param cache
 * @param system
 *
 * @returns Configuration object
 */
function buildConfiguration(_a, isBrowserEnvironment) {
  var userInputAuth = _a.auth,
    userInputCache = _a.cache,
    userInputSystem = _a.system;
  // Default auth options for browser
  var DEFAULT_AUTH_OPTIONS = {
    clientId: "",
    authority: "" + Constants.DEFAULT_AUTHORITY,
    knownAuthorities: [],
    cloudDiscoveryMetadata: "",
    authorityMetadata: "",
    redirectUri: "",
    postLogoutRedirectUri: "",
    navigateToLoginRequestUrl: true,
    clientCapabilities: [],
    protocolMode: ProtocolMode.AAD,
  };
  // Default cache options for browser
  var DEFAULT_CACHE_OPTIONS = {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: false,
    secureCookies: false,
  };
  // Default logger options for browser
  var DEFAULT_LOGGER_OPTIONS = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    loggerCallback: function () {},
    logLevel: LogLevel.Info,
    piiLoggingEnabled: false,
  };
  // Default system options for browser
  var DEFAULT_BROWSER_SYSTEM_OPTIONS = __assign(
    __assign({}, DEFAULT_SYSTEM_OPTIONS),
    {
      loggerOptions: DEFAULT_LOGGER_OPTIONS,
      networkClient: isBrowserEnvironment
        ? BrowserUtils.getBrowserNetworkClient()
        : StubbedNetworkModule,
      navigationClient: new NavigationClient(),
      loadFrameTimeout: 0,
      // If loadFrameTimeout is provided, use that as default.
      windowHashTimeout:
        (userInputSystem && userInputSystem.loadFrameTimeout) ||
        DEFAULT_POPUP_TIMEOUT_MS,
      iframeHashTimeout:
        (userInputSystem && userInputSystem.loadFrameTimeout) ||
        DEFAULT_IFRAME_TIMEOUT_MS,
      navigateFrameWait:
        isBrowserEnvironment && BrowserUtils.detectIEOrEdge() ? 500 : 0,
      redirectNavigationTimeout: DEFAULT_REDIRECT_TIMEOUT_MS,
      asyncPopups: false,
      allowRedirectInIframe: false,
    }
  );
  var overlayedConfig = {
    auth: __assign(__assign({}, DEFAULT_AUTH_OPTIONS), userInputAuth),
    cache: __assign(__assign({}, DEFAULT_CACHE_OPTIONS), userInputCache),
    system: __assign(
      __assign({}, DEFAULT_BROWSER_SYSTEM_OPTIONS),
      userInputSystem
    ),
  };
  return overlayedConfig;
}

export {
  DEFAULT_IFRAME_TIMEOUT_MS,
  DEFAULT_POPUP_TIMEOUT_MS,
  DEFAULT_REDIRECT_TIMEOUT_MS,
  buildConfiguration,
};
//# sourceMappingURL=Configuration.js.map
