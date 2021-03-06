/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __extends, __awaiter, __generator } from "../_virtual/_tslib.js";
import {
  StringUtils,
  ThrottlingUtils,
  ClientAuthError,
} from "nnanh3-msal-browser/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import {
  TemporaryCacheKeys,
  BrowserConstants,
  ApiId,
} from "../utils/BrowserConstants.js";
import { InteractionHandler } from "./InteractionHandler.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var RedirectHandler = /** @class */ (function (_super) {
  __extends(RedirectHandler, _super);
  function RedirectHandler(
    authCodeModule,
    storageImpl,
    authCodeRequest,
    browserRequestLogger,
    browserCrypto
  ) {
    var _this =
      _super.call(
        this,
        authCodeModule,
        storageImpl,
        authCodeRequest,
        browserRequestLogger
      ) || this;
    _this.browserCrypto = browserCrypto;
    return _this;
  }
  /**
   * Redirects window to given URL.
   * @param urlNavigate
   */
  RedirectHandler.prototype.initiateAuthRequest = function (
    requestUrl,
    params
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var navigationOptions, navigate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.browserRequestLogger.verbose(
              "RedirectHandler.initiateAuthRequest called"
            );
            if (!!StringUtils.isEmpty(requestUrl)) return [3 /*break*/, 7];
            // Cache start page, returns to this page after redirectUri if navigateToLoginRequestUrl is true
            if (params.redirectStartPage) {
              this.browserRequestLogger.verbose(
                "RedirectHandler.initiateAuthRequest: redirectStartPage set, caching start page"
              );
              this.browserStorage.setTemporaryCache(
                TemporaryCacheKeys.ORIGIN_URI,
                params.redirectStartPage,
                true
              );
            }
            // Set interaction status in the library.
            this.browserStorage.setTemporaryCache(
              TemporaryCacheKeys.INTERACTION_STATUS_KEY,
              BrowserConstants.INTERACTION_IN_PROGRESS_VALUE,
              true
            );
            this.browserStorage.cacheCodeRequest(
              this.authCodeRequest,
              this.browserCrypto
            );
            this.browserRequestLogger.infoPii(
              "RedirectHandler.initiateAuthRequest: Navigate to: " + requestUrl
            );
            navigationOptions = {
              apiId: ApiId.acquireTokenRedirect,
              timeout: params.redirectTimeout,
              noHistory: false,
            };
            if (!(typeof params.onRedirectNavigate === "function"))
              return [3 /*break*/, 4];
            this.browserRequestLogger.verbose(
              "RedirectHandler.initiateAuthRequest: Invoking onRedirectNavigate callback"
            );
            navigate = params.onRedirectNavigate(requestUrl);
            if (!(navigate !== false)) return [3 /*break*/, 2];
            this.browserRequestLogger.verbose(
              "RedirectHandler.initiateAuthRequest: onRedirectNavigate did not return false, navigating"
            );
            return [
              4 /*yield*/,
              params.navigationClient.navigateExternal(
                requestUrl,
                navigationOptions
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
          case 2:
            this.browserRequestLogger.verbose(
              "RedirectHandler.initiateAuthRequest: onRedirectNavigate returned false, stopping navigation"
            );
            return [2 /*return*/];
          case 3:
            return [3 /*break*/, 6];
          case 4:
            // Navigate window to request URL
            this.browserRequestLogger.verbose(
              "RedirectHandler.initiateAuthRequest: Navigating window to navigate url"
            );
            return [
              4 /*yield*/,
              params.navigationClient.navigateExternal(
                requestUrl,
                navigationOptions
              ),
            ];
          case 5:
            _a.sent();
            return [2 /*return*/];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            // Throw error if request URL is empty.
            this.browserRequestLogger.info(
              "RedirectHandler.initiateAuthRequest: Navigate url is empty"
            );
            throw BrowserAuthError.createEmptyNavigationUriError();
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Handle authorization code response in the window.
   * @param hash
   */
  RedirectHandler.prototype.handleCodeResponse = function (
    locationHash,
    state,
    authority,
    networkModule,
    clientId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var stateKey,
        requestState,
        authCodeResponse,
        nonceKey,
        cachedNonce,
        cachedCcsCred,
        tokenResponse;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.browserRequestLogger.verbose(
              "RedirectHandler.handleCodeResponse called"
            );
            // Check that location hash isn't empty.
            if (StringUtils.isEmpty(locationHash)) {
              throw BrowserAuthError.createEmptyHashError(locationHash);
            }
            // Interaction is completed - remove interaction status.
            this.browserStorage.removeItem(
              this.browserStorage.generateCacheKey(
                TemporaryCacheKeys.INTERACTION_STATUS_KEY
              )
            );
            stateKey = this.browserStorage.generateStateKey(state);
            requestState = this.browserStorage.getTemporaryCache(stateKey);
            if (!requestState) {
              throw ClientAuthError.createStateNotFoundError("Cached State");
            }
            authCodeResponse = this.authModule.handleFragmentResponse(
              locationHash,
              requestState
            );
            nonceKey = this.browserStorage.generateNonceKey(requestState);
            cachedNonce = this.browserStorage.getTemporaryCache(nonceKey);
            // Assign code to request
            this.authCodeRequest.code = authCodeResponse.code;
            if (!authCodeResponse.cloud_instance_host_name)
              return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.updateTokenEndpointAuthority(
                authCodeResponse.cloud_instance_host_name,
                authority,
                networkModule
              ),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            authCodeResponse.nonce = cachedNonce || undefined;
            authCodeResponse.state = requestState;
            // Add CCS parameters if available
            if (authCodeResponse.client_info) {
              this.authCodeRequest.clientInfo = authCodeResponse.client_info;
            } else {
              cachedCcsCred = this.checkCcsCredentials();
              if (cachedCcsCred) {
                this.authCodeRequest.ccsCredential = cachedCcsCred;
              }
            }
            // Remove throttle if it exists
            if (clientId) {
              ThrottlingUtils.removeThrottle(
                this.browserStorage,
                clientId,
                this.authCodeRequest.authority,
                this.authCodeRequest.scopes
              );
            }
            return [
              4 /*yield*/,
              this.authModule.acquireToken(
                this.authCodeRequest,
                authCodeResponse
              ),
            ];
          case 3:
            tokenResponse = _a.sent();
            this.browserStorage.cleanRequestByState(state);
            return [2 /*return*/, tokenResponse];
        }
      });
    });
  };
  return RedirectHandler;
})(InteractionHandler);

export { RedirectHandler };
//# sourceMappingURL=RedirectHandler.js.map
