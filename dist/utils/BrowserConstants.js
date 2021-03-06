/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { OIDC_DEFAULT_SCOPES } from "nnanh3-msal-browser/msal-common";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Constants
 */
var BrowserConstants = {
  /**
   * Interaction in progress cache value
   */
  INTERACTION_IN_PROGRESS_VALUE: "interaction_in_progress",
  /**
   * Invalid grant error code
   */
  INVALID_GRANT_ERROR: "invalid_grant",
  /**
   * Default popup window width
   */
  POPUP_WIDTH: 483,
  /**
   * Default popup window height
   */
  POPUP_HEIGHT: 600,
  /**
   * Name of the popup window starts with
   */
  POPUP_NAME_PREFIX: "msal",
  /**
   * Default popup monitor poll interval in milliseconds
   */
  POLL_INTERVAL_MS: 50,
  /**
   * Msal-browser SKU
   */
  MSAL_SKU: "msal.js.browser",
};
var BrowserCacheLocation;
(function (BrowserCacheLocation) {
  BrowserCacheLocation["LocalStorage"] = "localStorage";
  BrowserCacheLocation["SessionStorage"] = "sessionStorage";
  BrowserCacheLocation["MemoryStorage"] = "memoryStorage";
})(BrowserCacheLocation || (BrowserCacheLocation = {}));
/**
 * HTTP Request types supported by MSAL.
 */
var HTTP_REQUEST_TYPE;
(function (HTTP_REQUEST_TYPE) {
  HTTP_REQUEST_TYPE["GET"] = "GET";
  HTTP_REQUEST_TYPE["POST"] = "POST";
})(HTTP_REQUEST_TYPE || (HTTP_REQUEST_TYPE = {}));
/**
 * Temporary cache keys for MSAL, deleted after any request.
 */
var TemporaryCacheKeys;
(function (TemporaryCacheKeys) {
  TemporaryCacheKeys["AUTHORITY"] = "authority";
  TemporaryCacheKeys["ACQUIRE_TOKEN_ACCOUNT"] = "acquireToken.account";
  TemporaryCacheKeys["SESSION_STATE"] = "session.state";
  TemporaryCacheKeys["REQUEST_STATE"] = "request.state";
  TemporaryCacheKeys["NONCE_IDTOKEN"] = "nonce.id_token";
  TemporaryCacheKeys["ORIGIN_URI"] = "request.origin";
  TemporaryCacheKeys["RENEW_STATUS"] = "token.renew.status";
  TemporaryCacheKeys["URL_HASH"] = "urlHash";
  TemporaryCacheKeys["REQUEST_PARAMS"] = "request.params";
  TemporaryCacheKeys["SCOPES"] = "scopes";
  TemporaryCacheKeys["INTERACTION_STATUS_KEY"] = "interaction.status";
  TemporaryCacheKeys["CCS_CREDENTIAL"] = "ccs.credential";
})(TemporaryCacheKeys || (TemporaryCacheKeys = {}));
/**
 * API Codes for Telemetry purposes.
 * Before adding a new code you must claim it in the MSAL Telemetry tracker as these number spaces are shared across all MSALs
 * 0-99 Silent Flow
 * 800-899 Auth Code Flow
 */
var ApiId;
(function (ApiId) {
  ApiId[(ApiId["acquireTokenRedirect"] = 861)] = "acquireTokenRedirect";
  ApiId[(ApiId["acquireTokenPopup"] = 862)] = "acquireTokenPopup";
  ApiId[(ApiId["ssoSilent"] = 863)] = "ssoSilent";
  ApiId[(ApiId["acquireTokenSilent_authCode"] = 864)] =
    "acquireTokenSilent_authCode";
  ApiId[(ApiId["handleRedirectPromise"] = 865)] = "handleRedirectPromise";
  ApiId[(ApiId["acquireTokenSilent_silentFlow"] = 61)] =
    "acquireTokenSilent_silentFlow";
  ApiId[(ApiId["logout"] = 961)] = "logout";
  ApiId[(ApiId["logoutPopup"] = 962)] = "logoutPopup";
})(ApiId || (ApiId = {}));
/*
 * Interaction type of the API - used for state and telemetry
 */
var InteractionType;
(function (InteractionType) {
  InteractionType["Redirect"] = "redirect";
  InteractionType["Popup"] = "popup";
  InteractionType["Silent"] = "silent";
})(InteractionType || (InteractionType = {}));
/**
 * Types of interaction currently in progress.
 * Used in events in wrapper libraries to invoke functions when certain interaction is in progress or all interactions are complete.
 */
var InteractionStatus;
(function (InteractionStatus) {
  /**
   * Initial status before interaction occurs
   */
  InteractionStatus["Startup"] = "startup";
  /**
   * Status set when all login calls occuring
   */
  InteractionStatus["Login"] = "login";
  /**
   * Status set when logout call occuring
   */
  InteractionStatus["Logout"] = "logout";
  /**
   * Status set for acquireToken calls
   */
  InteractionStatus["AcquireToken"] = "acquireToken";
  /**
   * Status set for ssoSilent calls
   */
  InteractionStatus["SsoSilent"] = "ssoSilent";
  /**
   * Status set when handleRedirect in progress
   */
  InteractionStatus["HandleRedirect"] = "handleRedirect";
  /**
   * Status set when interaction is complete
   */
  InteractionStatus["None"] = "none";
})(InteractionStatus || (InteractionStatus = {}));
var DEFAULT_REQUEST = {
  scopes: OIDC_DEFAULT_SCOPES,
};
/**
 * JWK Key Format string (Type MUST be defined for window crypto APIs)
 */
var KEY_FORMAT_JWK = "jwk";
// Supported wrapper SKUs
var WrapperSKU;
(function (WrapperSKU) {
  WrapperSKU["React"] = "@azure/msal-react";
  WrapperSKU["Angular"] = "@azure/msal-angular";
})(WrapperSKU || (WrapperSKU = {}));

export {
  ApiId,
  BrowserCacheLocation,
  BrowserConstants,
  DEFAULT_REQUEST,
  HTTP_REQUEST_TYPE,
  InteractionStatus,
  InteractionType,
  KEY_FORMAT_JWK,
  TemporaryCacheKeys,
  WrapperSKU,
};
//# sourceMappingURL=BrowserConstants.js.map
