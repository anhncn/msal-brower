/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __extends } from "../_virtual/_tslib.js";
import { StringUtils, AuthError } from "nnanh3-msal-browser/msal-common";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * BrowserAuthErrorMessage class containing string constants used by error codes and messages.
 */
var BrowserAuthErrorMessage = {
  pkceNotGenerated: {
    code: "pkce_not_created",
    desc: "The PKCE code challenge and verifier could not be generated.",
  },
  cryptoDoesNotExist: {
    code: "crypto_nonexistent",
    desc: "The crypto object or function is not available.",
  },
  httpMethodNotImplementedError: {
    code: "http_method_not_implemented",
    desc: "The HTTP method given has not been implemented in this library.",
  },
  emptyNavigateUriError: {
    code: "empty_navigate_uri",
    desc: "Navigation URI is empty. Please check stack trace for more info.",
  },
  hashEmptyError: {
    code: "hash_empty_error",
    desc: "Hash value cannot be processed because it is empty. Please verify that your redirectUri is not clearing the hash.",
  },
  hashDoesNotContainStateError: {
    code: "no_state_in_hash",
    desc: "Hash does not contain state. Please verify that the request originated from msal.",
  },
  hashDoesNotContainKnownPropertiesError: {
    code: "hash_does_not_contain_known_properties",
    desc: "Hash does not contain known properites. Please verify that your redirectUri is not changing the hash.",
  },
  unableToParseStateError: {
    code: "unable_to_parse_state",
    desc: "Unable to parse state. Please verify that the request originated from msal.",
  },
  stateInteractionTypeMismatchError: {
    code: "state_interaction_type_mismatch",
    desc: "Hash contains state but the interaction type does not match the caller.",
  },
  interactionInProgress: {
    code: "interaction_in_progress",
    desc: "Interaction is currently in progress. Please ensure that this interaction has been completed before calling an interactive API.  For more visit: aka.ms/msaljs/browser-errors.",
  },
  popUpWindowError: {
    code: "popup_window_error",
    desc: "Error opening popup window. This can happen if you are using IE or if popups are blocked in the browser.",
  },
  emptyWindowError: {
    code: "empty_window_error",
    desc: "window.open returned null or undefined window object.",
  },
  userCancelledError: {
    code: "user_cancelled",
    desc: "User cancelled the flow.",
  },
  monitorPopupTimeoutError: {
    code: "monitor_window_timeout",
    desc: "Token acquisition in popup failed due to timeout. For more visit: aka.ms/msaljs/browser-errors.",
  },
  monitorIframeTimeoutError: {
    code: "monitor_window_timeout",
    desc: "Token acquisition in iframe failed due to timeout. For more visit: aka.ms/msaljs/browser-errors.",
  },
  redirectInIframeError: {
    code: "redirect_in_iframe",
    desc: "Code flow is not supported inside an iframe. Please ensure you are using MSAL.js in a top frame of the window if using the redirect APIs, or use the popup APIs.",
  },
  blockTokenRequestsInHiddenIframeError: {
    code: "block_iframe_reload",
    desc: "Request was blocked inside an iframe because MSAL detected an authentication response. For more visit: aka.ms/msaljs/browser-errors",
  },
  blockAcquireTokenInPopupsError: {
    code: "block_nested_popups",
    desc: "Request was blocked inside a popup because MSAL detected it was running in a popup.",
  },
  iframeClosedPrematurelyError: {
    code: "iframe_closed_prematurely",
    desc: "The iframe being monitored was closed prematurely.",
  },
  silentSSOInsufficientInfoError: {
    code: "silent_sso_error",
    desc: "Silent SSO could not be completed - insufficient information was provided. Please provide either a loginHint or sid.",
  },
  noAccountError: {
    code: "no_account_error",
    desc: "No account object provided to acquireTokenSilent and no active account has been set. Please call setActiveAccount or provide an account on the request.",
  },
  silentPromptValueError: {
    code: "silent_prompt_value_error",
    desc: "The value given for the prompt value is not valid for silent requests - must be set to 'none'.",
  },
  noTokenRequestCacheError: {
    code: "no_token_request_cache_error",
    desc: "No token request in found in cache.",
  },
  unableToParseTokenRequestCacheError: {
    code: "unable_to_parse_token_request_cache_error",
    desc: "The cached token request could not be parsed.",
  },
  noCachedAuthorityError: {
    code: "no_cached_authority_error",
    desc: "No cached authority found.",
  },
  authRequestNotSet: {
    code: "auth_request_not_set_error",
    desc: "Auth Request not set. Please ensure initiateAuthRequest was called from the InteractionHandler",
  },
  invalidCacheType: {
    code: "invalid_cache_type",
    desc: "Invalid cache type",
  },
  notInBrowserEnvironment: {
    code: "non_browser_environment",
    desc: "Login and token requests are not supported in non-browser environments.",
  },
  databaseNotOpen: {
    code: "database_not_open",
    desc: "Database is not open!",
  },
  noNetworkConnectivity: {
    code: "no_network_connectivity",
    desc: "No network connectivity. Check your internet connection.",
  },
  postRequestFailed: {
    code: "post_request_failed",
    desc: "Network request failed: If the browser threw a CORS error, check that the redirectUri is registered in the Azure App Portal as type 'SPA'",
  },
  getRequestFailed: {
    code: "get_request_failed",
    desc: "Network request failed. Please check the network trace to determine root cause.",
  },
  failedToParseNetworkResponse: {
    code: "failed_to_parse_response",
    desc: "Failed to parse network response. Check network trace.",
  },
};
/**
 * Browser library error class thrown by the MSAL.js library for SPAs
 */
var BrowserAuthError = /** @class */ (function (_super) {
  __extends(BrowserAuthError, _super);
  function BrowserAuthError(errorCode, errorMessage) {
    var _this = _super.call(this, errorCode, errorMessage) || this;
    Object.setPrototypeOf(_this, BrowserAuthError.prototype);
    _this.name = "BrowserAuthError";
    return _this;
  }
  /**
   * Creates an error thrown when PKCE is not implemented.
   * @param errDetail
   */
  BrowserAuthError.createPkceNotGeneratedError = function (errDetail) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.pkceNotGenerated.code,
      BrowserAuthErrorMessage.pkceNotGenerated.desc + " Detail:" + errDetail
    );
  };
  /**
   * Creates an error thrown when the crypto object is unavailable.
   * @param errDetail
   */
  BrowserAuthError.createCryptoNotAvailableError = function (errDetail) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.cryptoDoesNotExist.code,
      BrowserAuthErrorMessage.cryptoDoesNotExist.desc + " Detail:" + errDetail
    );
  };
  /**
   * Creates an error thrown when an HTTP method hasn't been implemented by the browser class.
   * @param method
   */
  BrowserAuthError.createHttpMethodNotImplementedError = function (method) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.httpMethodNotImplementedError.code,
      BrowserAuthErrorMessage.httpMethodNotImplementedError.desc +
        " Given Method: " +
        method
    );
  };
  /**
   * Creates an error thrown when the navigation URI is empty.
   */
  BrowserAuthError.createEmptyNavigationUriError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.emptyNavigateUriError.code,
      BrowserAuthErrorMessage.emptyNavigateUriError.desc
    );
  };
  /**
   * Creates an error thrown when the hash string value is unexpectedly empty.
   * @param hashValue
   */
  BrowserAuthError.createEmptyHashError = function (hashValue) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.hashEmptyError.code,
      BrowserAuthErrorMessage.hashEmptyError.desc + " Given Url: " + hashValue
    );
  };
  /**
   * Creates an error thrown when the hash string value is unexpectedly empty.
   */
  BrowserAuthError.createHashDoesNotContainStateError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.hashDoesNotContainStateError.code,
      BrowserAuthErrorMessage.hashDoesNotContainStateError.desc
    );
  };
  /**
   * Creates an error thrown when the hash string value does not contain known properties
   */
  BrowserAuthError.createHashDoesNotContainKnownPropertiesError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.hashDoesNotContainKnownPropertiesError.code,
      BrowserAuthErrorMessage.hashDoesNotContainKnownPropertiesError.desc
    );
  };
  /**
   * Creates an error thrown when the hash string value is unexpectedly empty.
   */
  BrowserAuthError.createUnableToParseStateError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.unableToParseStateError.code,
      BrowserAuthErrorMessage.unableToParseStateError.desc
    );
  };
  /**
   * Creates an error thrown when the state value in the hash does not match the interaction type of the API attempting to consume it.
   */
  BrowserAuthError.createStateInteractionTypeMismatchError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.stateInteractionTypeMismatchError.code,
      BrowserAuthErrorMessage.stateInteractionTypeMismatchError.desc
    );
  };
  /**
   * Creates an error thrown when a browser interaction (redirect or popup) is in progress.
   */
  BrowserAuthError.createInteractionInProgressError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.interactionInProgress.code,
      BrowserAuthErrorMessage.interactionInProgress.desc
    );
  };
  /**
   * Creates an error thrown when the popup window could not be opened.
   * @param errDetail
   */
  BrowserAuthError.createPopupWindowError = function (errDetail) {
    var errorMessage = BrowserAuthErrorMessage.popUpWindowError.desc;
    errorMessage = !StringUtils.isEmpty(errDetail)
      ? errorMessage + " Details: " + errDetail
      : errorMessage;
    return new BrowserAuthError(
      BrowserAuthErrorMessage.popUpWindowError.code,
      errorMessage
    );
  };
  /**
   * Creates an error thrown when window.open returns an empty window object.
   * @param errDetail
   */
  BrowserAuthError.createEmptyWindowCreatedError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.emptyWindowError.code,
      BrowserAuthErrorMessage.emptyWindowError.desc
    );
  };
  /**
   * Creates an error thrown when the user closes a popup.
   */
  BrowserAuthError.createUserCancelledError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.userCancelledError.code,
      BrowserAuthErrorMessage.userCancelledError.desc
    );
  };
  /**
   * Creates an error thrown when monitorPopupFromHash times out for a given popup.
   */
  BrowserAuthError.createMonitorPopupTimeoutError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.monitorPopupTimeoutError.code,
      BrowserAuthErrorMessage.monitorPopupTimeoutError.desc
    );
  };
  /**
   * Creates an error thrown when monitorIframeFromHash times out for a given iframe.
   */
  BrowserAuthError.createMonitorIframeTimeoutError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.monitorIframeTimeoutError.code,
      BrowserAuthErrorMessage.monitorIframeTimeoutError.desc
    );
  };
  /**
   * Creates an error thrown when navigateWindow is called inside an iframe.
   * @param windowParentCheck
   */
  BrowserAuthError.createRedirectInIframeError = function (windowParentCheck) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.redirectInIframeError.code,
      BrowserAuthErrorMessage.redirectInIframeError.desc +
        " (window.parent !== window) => " +
        windowParentCheck
    );
  };
  /**
   * Creates an error thrown when an auth reload is done inside an iframe.
   */
  BrowserAuthError.createBlockReloadInHiddenIframeError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.blockTokenRequestsInHiddenIframeError.code,
      BrowserAuthErrorMessage.blockTokenRequestsInHiddenIframeError.desc
    );
  };
  /**
   * Creates an error thrown when a popup attempts to call an acquireToken API
   * @returns
   */
  BrowserAuthError.createBlockAcquireTokenInPopupsError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.blockAcquireTokenInPopupsError.code,
      BrowserAuthErrorMessage.blockAcquireTokenInPopupsError.desc
    );
  };
  /**
   * Creates an error thrown when an iframe is found to be closed before the timeout is reached.
   */
  BrowserAuthError.createIframeClosedPrematurelyError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.iframeClosedPrematurelyError.code,
      BrowserAuthErrorMessage.iframeClosedPrematurelyError.desc
    );
  };
  /**
   * Creates an error thrown when the login_hint, sid or account object is not provided in the ssoSilent API.
   */
  BrowserAuthError.createSilentSSOInsufficientInfoError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.silentSSOInsufficientInfoError.code,
      BrowserAuthErrorMessage.silentSSOInsufficientInfoError.desc
    );
  };
  /**
   * Creates an error thrown when the account object is not provided in the acquireTokenSilent API.
   */
  BrowserAuthError.createNoAccountError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.noAccountError.code,
      BrowserAuthErrorMessage.noAccountError.desc
    );
  };
  /**
   * Creates an error thrown when a given prompt value is invalid for silent requests.
   */
  BrowserAuthError.createSilentPromptValueError = function (givenPrompt) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.silentPromptValueError.code,
      BrowserAuthErrorMessage.silentPromptValueError.desc +
        " Given value: " +
        givenPrompt
    );
  };
  /**
   * Creates an error thrown when the cached token request could not be retrieved from the cache
   */
  BrowserAuthError.createUnableToParseTokenRequestCacheError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.unableToParseTokenRequestCacheError.code,
      BrowserAuthErrorMessage.unableToParseTokenRequestCacheError.desc
    );
  };
  /**
   * Creates an error thrown when the token request could not be retrieved from the cache
   */
  BrowserAuthError.createNoTokenRequestCacheError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.noTokenRequestCacheError.code,
      BrowserAuthErrorMessage.noTokenRequestCacheError.desc
    );
  };
  /**
   * Creates an error thrown when handleCodeResponse is called before initiateAuthRequest (InteractionHandler)
   */
  BrowserAuthError.createAuthRequestNotSetError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.authRequestNotSet.code,
      BrowserAuthErrorMessage.authRequestNotSet.desc
    );
  };
  /**
   * Creates an error thrown when the authority could not be retrieved from the cache
   */
  BrowserAuthError.createNoCachedAuthorityError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.noCachedAuthorityError.code,
      BrowserAuthErrorMessage.noCachedAuthorityError.desc
    );
  };
  /**
   * Creates an error thrown if cache type is invalid.
   */
  BrowserAuthError.createInvalidCacheTypeError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.invalidCacheType.code,
      "" + BrowserAuthErrorMessage.invalidCacheType.desc
    );
  };
  /**
   * Create an error thrown when login and token requests are made from a non-browser environment
   */
  BrowserAuthError.createNonBrowserEnvironmentError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.notInBrowserEnvironment.code,
      BrowserAuthErrorMessage.notInBrowserEnvironment.desc
    );
  };
  /**
   * Create an error thrown when indexDB database is not open
   */
  BrowserAuthError.createDatabaseNotOpenError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.databaseNotOpen.code,
      BrowserAuthErrorMessage.databaseNotOpen.desc
    );
  };
  /**
   * Create an error thrown when token fetch fails due to no internet
   */
  BrowserAuthError.createNoNetworkConnectivityError = function () {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.noNetworkConnectivity.code,
      BrowserAuthErrorMessage.noNetworkConnectivity.desc
    );
  };
  /**
   * Create an error thrown when token fetch fails due to reasons other than internet connectivity
   */
  BrowserAuthError.createPostRequestFailedError = function (
    errorDesc,
    endpoint
  ) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.postRequestFailed.code,
      BrowserAuthErrorMessage.postRequestFailed.desc +
        " | Network client threw: " +
        errorDesc +
        " | Attempted to reach: " +
        endpoint.split("?")[0]
    );
  };
  /**
   * Create an error thrown when get request fails due to reasons other than internet connectivity
   */
  BrowserAuthError.createGetRequestFailedError = function (
    errorDesc,
    endpoint
  ) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.getRequestFailed.code,
      BrowserAuthErrorMessage.getRequestFailed.desc +
        " | Network client threw: " +
        errorDesc +
        " | Attempted to reach: " +
        endpoint.split("?")[0]
    );
  };
  /**
   * Create an error thrown when network client fails to parse network response
   */
  BrowserAuthError.createFailedToParseNetworkResponseError = function (
    endpoint
  ) {
    return new BrowserAuthError(
      BrowserAuthErrorMessage.failedToParseNetworkResponse.code,
      BrowserAuthErrorMessage.failedToParseNetworkResponse.desc +
        " | Attempted to reach: " +
        endpoint.split("?")[0]
    );
  };
  return BrowserAuthError;
})(AuthError);

export { BrowserAuthError, BrowserAuthErrorMessage };
//# sourceMappingURL=BrowserAuthError.js.map
