/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __awaiter, __generator } from "../_virtual/_tslib.js";
import {
  StringUtils,
  ClientAuthError,
  AuthorityFactory,
} from "nnanh3-msal-browser/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import { TemporaryCacheKeys } from "../utils/BrowserConstants.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * Abstract class which defines operations for a browser interaction handling class.
 */
var InteractionHandler = /** @class */ (function () {
  function InteractionHandler(
    authCodeModule,
    storageImpl,
    authCodeRequest,
    browserRequestLogger
  ) {
    this.authModule = authCodeModule;
    this.browserStorage = storageImpl;
    this.authCodeRequest = authCodeRequest;
    this.browserRequestLogger = browserRequestLogger;
  }
  /**
   * Function to handle response parameters from hash.
   * @param locationHash
   */
  InteractionHandler.prototype.handleCodeResponse = function (
    locationHash,
    state,
    authority,
    networkModule
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
              "InteractionHandler.handleCodeResponse called"
            );
            // Check that location hash isn't empty.
            if (StringUtils.isEmpty(locationHash)) {
              throw BrowserAuthError.createEmptyHashError(locationHash);
            }
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
  /**
   * Updates authority based on cloudInstanceHostname
   * @param cloudInstanceHostname
   * @param authority
   * @param networkModule
   */
  InteractionHandler.prototype.updateTokenEndpointAuthority = function (
    cloudInstanceHostname,
    authority,
    networkModule
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var cloudInstanceAuthorityUri, cloudInstanceAuthority;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cloudInstanceAuthorityUri =
              "https://" + cloudInstanceHostname + "/" + authority.tenant + "/";
            return [
              4 /*yield*/,
              AuthorityFactory.createDiscoveredInstance(
                cloudInstanceAuthorityUri,
                networkModule,
                this.browserStorage,
                authority.options
              ),
            ];
          case 1:
            cloudInstanceAuthority = _a.sent();
            this.authModule.updateAuthority(cloudInstanceAuthority);
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Looks up ccs creds in the cache
   */
  InteractionHandler.prototype.checkCcsCredentials = function () {
    // Look up ccs credential in temp cache
    var cachedCcsCred = this.browserStorage.getTemporaryCache(
      TemporaryCacheKeys.CCS_CREDENTIAL,
      true
    );
    if (cachedCcsCred) {
      try {
        return JSON.parse(cachedCcsCred);
      } catch (e) {
        this.authModule.logger.error("Cache credential could not be parsed");
        this.authModule.logger.errorPii(
          "Cache credential could not be parsed: " + cachedCcsCred
        );
      }
    }
    return null;
  };
  return InteractionHandler;
})();

export { InteractionHandler };
//# sourceMappingURL=InteractionHandler.js.map
