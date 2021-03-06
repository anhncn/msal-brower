/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __extends } from "../_virtual/_tslib.js";
import { AuthError } from "nnanh3-msal-browser/msal-common";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * BrowserAuthErrorMessage class containing string constants used by error codes and messages.
 */
var BrowserConfigurationAuthErrorMessage = {
  redirectUriNotSet: {
    code: "redirect_uri_empty",
    desc: "A redirect URI is required for all calls, and none has been set.",
  },
  postLogoutUriNotSet: {
    code: "post_logout_uri_empty",
    desc: "A post logout redirect has not been set.",
  },
  storageNotSupportedError: {
    code: "storage_not_supported",
    desc: "Given storage configuration option was not supported.",
  },
  noRedirectCallbacksSet: {
    code: "no_redirect_callbacks",
    desc:
      "No redirect callbacks have been set. Please call setRedirectCallbacks() with the appropriate function arguments before continuing. " +
      "More information is available here: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics.",
  },
  invalidCallbackObject: {
    code: "invalid_callback_object",
    desc:
      "The object passed for the callback was invalid. " +
      "More information is available here: https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL-basics.",
  },
  stubPcaInstanceCalled: {
    code: "stubbed_public_client_application_called",
    desc: "Stub instance of Public Client Application was called. If using msal-react, please ensure context is not used without a provider. For more visit: aka.ms/msaljs/browser-errors",
  },
  inMemRedirectUnavailable: {
    code: "in_mem_redirect_unavailable",
    desc: "Redirect cannot be supported. In-memory storage was selected and storeAuthStateInCookie=false, which would cause the library to be unable to handle the incoming hash. If you would like to use the redirect API, please use session/localStorage or set storeAuthStateInCookie=true.",
  },
};
/**
 * Browser library error class thrown by the MSAL.js library for SPAs
 */
var BrowserConfigurationAuthError = /** @class */ (function (_super) {
  __extends(BrowserConfigurationAuthError, _super);
  function BrowserConfigurationAuthError(errorCode, errorMessage) {
    var _this = _super.call(this, errorCode, errorMessage) || this;
    _this.name = "BrowserConfigurationAuthError";
    Object.setPrototypeOf(_this, BrowserConfigurationAuthError.prototype);
    return _this;
  }
  /**
   * Creates an error thrown when the redirect uri is empty (not set by caller)
   */
  BrowserConfigurationAuthError.createRedirectUriEmptyError = function () {
    return new BrowserConfigurationAuthError(
      BrowserConfigurationAuthErrorMessage.redirectUriNotSet.code,
      BrowserConfigurationAuthErrorMessage.redirectUriNotSet.desc
    );
  };
  /**
   * Creates an error thrown when the post-logout redirect uri is empty (not set by caller)
   */
  BrowserConfigurationAuthError.createPostLogoutRedirectUriEmptyError =
    function () {
      return new BrowserConfigurationAuthError(
        BrowserConfigurationAuthErrorMessage.postLogoutUriNotSet.code,
        BrowserConfigurationAuthErrorMessage.postLogoutUriNotSet.desc
      );
    };
  /**
   * Creates error thrown when given storage location is not supported.
   * @param givenStorageLocation
   */
  BrowserConfigurationAuthError.createStorageNotSupportedError = function (
    givenStorageLocation
  ) {
    return new BrowserConfigurationAuthError(
      BrowserConfigurationAuthErrorMessage.storageNotSupportedError.code,
      BrowserConfigurationAuthErrorMessage.storageNotSupportedError.desc +
        " Given Location: " +
        givenStorageLocation
    );
  };
  /**
   * Creates error thrown when redirect callbacks are not set before calling loginRedirect() or acquireTokenRedirect().
   */
  BrowserConfigurationAuthError.createRedirectCallbacksNotSetError =
    function () {
      return new BrowserConfigurationAuthError(
        BrowserConfigurationAuthErrorMessage.noRedirectCallbacksSet.code,
        BrowserConfigurationAuthErrorMessage.noRedirectCallbacksSet.desc
      );
    };
  /**
   * Creates error thrown when the stub instance of PublicClientApplication is called.
   */
  BrowserConfigurationAuthError.createStubPcaInstanceCalledError = function () {
    return new BrowserConfigurationAuthError(
      BrowserConfigurationAuthErrorMessage.stubPcaInstanceCalled.code,
      BrowserConfigurationAuthErrorMessage.stubPcaInstanceCalled.desc
    );
  };
  /*
   * Create an error thrown when in-memory storage is used and storeAuthStateInCookie=false.
   */
  BrowserConfigurationAuthError.createInMemoryRedirectUnavailableError =
    function () {
      return new BrowserConfigurationAuthError(
        BrowserConfigurationAuthErrorMessage.inMemRedirectUnavailable.code,
        BrowserConfigurationAuthErrorMessage.inMemRedirectUnavailable.desc
      );
    };
  return BrowserConfigurationAuthError;
})(AuthError);

export { BrowserConfigurationAuthError, BrowserConfigurationAuthErrorMessage };
//# sourceMappingURL=BrowserConfigurationAuthError.js.map
