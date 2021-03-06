/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import {
  __awaiter,
  __generator,
  __assign,
  __spread,
} from "../_virtual/_tslib.js";
import { CryptoOps } from "../crypto/CryptoOps.js";
import {
  UrlString,
  ThrottlingUtils,
  StringUtils,
  PromptValue,
  AccountEntity,
  AuthorityFactory,
  AuthorizationCodeClient,
  SilentFlowClient,
  RefreshTokenClient,
  AuthenticationScheme,
  ServerTelemetryManager,
  ProtocolUtils,
  ResponseMode,
  PersistentCacheKeys,
  IdToken,
  Constants,
  Logger,
  DEFAULT_CRYPTO_IMPLEMENTATION,
  ServerError,
  InteractionRequiredAuthError,
} from "nnanh3-msal-browser/msal-common";
import {
  BrowserCacheManager,
  DEFAULT_BROWSER_CACHE_MANAGER,
} from "../cache/BrowserCacheManager.js";
import { buildConfiguration } from "../config/Configuration.js";
import {
  InteractionType,
  TemporaryCacheKeys,
  ApiId,
  BrowserConstants,
  BrowserCacheLocation,
} from "../utils/BrowserConstants.js";
import { BrowserUtils } from "../utils/BrowserUtils.js";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils.js";
import { RedirectHandler } from "../interaction_handler/RedirectHandler.js";
import { PopupHandler } from "../interaction_handler/PopupHandler.js";
import { SilentHandler } from "../interaction_handler/SilentHandler.js";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import { name, version } from "../packageMetadata.js";
import { EventType } from "../event/EventType.js";
import { BrowserConfigurationAuthError } from "../error/BrowserConfigurationAuthError.js";
import { PopupUtils } from "../utils/PopupUtils.js";
import { EventHandler } from "../event/EventHandler.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var ClientApplication = /** @class */ (function () {
  /**
   * @constructor
   * Constructor for the PublicClientApplication used to instantiate the PublicClientApplication object
   *
   * Important attributes in the Configuration object for auth are:
   * - clientID: the application ID of your application. You can obtain one by registering your application with our Application registration portal : https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredAppsPreview
   * - authority: the authority URL for your application.
   * - redirect_uri: the uri of your application registered in the portal.
   *
   * In Azure AD, authority is a URL indicating the Azure active directory that MSAL uses to obtain tokens.
   * It is of the form https://login.microsoftonline.com/{Enter_the_Tenant_Info_Here}
   * If your application supports Accounts in one organizational directory, replace "Enter_the_Tenant_Info_Here" value with the Tenant Id or Tenant name (for example, contoso.microsoft.com).
   * If your application supports Accounts in any organizational directory, replace "Enter_the_Tenant_Info_Here" value with organizations.
   * If your application supports Accounts in any organizational directory and personal Microsoft accounts, replace "Enter_the_Tenant_Info_Here" value with common.
   * To restrict support to Personal Microsoft accounts only, replace "Enter_the_Tenant_Info_Here" value with consumers.
   *
   * In Azure B2C, authority is of the form https://{instance}/tfp/{tenant}/{policyName}/
   * Full B2C functionality will be available in this library in future versions.
   *
   * @param configuration Object for the MSAL PublicClientApplication instance
   */
  function ClientApplication(configuration) {
    /*
     * If loaded in an environment where window is not available,
     * set internal flag to false so that further requests fail.
     * This is to support server-side rendering environments.
     */
    this.isBrowserEnvironment = typeof window !== "undefined";
    // Set the configuration.
    this.config = buildConfiguration(configuration, this.isBrowserEnvironment);
    // Initialize logger
    this.logger = new Logger(this.config.system.loggerOptions, name, version);
    // Initialize the network module class.
    this.networkClient = this.config.system.networkClient;
    // Initialize the navigation client class.
    this.navigationClient = this.config.system.navigationClient;
    // Initialize redirectResponse Map
    this.redirectResponse = new Map();
    // Initialize the crypto class.
    this.browserCrypto = this.isBrowserEnvironment
      ? new CryptoOps()
      : DEFAULT_CRYPTO_IMPLEMENTATION;
    this.eventHandler = new EventHandler(this.logger, this.browserCrypto);
    // Initialize the browser storage class.
    this.browserStorage = this.isBrowserEnvironment
      ? new BrowserCacheManager(
          this.config.auth.clientId,
          this.config.cache,
          this.browserCrypto,
          this.logger
        )
      : DEFAULT_BROWSER_CACHE_MANAGER(this.config.auth.clientId, this.logger);
  }
  // #region Redirect Flow
  /**
   * Event handler function which allows users to fire events after the PublicClientApplication object
   * has loaded during redirect flows. This should be invoked on all page loads involved in redirect
   * auth flows.
   * @param hash Hash to process. Defaults to the current value of window.location.hash. Only needs to be provided explicitly if the response to be handled is not contained in the current value.
   * @returns Token response or null. If the return value is null, then no auth redirect was detected.
   */
  ClientApplication.prototype.handleRedirectPromise = function (hash) {
    return __awaiter(this, void 0, void 0, function () {
      var loggedInAccounts, redirectResponseKey, response;
      var _this = this;
      return __generator(this, function (_a) {
        this.eventHandler.emitEvent(
          EventType.HANDLE_REDIRECT_START,
          InteractionType.Redirect
        );
        this.logger.verbose("handleRedirectPromise called");
        loggedInAccounts = this.getAllAccounts();
        if (this.isBrowserEnvironment) {
          redirectResponseKey = hash || Constants.EMPTY_STRING;
          response = this.redirectResponse.get(redirectResponseKey);
          if (typeof response === "undefined") {
            this.logger.verbose(
              "handleRedirectPromise has been called for the first time, storing the promise"
            );
            response = this.handleRedirectResponse(hash)
              .then(function (result) {
                if (result) {
                  // Emit login event if number of accounts change
                  var isLoggingIn =
                    loggedInAccounts.length < _this.getAllAccounts().length;
                  if (isLoggingIn) {
                    _this.eventHandler.emitEvent(
                      EventType.LOGIN_SUCCESS,
                      InteractionType.Redirect,
                      result
                    );
                    _this.logger.verbose(
                      "handleRedirectResponse returned result, login success"
                    );
                  } else {
                    _this.eventHandler.emitEvent(
                      EventType.ACQUIRE_TOKEN_SUCCESS,
                      InteractionType.Redirect,
                      result
                    );
                    _this.logger.verbose(
                      "handleRedirectResponse returned result, acquire token success"
                    );
                  }
                }
                _this.eventHandler.emitEvent(
                  EventType.HANDLE_REDIRECT_END,
                  InteractionType.Redirect
                );
                return result;
              })
              .catch(function (e) {
                // Emit login event if there is an account
                if (loggedInAccounts.length > 0) {
                  _this.eventHandler.emitEvent(
                    EventType.ACQUIRE_TOKEN_FAILURE,
                    InteractionType.Redirect,
                    null,
                    e
                  );
                } else {
                  _this.eventHandler.emitEvent(
                    EventType.LOGIN_FAILURE,
                    InteractionType.Redirect,
                    null,
                    e
                  );
                }
                _this.eventHandler.emitEvent(
                  EventType.HANDLE_REDIRECT_END,
                  InteractionType.Redirect
                );
                throw e;
              });
            this.redirectResponse.set(redirectResponseKey, response);
          } else {
            this.logger.verbose(
              "handleRedirectPromise has been called previously, returning the result from the first call"
            );
          }
          return [2 /*return*/, response];
        }
        this.logger.verbose(
          "handleRedirectPromise returns null, not browser environment"
        );
        return [2 /*return*/, null];
      });
    });
  };
  /**
   * Checks if navigateToLoginRequestUrl is set, and:
   * - if true, performs logic to cache and navigate
   * - if false, handles hash string and parses response
   * @param hash
   */
  ClientApplication.prototype.handleRedirectResponse = function (hash) {
    return __awaiter(this, void 0, void 0, function () {
      var responseHash,
        state,
        loginRequestUrl,
        loginRequestUrlNormalized,
        currentUrlNormalized,
        handleHashResult,
        navigationOptions,
        processHashOnRedirect,
        homepage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.interactionInProgress()) {
              this.logger.info(
                "handleRedirectPromise called but there is no interaction in progress, returning null."
              );
              return [2 /*return*/, null];
            }
            responseHash = this.getRedirectResponseHash(
              hash || window.location.hash
            );
            if (!responseHash) {
              // Not a recognized server response hash or hash not associated with a redirect request
              this.logger.info(
                "handleRedirectPromise did not detect a response hash as a result of a redirect. Cleaning temporary cache."
              );
              this.browserStorage.cleanRequestByInteractionType(
                InteractionType.Redirect
              );
              return [2 /*return*/, null];
            }
            try {
              state = this.validateAndExtractStateFromHash(
                responseHash,
                InteractionType.Redirect
              );
              BrowserUtils.clearHash(window);
              this.logger.verbose("State extracted from hash");
            } catch (e) {
              this.logger.info(
                "handleRedirectPromise was unable to extract state due to: " + e
              );
              this.browserStorage.cleanRequestByInteractionType(
                InteractionType.Redirect
              );
              return [2 /*return*/, null];
            }
            loginRequestUrl =
              this.browserStorage.getTemporaryCache(
                TemporaryCacheKeys.ORIGIN_URI,
                true
              ) || "";
            loginRequestUrlNormalized =
              UrlString.removeHashFromUrl(loginRequestUrl);
            currentUrlNormalized = UrlString.removeHashFromUrl(
              window.location.href
            );
            if (
              !(
                loginRequestUrlNormalized === currentUrlNormalized &&
                this.config.auth.navigateToLoginRequestUrl
              )
            )
              return [3 /*break*/, 2];
            // We are on the page we need to navigate to - handle hash
            this.logger.verbose(
              "Current page is loginRequestUrl, handling hash"
            );
            return [4 /*yield*/, this.handleHash(responseHash, state)];
          case 1:
            handleHashResult = _a.sent();
            if (loginRequestUrl.indexOf("#") > -1) {
              // Replace current hash with non-msal hash, if present
              BrowserUtils.replaceHash(loginRequestUrl);
            }
            return [2 /*return*/, handleHashResult];
          case 2:
            if (!!this.config.auth.navigateToLoginRequestUrl)
              return [3 /*break*/, 3];
            this.logger.verbose(
              "NavigateToLoginRequestUrl set to false, handling hash"
            );
            return [2 /*return*/, this.handleHash(responseHash, state)];
          case 3:
            if (!!BrowserUtils.isInIframe()) return [3 /*break*/, 8];
            /*
             * Returned from authority using redirect - need to perform navigation before processing response
             * Cache the hash to be retrieved after the next redirect
             */
            this.browserStorage.setTemporaryCache(
              TemporaryCacheKeys.URL_HASH,
              responseHash,
              true
            );
            navigationOptions = {
              apiId: ApiId.handleRedirectPromise,
              timeout: this.config.system.redirectNavigationTimeout,
              noHistory: true,
            };
            processHashOnRedirect = true;
            if (!(!loginRequestUrl || loginRequestUrl === "null"))
              return [3 /*break*/, 5];
            homepage = BrowserUtils.getHomepage();
            // Cache the homepage under ORIGIN_URI to ensure cached hash is processed on homepage
            this.browserStorage.setTemporaryCache(
              TemporaryCacheKeys.ORIGIN_URI,
              homepage,
              true
            );
            this.logger.warning(
              "Unable to get valid login request url from cache, redirecting to home page"
            );
            return [
              4 /*yield*/,
              this.navigationClient.navigateInternal(
                homepage,
                navigationOptions
              ),
            ];
          case 4:
            processHashOnRedirect = _a.sent();
            return [3 /*break*/, 7];
          case 5:
            // Navigate to page that initiated the redirect request
            this.logger.verbose(
              "Navigating to loginRequestUrl: " + loginRequestUrl
            );
            return [
              4 /*yield*/,
              this.navigationClient.navigateInternal(
                loginRequestUrl,
                navigationOptions
              ),
            ];
          case 6:
            processHashOnRedirect = _a.sent();
            _a.label = 7;
          case 7:
            // If navigateInternal implementation returns false, handle the hash now
            if (!processHashOnRedirect) {
              return [2 /*return*/, this.handleHash(responseHash, state)];
            }
            _a.label = 8;
          case 8:
            return [2 /*return*/, null];
        }
      });
    });
  };
  /**
   * Gets the response hash for a redirect request
   * Returns null if interactionType in the state value is not "redirect" or the hash does not contain known properties
   * @param hash
   */
  ClientApplication.prototype.getRedirectResponseHash = function (hash) {
    this.logger.verbose("getRedirectResponseHash called");
    // Get current location hash from window or cache.
    var isResponseHash = UrlString.hashContainsKnownProperties(hash);
    var cachedHash = this.browserStorage.getTemporaryCache(
      TemporaryCacheKeys.URL_HASH,
      true
    );
    this.browserStorage.removeItem(
      this.browserStorage.generateCacheKey(TemporaryCacheKeys.URL_HASH)
    );
    if (isResponseHash) {
      this.logger.verbose(
        "Hash contains known properties, returning response hash"
      );
      return hash;
    }
    this.logger.verbose(
      "Hash does not contain known properties, returning cached hash"
    );
    return cachedHash;
  };
  /**
   * @param hash
   * @param interactionType
   */
  ClientApplication.prototype.validateAndExtractStateFromHash = function (
    hash,
    interactionType,
    requestCorrelationId
  ) {
    this.logger.verbose(
      "validateAndExtractStateFromHash called",
      requestCorrelationId
    );
    // Deserialize hash fragment response parameters.
    var serverParams = UrlString.getDeserializedHash(hash);
    if (!serverParams.state) {
      throw BrowserAuthError.createHashDoesNotContainStateError();
    }
    var platformStateObj = BrowserProtocolUtils.extractBrowserRequestState(
      this.browserCrypto,
      serverParams.state
    );
    if (!platformStateObj) {
      throw BrowserAuthError.createUnableToParseStateError();
    }
    if (platformStateObj.interactionType !== interactionType) {
      throw BrowserAuthError.createStateInteractionTypeMismatchError();
    }
    this.logger.verbose("Returning state from hash", requestCorrelationId);
    return serverParams.state;
  };
  /**
   * Checks if hash exists and handles in window.
   * @param hash
   * @param state
   */
  ClientApplication.prototype.handleHash = function (hash, state) {
    return __awaiter(this, void 0, void 0, function () {
      var cachedRequest,
        browserRequestLogger,
        serverTelemetryManager,
        currentAuthority,
        authClient,
        interactionHandler,
        e_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cachedRequest = this.browserStorage.getCachedRequest(
              state,
              this.browserCrypto
            );
            browserRequestLogger = this.logger.clone(
              name,
              version,
              cachedRequest.correlationId
            );
            browserRequestLogger.verbose(
              "handleHash called, retrieved cached request"
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.handleRedirectPromise,
              cachedRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            currentAuthority = this.browserStorage.getCachedAuthority(state);
            if (!currentAuthority) {
              throw BrowserAuthError.createNoCachedAuthorityError();
            }
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                currentAuthority,
                cachedRequest.correlationId
              ),
            ];
          case 2:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            interactionHandler = new RedirectHandler(
              authClient,
              this.browserStorage,
              cachedRequest,
              browserRequestLogger,
              this.browserCrypto
            );
            return [
              4 /*yield*/,
              interactionHandler.handleCodeResponse(
                hash,
                state,
                authClient.authority,
                this.networkClient,
                this.config.auth.clientId
              ),
            ];
          case 3:
            return [2 /*return*/, _a.sent()];
          case 4:
            e_1 = _a.sent();
            serverTelemetryManager.cacheFailedRequest(e_1);
            this.browserStorage.cleanRequestByInteractionType(
              InteractionType.Redirect
            );
            throw e_1;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Use when you want to obtain an access_token for your API by redirecting the user's browser window to the authorization endpoint. This function redirects
   * the page, so any code that follows this function will not execute.
   *
   * IMPORTANT: It is NOT recommended to have code that is dependent on the resolution of the Promise. This function will navigate away from the current
   * browser window. It currently returns a Promise in order to reflect the asynchronous nature of the code running in this function.
   *
   * @param request
   */
  ClientApplication.prototype.acquireTokenRedirect = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var isLoggedIn,
        validRequest,
        browserRequestLogger,
        serverTelemetryManager,
        authCodeRequest,
        authClient,
        interactionHandler,
        navigateUrl,
        redirectStartPage,
        e_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Preflight request
            this.preflightBrowserEnvironmentCheck(InteractionType.Redirect);
            this.logger.verbose("acquireTokenRedirect called");
            isLoggedIn = this.getAllAccounts().length > 0;
            if (isLoggedIn) {
              this.eventHandler.emitEvent(
                EventType.ACQUIRE_TOKEN_START,
                InteractionType.Redirect,
                request
              );
            } else {
              this.eventHandler.emitEvent(
                EventType.LOGIN_START,
                InteractionType.Redirect,
                request
              );
            }
            validRequest = this.preflightInteractiveRequest(
              request,
              InteractionType.Redirect
            );
            browserRequestLogger = this.logger.clone(
              name,
              version,
              validRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.acquireTokenRedirect,
              validRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.initializeAuthorizationCodeRequest(validRequest),
            ];
          case 2:
            authCodeRequest = _a.sent();
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                validRequest.authority,
                validRequest.correlationId
              ),
            ];
          case 3:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            interactionHandler = new RedirectHandler(
              authClient,
              this.browserStorage,
              authCodeRequest,
              browserRequestLogger,
              this.browserCrypto
            );
            return [4 /*yield*/, authClient.getAuthCodeUrl(validRequest)];
          case 4:
            navigateUrl = _a.sent();
            redirectStartPage = this.getRedirectStartPage(
              request.redirectStartPage
            );
            browserRequestLogger.verbosePii(
              "Redirect start page: " + redirectStartPage
            );
            // Show the UI once the url has been created. Response will come back in the hash, which will be handled in the handleRedirectCallback function.
            return [
              2 /*return*/,
              interactionHandler.initiateAuthRequest(navigateUrl, {
                navigationClient: this.navigationClient,
                redirectTimeout: this.config.system.redirectNavigationTimeout,
                redirectStartPage: redirectStartPage,
                onRedirectNavigate: request.onRedirectNavigate,
              }),
            ];
          case 5:
            e_2 = _a.sent();
            // If logged in, emit acquire token events
            if (isLoggedIn) {
              this.eventHandler.emitEvent(
                EventType.ACQUIRE_TOKEN_FAILURE,
                InteractionType.Redirect,
                null,
                e_2
              );
            } else {
              this.eventHandler.emitEvent(
                EventType.LOGIN_FAILURE,
                InteractionType.Redirect,
                null,
                e_2
              );
            }
            serverTelemetryManager.cacheFailedRequest(e_2);
            this.browserStorage.cleanRequestByState(validRequest.state);
            throw e_2;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // #endregion
  // #region Popup Flow
  /**
   * Use when you want to obtain an access_token for your API via opening a popup window in the user's browser
   *
   * @param request
   *
   * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
   */
  ClientApplication.prototype.acquireTokenPopup = function (request) {
    var validRequest;
    try {
      this.preflightBrowserEnvironmentCheck(InteractionType.Popup);
      this.logger.verbose("acquireTokenPopup called", request.correlationId);
      validRequest = this.preflightInteractiveRequest(
        request,
        InteractionType.Popup
      );
    } catch (e) {
      // Since this function is syncronous we need to reject
      return Promise.reject(e);
    }
    var popupName = PopupUtils.generatePopupName(
      this.config.auth.clientId,
      validRequest
    );
    // asyncPopups flag is true. Acquires token without first opening popup. Popup will be opened later asynchronously.
    if (this.config.system.asyncPopups) {
      this.logger.verbose(
        "asyncPopups set to true, acquiring token",
        validRequest.correlationId
      );
      return this.acquireTokenPopupAsync(validRequest, popupName);
    } else {
      // asyncPopups flag is set to false. Opens popup before acquiring token.
      this.logger.verbose(
        "asyncPopup set to false, opening popup before acquiring token",
        validRequest.correlationId
      );
      var popup = PopupUtils.openSizedPopup("about:blank", popupName);
      return this.acquireTokenPopupAsync(validRequest, popupName, popup);
    }
  };
  /**
   * Helper which obtains an access_token for your API via opening a popup window in the user's browser
   * @param validRequest
   * @param popupName
   * @param popup
   *
   * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
   */
  ClientApplication.prototype.acquireTokenPopupAsync = function (
    validRequest,
    popupName,
    popup
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var loggedInAccounts,
        browserRequestLogger,
        serverTelemetryManager,
        authCodeRequest,
        authClient,
        navigateUrl,
        interactionHandler,
        popupParameters,
        popupWindow,
        hash,
        state,
        result,
        isLoggingIn,
        e_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "acquireTokenPopupAsync called",
              validRequest.correlationId
            );
            loggedInAccounts = this.getAllAccounts();
            if (loggedInAccounts.length > 0) {
              this.eventHandler.emitEvent(
                EventType.ACQUIRE_TOKEN_START,
                InteractionType.Popup,
                validRequest
              );
            } else {
              this.eventHandler.emitEvent(
                EventType.LOGIN_START,
                InteractionType.Popup,
                validRequest
              );
            }
            browserRequestLogger = this.logger.clone(
              name,
              version,
              validRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.acquireTokenPopup,
              validRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            return [
              4 /*yield*/,
              this.initializeAuthorizationCodeRequest(validRequest),
            ];
          case 2:
            authCodeRequest = _a.sent();
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                validRequest.authority,
                validRequest.correlationId
              ),
            ];
          case 3:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            return [4 /*yield*/, authClient.getAuthCodeUrl(validRequest)];
          case 4:
            navigateUrl = _a.sent();
            interactionHandler = new PopupHandler(
              authClient,
              this.browserStorage,
              authCodeRequest,
              browserRequestLogger
            );
            popupParameters = {
              popup: popup,
              popupName: popupName,
            };
            popupWindow = interactionHandler.initiateAuthRequest(
              navigateUrl,
              popupParameters
            );
            this.eventHandler.emitEvent(
              EventType.POPUP_OPENED,
              InteractionType.Popup,
              { popupWindow: popupWindow },
              null
            );
            return [
              4 /*yield*/,
              interactionHandler.monitorPopupForHash(popupWindow),
            ];
          case 5:
            hash = _a.sent();
            state = this.validateAndExtractStateFromHash(
              hash,
              InteractionType.Popup,
              validRequest.correlationId
            );
            // Remove throttle if it exists
            ThrottlingUtils.removeThrottle(
              this.browserStorage,
              this.config.auth.clientId,
              authCodeRequest.authority,
              authCodeRequest.scopes
            );
            return [
              4 /*yield*/,
              interactionHandler.handleCodeResponse(
                hash,
                state,
                authClient.authority,
                this.networkClient
              ),
            ];
          case 6:
            result = _a.sent();
            isLoggingIn =
              loggedInAccounts.length < this.getAllAccounts().length;
            if (isLoggingIn) {
              this.eventHandler.emitEvent(
                EventType.LOGIN_SUCCESS,
                InteractionType.Popup,
                result
              );
            } else {
              this.eventHandler.emitEvent(
                EventType.ACQUIRE_TOKEN_SUCCESS,
                InteractionType.Popup,
                result
              );
            }
            return [2 /*return*/, result];
          case 7:
            e_3 = _a.sent();
            if (loggedInAccounts.length > 0) {
              this.eventHandler.emitEvent(
                EventType.ACQUIRE_TOKEN_FAILURE,
                InteractionType.Popup,
                null,
                e_3
              );
            } else {
              this.eventHandler.emitEvent(
                EventType.LOGIN_FAILURE,
                InteractionType.Popup,
                null,
                e_3
              );
            }
            if (popup) {
              // Close the synchronous popup if an error is thrown before the window unload event is registered
              popup.close();
            }
            serverTelemetryManager.cacheFailedRequest(e_3);
            this.browserStorage.cleanRequestByState(validRequest.state);
            throw e_3;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  // #endregion
  // #region Silent Flow
  /**
   * This function uses a hidden iframe to fetch an authorization code from the eSTS. There are cases where this may not work:
   * - Any browser using a form of Intelligent Tracking Prevention
   * - If there is not an established session with the service
   *
   * In these cases, the request must be done inside a popup or full frame redirect.
   *
   * For the cases where interaction is required, you cannot send a request with prompt=none.
   *
   * If your refresh token has expired, you can use this function to fetch a new set of tokens silently as long as
   * you session on the server still exists.
   * @param request {@link SsoSilentRequest}
   *
   * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
   */
  ClientApplication.prototype.ssoSilent = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var silentTokenResult, e_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.preflightBrowserEnvironmentCheck(InteractionType.Silent);
            this.logger.verbose("ssoSilent called", request.correlationId);
            this.eventHandler.emitEvent(
              EventType.SSO_SILENT_START,
              InteractionType.Silent,
              request
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.acquireTokenByIframe(request, ApiId.ssoSilent),
            ];
          case 2:
            silentTokenResult = _a.sent();
            this.eventHandler.emitEvent(
              EventType.SSO_SILENT_SUCCESS,
              InteractionType.Silent,
              silentTokenResult
            );
            return [2 /*return*/, silentTokenResult];
          case 3:
            e_4 = _a.sent();
            this.eventHandler.emitEvent(
              EventType.SSO_SILENT_FAILURE,
              InteractionType.Silent,
              null,
              e_4
            );
            throw e_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * This function uses a hidden iframe to fetch an authorization code from the eSTS. To be used for silent refresh token acquisition and renewal.
   * @param request
   * @param apiId - ApiId of the calling function. Used for telemetry.
   */
  ClientApplication.prototype.acquireTokenByIframe = function (request, apiId) {
    return __awaiter(this, void 0, void 0, function () {
      var silentRequest,
        browserRequestLogger,
        serverTelemetryManager,
        authCodeRequest,
        authClient,
        navigateUrl,
        e_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "acquireTokenByIframe called",
              request.correlationId
            );
            // Check that we have some SSO data
            if (
              StringUtils.isEmpty(request.loginHint) &&
              StringUtils.isEmpty(request.sid) &&
              (!request.account ||
                StringUtils.isEmpty(request.account.username))
            ) {
              throw BrowserAuthError.createSilentSSOInsufficientInfoError();
            }
            // Check that prompt is set to none, throw error if it is set to anything else.
            if (request.prompt && request.prompt !== PromptValue.NONE) {
              throw BrowserAuthError.createSilentPromptValueError(
                request.prompt
              );
            }
            silentRequest = this.initializeAuthorizationRequest(
              __assign(__assign({}, request), { prompt: PromptValue.NONE }),
              InteractionType.Silent
            );
            browserRequestLogger = this.logger.clone(
              name,
              version,
              silentRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              apiId,
              silentRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            return [
              4 /*yield*/,
              this.initializeAuthorizationCodeRequest(silentRequest),
            ];
          case 2:
            authCodeRequest = _a.sent();
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                silentRequest.authority,
                silentRequest.correlationId
              ),
            ];
          case 3:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            return [4 /*yield*/, authClient.getAuthCodeUrl(silentRequest)];
          case 4:
            navigateUrl = _a.sent();
            return [
              4 /*yield*/,
              this.silentTokenHelper(
                navigateUrl,
                authCodeRequest,
                authClient,
                browserRequestLogger
              ),
            ];
          case 5:
            return [2 /*return*/, _a.sent()];
          case 6:
            e_5 = _a.sent();
            serverTelemetryManager.cacheFailedRequest(e_5);
            this.browserStorage.cleanRequestByState(silentRequest.state);
            throw e_5;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Use this function to obtain a token before every call to the API / resource provider
   *
   * MSAL return's a cached token when available
   * Or it send's a request to the STS to obtain a new token using a refresh token.
   *
   * @param {@link SilentRequest}
   *
   * To renew idToken, please pass clientId as the only scope in the Authentication Parameters
   * @returns A promise that is fulfilled when this function has completed, or rejected if an error was raised.
   */
  ClientApplication.prototype.acquireTokenByRefreshToken = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var silentRequest,
        browserRequestLogger,
        serverTelemetryManager,
        refreshTokenClient,
        e_6,
        isServerError,
        isInteractionRequiredError,
        isInvalidGrantError;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.eventHandler.emitEvent(
              EventType.ACQUIRE_TOKEN_NETWORK_START,
              InteractionType.Silent,
              request
            );
            // block the reload if it occurred inside a hidden iframe
            BrowserUtils.blockReloadInHiddenIframes();
            silentRequest = __assign(
              __assign({}, request),
              this.initializeBaseRequest(request)
            );
            browserRequestLogger = this.logger.clone(
              name,
              version,
              silentRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.acquireTokenSilent_silentFlow,
              silentRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 7]);
            return [
              4 /*yield*/,
              this.createRefreshTokenClient(
                serverTelemetryManager,
                silentRequest.authority,
                silentRequest.correlationId
              ),
            ];
          case 2:
            refreshTokenClient = _a.sent();
            browserRequestLogger.verbose("Refresh token client created");
            return [
              4 /*yield*/,
              refreshTokenClient.acquireTokenByRefreshToken(silentRequest),
            ];
          case 3:
            // Send request to renew token. Auth module will throw errors if token cannot be renewed.
            return [2 /*return*/, _a.sent()];
          case 4:
            e_6 = _a.sent();
            serverTelemetryManager.cacheFailedRequest(e_6);
            isServerError = e_6 instanceof ServerError;
            isInteractionRequiredError =
              e_6 instanceof InteractionRequiredAuthError;
            isInvalidGrantError =
              e_6.errorCode === BrowserConstants.INVALID_GRANT_ERROR;
            if (
              !(
                isServerError &&
                isInvalidGrantError &&
                !isInteractionRequiredError
              )
            )
              return [3 /*break*/, 6];
            browserRequestLogger.verbose(
              "Refresh token expired or invalid, attempting acquire token by iframe"
            );
            return [
              4 /*yield*/,
              this.acquireTokenByIframe(
                request,
                ApiId.acquireTokenSilent_authCode
              ),
            ];
          case 5:
            return [2 /*return*/, _a.sent()];
          case 6:
            throw e_6;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Helper which acquires an authorization code silently using a hidden iframe from given url
   * using the scopes requested as part of the id, and exchanges the code for a set of OAuth tokens.
   * @param navigateUrl
   * @param userRequestScopes
   */
  ClientApplication.prototype.silentTokenHelper = function (
    navigateUrl,
    authCodeRequest,
    authClient,
    browserRequestLogger
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var silentHandler, msalFrame, hash, state;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            silentHandler = new SilentHandler(
              authClient,
              this.browserStorage,
              authCodeRequest,
              browserRequestLogger,
              this.config.system.navigateFrameWait
            );
            return [
              4 /*yield*/,
              silentHandler.initiateAuthRequest(navigateUrl),
            ];
          case 1:
            msalFrame = _a.sent();
            return [
              4 /*yield*/,
              silentHandler.monitorIframeForHash(
                msalFrame,
                this.config.system.iframeHashTimeout
              ),
            ];
          case 2:
            hash = _a.sent();
            state = this.validateAndExtractStateFromHash(
              hash,
              InteractionType.Silent,
              authCodeRequest.correlationId
            );
            // Handle response from hash string
            return [
              2 /*return*/,
              silentHandler.handleCodeResponse(
                hash,
                state,
                authClient.authority,
                this.networkClient
              ),
            ];
        }
      });
    });
  };
  // #endregion
  // #region Logout
  /**
   * Deprecated logout function. Use logoutRedirect or logoutPopup instead
   * @param logoutRequest
   * @deprecated
   */
  ClientApplication.prototype.logout = function (logoutRequest) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.logger.warning(
          "logout API is deprecated and will be removed in msal-browser v3.0.0. Use logoutRedirect instead."
        );
        return [2 /*return*/, this.logoutRedirect(logoutRequest)];
      });
    });
  };
  /**
   * Use to log out the current user, and redirect the user to the postLogoutRedirectUri.
   * Default behaviour is to redirect the user to `window.location.href`.
   * @param logoutRequest
   */
  ClientApplication.prototype.logoutRedirect = function (logoutRequest) {
    return __awaiter(this, void 0, void 0, function () {
      var validLogoutRequest,
        browserRequestLogger,
        serverTelemetryManager,
        authClient,
        logoutUri,
        navigationOptions,
        navigate,
        e_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.preflightBrowserEnvironmentCheck(InteractionType.Redirect);
            this.logger.verbose(
              "logoutRedirect called",
              logoutRequest === null || logoutRequest === void 0
                ? void 0
                : logoutRequest.correlationId
            );
            validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
            browserRequestLogger = this.logger.clone(
              name,
              version,
              validLogoutRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.logout,
              validLogoutRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 9, , 10]);
            this.eventHandler.emitEvent(
              EventType.LOGOUT_START,
              InteractionType.Redirect,
              logoutRequest
            );
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                logoutRequest && logoutRequest.authority,
                validLogoutRequest === null || validLogoutRequest === void 0
                  ? void 0
                  : validLogoutRequest.correlationId
              ),
            ];
          case 2:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            logoutUri = authClient.getLogoutUri(validLogoutRequest);
            if (
              !validLogoutRequest.account ||
              AccountEntity.accountInfoIsEqual(
                validLogoutRequest.account,
                this.getActiveAccount(),
                false
              )
            ) {
              browserRequestLogger.verbose("Setting active account to null");
              this.setActiveAccount(null);
            }
            navigationOptions = {
              apiId: ApiId.logout,
              timeout: this.config.system.redirectNavigationTimeout,
              noHistory: false,
            };
            this.eventHandler.emitEvent(
              EventType.LOGOUT_SUCCESS,
              InteractionType.Redirect,
              validLogoutRequest
            );
            if (
              !(
                logoutRequest &&
                typeof logoutRequest.onRedirectNavigate === "function"
              )
            )
              return [3 /*break*/, 6];
            navigate = logoutRequest.onRedirectNavigate(logoutUri);
            if (!(navigate !== false)) return [3 /*break*/, 4];
            browserRequestLogger.verbose(
              "Logout onRedirectNavigate did not return false, navigating"
            );
            return [
              4 /*yield*/,
              this.navigationClient.navigateExternal(
                logoutUri,
                navigationOptions
              ),
            ];
          case 3:
            _a.sent();
            return [2 /*return*/];
          case 4:
            browserRequestLogger.verbose(
              "Logout onRedirectNavigate returned false, stopping navigation"
            );
            _a.label = 5;
          case 5:
            return [3 /*break*/, 8];
          case 6:
            return [
              4 /*yield*/,
              this.navigationClient.navigateExternal(
                logoutUri,
                navigationOptions
              ),
            ];
          case 7:
            _a.sent();
            return [2 /*return*/];
          case 8:
            return [3 /*break*/, 10];
          case 9:
            e_7 = _a.sent();
            serverTelemetryManager.cacheFailedRequest(e_7);
            this.eventHandler.emitEvent(
              EventType.LOGOUT_FAILURE,
              InteractionType.Redirect,
              null,
              e_7
            );
            throw e_7;
          case 10:
            this.eventHandler.emitEvent(
              EventType.LOGOUT_END,
              InteractionType.Redirect
            );
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clears local cache for the current user then opens a popup window prompting the user to sign-out of the server
   * @param logoutRequest
   */
  ClientApplication.prototype.logoutPopup = function (logoutRequest) {
    var validLogoutRequest;
    try {
      this.preflightBrowserEnvironmentCheck(InteractionType.Popup);
      this.logger.verbose(
        "logoutPopup called",
        logoutRequest === null || logoutRequest === void 0
          ? void 0
          : logoutRequest.correlationId
      );
      validLogoutRequest = this.initializeLogoutRequest(logoutRequest);
    } catch (e) {
      // Since this function is synchronous we need to reject
      return Promise.reject(e);
    }
    var popupName = PopupUtils.generateLogoutPopupName(
      this.config.auth.clientId,
      validLogoutRequest
    );
    var popup;
    // asyncPopups flag is true. Acquires token without first opening popup. Popup will be opened later asynchronously.
    if (this.config.system.asyncPopups) {
      this.logger.verbose(
        "asyncPopups set to true",
        validLogoutRequest.correlationId
      );
    } else {
      // asyncPopups flag is set to false. Opens popup before logging out.
      this.logger.verbose(
        "asyncPopup set to false, opening popup",
        validLogoutRequest.correlationId
      );
      popup = PopupUtils.openSizedPopup("about:blank", popupName);
    }
    var authority = logoutRequest && logoutRequest.authority;
    var mainWindowRedirectUri =
      logoutRequest && logoutRequest.mainWindowRedirectUri;
    return this.logoutPopupAsync(
      validLogoutRequest,
      popupName,
      authority,
      popup,
      mainWindowRedirectUri
    );
  };
  /**
   *
   * @param request
   * @param popupName
   * @param requestAuthority
   * @param popup
   */
  ClientApplication.prototype.logoutPopupAsync = function (
    validRequest,
    popupName,
    requestAuthority,
    popup,
    mainWindowRedirectUri
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var browserRequestLogger,
        serverTelemetryManager,
        authClient,
        logoutUri,
        popupUtils,
        popupWindow,
        e_8,
        navigationOptions,
        absoluteUrl,
        e_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "logoutPopupAsync called",
              validRequest.correlationId
            );
            this.eventHandler.emitEvent(
              EventType.LOGOUT_START,
              InteractionType.Popup,
              validRequest
            );
            browserRequestLogger = this.logger.clone(
              name,
              version,
              validRequest.correlationId
            );
            serverTelemetryManager = this.initializeServerTelemetryManager(
              ApiId.logoutPopup,
              validRequest.correlationId
            );
            _a.label = 1;
          case 1:
            _a.trys.push([1, 7, , 8]);
            this.browserStorage.setTemporaryCache(
              TemporaryCacheKeys.INTERACTION_STATUS_KEY,
              BrowserConstants.INTERACTION_IN_PROGRESS_VALUE,
              true
            );
            return [
              4 /*yield*/,
              this.createAuthCodeClient(
                serverTelemetryManager,
                requestAuthority,
                validRequest.correlationId
              ),
            ];
          case 2:
            authClient = _a.sent();
            browserRequestLogger.verbose("Auth code client created");
            logoutUri = authClient.getLogoutUri(validRequest);
            if (
              !validRequest.account ||
              AccountEntity.accountInfoIsEqual(
                validRequest.account,
                this.getActiveAccount(),
                false
              )
            ) {
              browserRequestLogger.verbose("Setting active account to null");
              this.setActiveAccount(null);
            }
            this.eventHandler.emitEvent(
              EventType.LOGOUT_SUCCESS,
              InteractionType.Popup,
              validRequest
            );
            popupUtils = new PopupUtils(this.browserStorage, this.logger);
            popupWindow = popupUtils.openPopup(logoutUri, popupName, popup);
            this.eventHandler.emitEvent(
              EventType.POPUP_OPENED,
              InteractionType.Popup,
              { popupWindow: popupWindow },
              null
            );
            _a.label = 3;
          case 3:
            _a.trys.push([3, 5, , 6]);
            // Don't care if this throws an error (User Cancelled)
            return [
              4 /*yield*/,
              popupUtils.monitorPopupForSameOrigin(popupWindow),
            ];
          case 4:
            // Don't care if this throws an error (User Cancelled)
            _a.sent();
            browserRequestLogger.verbose(
              "Popup successfully redirected to postLogoutRedirectUri"
            );
            return [3 /*break*/, 6];
          case 5:
            e_8 = _a.sent();
            browserRequestLogger.verbose(
              "Error occurred while monitoring popup for same origin. Session on server may remain active. Error: " +
                e_8
            );
            return [3 /*break*/, 6];
          case 6:
            popupUtils.cleanPopup(popupWindow);
            if (mainWindowRedirectUri) {
              navigationOptions = {
                apiId: ApiId.logoutPopup,
                timeout: this.config.system.redirectNavigationTimeout,
                noHistory: false,
              };
              absoluteUrl = UrlString.getAbsoluteUrl(
                mainWindowRedirectUri,
                BrowserUtils.getCurrentUri()
              );
              browserRequestLogger.verbose(
                "Redirecting main window to url specified in the request"
              );
              browserRequestLogger.verbosePii(
                "Redirecing main window to: " + absoluteUrl
              );
              this.navigationClient.navigateInternal(
                absoluteUrl,
                navigationOptions
              );
            } else {
              browserRequestLogger.verbose(
                "No main window navigation requested"
              );
            }
            return [3 /*break*/, 8];
          case 7:
            e_9 = _a.sent();
            if (popup) {
              // Close the synchronous popup if an error is thrown before the window unload event is registered
              popup.close();
            }
            this.browserStorage.removeItem(
              this.browserStorage.generateCacheKey(
                TemporaryCacheKeys.INTERACTION_STATUS_KEY
              )
            );
            this.eventHandler.emitEvent(
              EventType.LOGOUT_FAILURE,
              InteractionType.Popup,
              null,
              e_9
            );
            serverTelemetryManager.cacheFailedRequest(e_9);
            throw e_9;
          case 8:
            this.eventHandler.emitEvent(
              EventType.LOGOUT_END,
              InteractionType.Popup
            );
            return [2 /*return*/];
        }
      });
    });
  };
  // #endregion
  // #region Account APIs
  /**
   * Returns all accounts that MSAL currently has data for.
   * (the account object is created at the time of successful login)
   * or empty array when no accounts are found
   * @returns Array of account objects in cache
   */
  ClientApplication.prototype.getAllAccounts = function () {
    this.logger.verbose("getAllAccounts called");
    return this.isBrowserEnvironment
      ? this.browserStorage.getAllAccounts()
      : [];
  };
  /**
   * Returns the signed in account matching username.
   * (the account object is created at the time of successful login)
   * or null when no matching account is found.
   * This API is provided for convenience but getAccountById should be used for best reliability
   * @param userName
   * @returns The account object stored in MSAL
   */
  ClientApplication.prototype.getAccountByUsername = function (userName) {
    var allAccounts = this.getAllAccounts();
    if (!StringUtils.isEmpty(userName) && allAccounts && allAccounts.length) {
      this.logger.verbose("Account matching username found, returning");
      this.logger.verbosePii(
        "Returning signed-in accounts matching username: " + userName
      );
      return (
        allAccounts.filter(function (accountObj) {
          return accountObj.username.toLowerCase() === userName.toLowerCase();
        })[0] || null
      );
    } else {
      this.logger.verbose(
        "getAccountByUsername: No matching account found, returning null"
      );
      return null;
    }
  };
  /**
   * Returns the signed in account matching homeAccountId.
   * (the account object is created at the time of successful login)
   * or null when no matching account is found
   * @param homeAccountId
   * @returns The account object stored in MSAL
   */
  ClientApplication.prototype.getAccountByHomeId = function (homeAccountId) {
    var allAccounts = this.getAllAccounts();
    if (
      !StringUtils.isEmpty(homeAccountId) &&
      allAccounts &&
      allAccounts.length
    ) {
      this.logger.verbose("Account matching homeAccountId found, returning");
      this.logger.verbosePii(
        "Returning signed-in accounts matching homeAccountId: " + homeAccountId
      );
      return (
        allAccounts.filter(function (accountObj) {
          return accountObj.homeAccountId === homeAccountId;
        })[0] || null
      );
    } else {
      this.logger.verbose(
        "getAccountByHomeId: No matching account found, returning null"
      );
      return null;
    }
  };
  /**
   * Returns the signed in account matching localAccountId.
   * (the account object is created at the time of successful login)
   * or null when no matching account is found
   * @param localAccountId
   * @returns The account object stored in MSAL
   */
  ClientApplication.prototype.getAccountByLocalId = function (localAccountId) {
    var allAccounts = this.getAllAccounts();
    if (
      !StringUtils.isEmpty(localAccountId) &&
      allAccounts &&
      allAccounts.length
    ) {
      this.logger.verbose("Account matching localAccountId found, returning");
      this.logger.verbosePii(
        "Returning signed-in accounts matching localAccountId: " +
          localAccountId
      );
      return (
        allAccounts.filter(function (accountObj) {
          return accountObj.localAccountId === localAccountId;
        })[0] || null
      );
    } else {
      this.logger.verbose(
        "getAccountByLocalId: No matching account found, returning null"
      );
      return null;
    }
  };
  /**
   * Sets the account to use as the active account. If no account is passed to the acquireToken APIs, then MSAL will use this active account.
   * @param account
   */
  ClientApplication.prototype.setActiveAccount = function (account) {
    this.browserStorage.setActiveAccount(account);
  };
  /**
   * Gets the currently active account
   */
  ClientApplication.prototype.getActiveAccount = function () {
    return this.browserStorage.getActiveAccount();
  };
  // #endregion
  // #region Helpers
  /**
   *
   * Use to get the redirect uri configured in MSAL or null.
   * @param requestRedirectUri
   * @returns Redirect URL
   *
   */
  ClientApplication.prototype.getRedirectUri = function (requestRedirectUri) {
    this.logger.verbose("getRedirectUri called");
    var redirectUri =
      requestRedirectUri ||
      this.config.auth.redirectUri ||
      BrowserUtils.getCurrentUri();
    return UrlString.getAbsoluteUrl(redirectUri, BrowserUtils.getCurrentUri());
  };
  /**
   * Use to get the redirectStartPage either from request or use current window
   * @param requestStartPage
   */
  ClientApplication.prototype.getRedirectStartPage = function (
    requestStartPage
  ) {
    var redirectStartPage = requestStartPage || window.location.href;
    return UrlString.getAbsoluteUrl(
      redirectStartPage,
      BrowserUtils.getCurrentUri()
    );
  };
  /**
   * Used to get a discovered version of the default authority.
   * @param requestAuthority
   * @param requestCorrelationId
   */
  ClientApplication.prototype.getDiscoveredAuthority = function (
    requestAuthority,
    requestCorrelationId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var authorityOptions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "getDiscoveredAuthority called",
              requestCorrelationId
            );
            authorityOptions = {
              protocolMode: this.config.auth.protocolMode,
              knownAuthorities: this.config.auth.knownAuthorities,
              cloudDiscoveryMetadata: this.config.auth.cloudDiscoveryMetadata,
              authorityMetadata: this.config.auth.authorityMetadata,
            };
            if (!requestAuthority) return [3 /*break*/, 2];
            this.logger.verbose(
              "Creating discovered authority with request authority",
              requestCorrelationId
            );
            return [
              4 /*yield*/,
              AuthorityFactory.createDiscoveredInstance(
                requestAuthority,
                this.config.system.networkClient,
                this.browserStorage,
                authorityOptions
              ),
            ];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            this.logger.verbose(
              "Creating discovered authority with configured authority",
              requestCorrelationId
            );
            return [
              4 /*yield*/,
              AuthorityFactory.createDiscoveredInstance(
                this.config.auth.authority,
                this.config.system.networkClient,
                this.browserStorage,
                authorityOptions
              ),
            ];
          case 3:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  /**
   * Helper to check whether interaction is in progress.
   */
  ClientApplication.prototype.interactionInProgress = function () {
    // Check whether value in cache is present and equal to expected value
    return (
      this.browserStorage.getTemporaryCache(
        TemporaryCacheKeys.INTERACTION_STATUS_KEY,
        true
      ) === BrowserConstants.INTERACTION_IN_PROGRESS_VALUE
    );
  };
  /**
   * Creates an Authorization Code Client with the given authority, or the default authority.
   * @param serverTelemetryManager
   * @param authorityUrl
   */
  ClientApplication.prototype.createAuthCodeClient = function (
    serverTelemetryManager,
    authorityUrl,
    correlationId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var clientConfig;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.getClientConfiguration(
                serverTelemetryManager,
                authorityUrl,
                correlationId
              ),
            ];
          case 1:
            clientConfig = _a.sent();
            return [2 /*return*/, new AuthorizationCodeClient(clientConfig)];
        }
      });
    });
  };
  /**
   * Creates an Silent Flow Client with the given authority, or the default authority.
   * @param serverTelemetryManager
   * @param authorityUrl
   */
  ClientApplication.prototype.createSilentFlowClient = function (
    serverTelemetryManager,
    authorityUrl,
    correlationId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var clientConfig;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.getClientConfiguration(
                serverTelemetryManager,
                authorityUrl,
                correlationId
              ),
            ];
          case 1:
            clientConfig = _a.sent();
            return [2 /*return*/, new SilentFlowClient(clientConfig)];
        }
      });
    });
  };
  /**
   * Creates a Refresh Client with the given authority, or the default authority.
   * @param serverTelemetryManager
   * @param authorityUrl
   */
  ClientApplication.prototype.createRefreshTokenClient = function (
    serverTelemetryManager,
    authorityUrl,
    correlationId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var clientConfig;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.getClientConfiguration(
                serverTelemetryManager,
                authorityUrl,
                correlationId
              ),
            ];
          case 1:
            clientConfig = _a.sent();
            return [2 /*return*/, new RefreshTokenClient(clientConfig)];
        }
      });
    });
  };
  /**
   * Creates a Client Configuration object with the given request authority, or the default authority.
   * @param serverTelemetryManager
   * @param requestAuthority
   * @param requestCorrelationId
   */
  ClientApplication.prototype.getClientConfiguration = function (
    serverTelemetryManager,
    requestAuthority,
    requestCorrelationId
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var discoveredAuthority;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "getClientConfiguration called",
              requestCorrelationId
            );
            return [
              4 /*yield*/,
              this.getDiscoveredAuthority(
                requestAuthority,
                requestCorrelationId
              ),
            ];
          case 1:
            discoveredAuthority = _a.sent();
            return [
              2 /*return*/,
              {
                authOptions: {
                  clientId: this.config.auth.clientId,
                  authority: discoveredAuthority,
                  clientCapabilities: this.config.auth.clientCapabilities,
                },
                systemOptions: {
                  tokenRenewalOffsetSeconds:
                    this.config.system.tokenRenewalOffsetSeconds,
                  preventCorsPreflight: true,
                },
                loggerOptions: {
                  loggerCallback:
                    this.config.system.loggerOptions.loggerCallback,
                  piiLoggingEnabled:
                    this.config.system.loggerOptions.piiLoggingEnabled,
                  logLevel: this.config.system.loggerOptions.logLevel,
                  correlationId: requestCorrelationId,
                },
                cryptoInterface: this.browserCrypto,
                networkInterface: this.networkClient,
                storageInterface: this.browserStorage,
                serverTelemetryManager: serverTelemetryManager,
                libraryInfo: {
                  sku: BrowserConstants.MSAL_SKU,
                  version: version,
                  cpu: "",
                  os: "",
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Helper to validate app environment before making a request.
   * @param request
   * @param interactionType
   */
  ClientApplication.prototype.preflightInteractiveRequest = function (
    request,
    interactionType
  ) {
    this.logger.verbose(
      "preflightInteractiveRequest called, validating app environment",
      request === null || request === void 0 ? void 0 : request.correlationId
    );
    // block the reload if it occurred inside a hidden iframe
    BrowserUtils.blockReloadInHiddenIframes();
    // Check if interaction is in progress. Throw error if true.
    if (this.interactionInProgress()) {
      throw BrowserAuthError.createInteractionInProgressError();
    }
    return this.initializeAuthorizationRequest(request, interactionType);
  };
  /**
   * Helper to validate app environment before making an auth request
   * * @param interactionType
   */
  ClientApplication.prototype.preflightBrowserEnvironmentCheck = function (
    interactionType
  ) {
    this.logger.verbose("preflightBrowserEnvironmentCheck started");
    // Block request if not in browser environment
    BrowserUtils.blockNonBrowserEnvironment(this.isBrowserEnvironment);
    // Block redirects if in an iframe
    BrowserUtils.blockRedirectInIframe(
      interactionType,
      this.config.system.allowRedirectInIframe
    );
    // Block auth requests inside a hidden iframe
    BrowserUtils.blockReloadInHiddenIframes();
    // Block redirectUri opened in a popup from calling MSAL APIs
    BrowserUtils.blockAcquireTokenInPopups();
    // Block redirects if memory storage is enabled but storeAuthStateInCookie is not
    if (
      interactionType === InteractionType.Redirect &&
      this.config.cache.cacheLocation === BrowserCacheLocation.MemoryStorage &&
      !this.config.cache.storeAuthStateInCookie
    ) {
      throw BrowserConfigurationAuthError.createInMemoryRedirectUnavailableError();
    }
  };
  /**
   * Initializer function for all request APIs
   * @param request
   */
  ClientApplication.prototype.initializeBaseRequest = function (request) {
    this.logger.verbose("Initializing BaseAuthRequest", request.correlationId);
    var authority = request.authority || this.config.auth.authority;
    var scopes = __spread((request && request.scopes) || []);
    var correlationId =
      (request && request.correlationId) || this.browserCrypto.createNewGuid();
    // Set authenticationScheme to BEARER if not explicitly set in the request
    if (!request.authenticationScheme) {
      request.authenticationScheme = AuthenticationScheme.BEARER;
      this.logger.verbose(
        'Authentication Scheme wasn\'t explicitly set in request, defaulting to "Bearer" request',
        request.correlationId
      );
    } else {
      this.logger.verbose(
        'Authentication Scheme set to "' +
          request.authenticationScheme +
          '" as configured in Auth request',
        request.correlationId
      );
    }
    var validatedRequest = __assign(__assign({}, request), {
      correlationId: correlationId,
      authority: authority,
      scopes: scopes,
    });
    return validatedRequest;
  };
  /**
   *
   * @param apiId
   * @param correlationId
   * @param forceRefresh
   */
  ClientApplication.prototype.initializeServerTelemetryManager = function (
    apiId,
    correlationId,
    forceRefresh
  ) {
    this.logger.verbose(
      "initializeServerTelemetryManager called",
      correlationId
    );
    var telemetryPayload = {
      clientId: this.config.auth.clientId,
      correlationId: correlationId,
      apiId: apiId,
      forceRefresh: forceRefresh || false,
      wrapperSKU: this.wrapperSKU,
      wrapperVer: this.wrapperVer,
    };
    return new ServerTelemetryManager(telemetryPayload, this.browserStorage);
  };
  /**
   * Helper to initialize required request parameters for interactive APIs and ssoSilent()
   * @param request
   * @param interactionType
   */
  ClientApplication.prototype.initializeAuthorizationRequest = function (
    request,
    interactionType
  ) {
    this.logger.verbose(
      "initializeAuthorizationRequest called",
      request.correlationId
    );
    var redirectUri = this.getRedirectUri(request.redirectUri);
    var browserState = {
      interactionType: interactionType,
    };
    var state = ProtocolUtils.setRequestState(
      this.browserCrypto,
      (request && request.state) || "",
      browserState
    );
    var validatedRequest = __assign(
      __assign({}, this.initializeBaseRequest(request)),
      {
        redirectUri: redirectUri,
        state: state,
        nonce: request.nonce || this.browserCrypto.createNewGuid(),
        responseMode: ResponseMode.FRAGMENT,
      }
    );
    var account = request.account || this.getActiveAccount();
    if (account) {
      this.logger.verbose("Setting validated request account");
      this.logger.verbosePii("Setting validated request account: " + account);
      validatedRequest.account = account;
    }
    // Check for ADAL SSO
    if (StringUtils.isEmpty(validatedRequest.loginHint)) {
      // Only check for adal token if no SSO params are being used
      var adalIdTokenString = this.browserStorage.getTemporaryCache(
        PersistentCacheKeys.ADAL_ID_TOKEN
      );
      if (adalIdTokenString) {
        var adalIdToken = new IdToken(adalIdTokenString, this.browserCrypto);
        this.browserStorage.removeItem(PersistentCacheKeys.ADAL_ID_TOKEN);
        if (adalIdToken.claims && adalIdToken.claims.upn) {
          this.logger.verbose(
            "No SSO params used and ADAL token retrieved, setting ADAL upn as loginHint"
          );
          validatedRequest.loginHint = adalIdToken.claims.upn;
        }
      }
    }
    this.browserStorage.updateCacheEntries(
      validatedRequest.state,
      validatedRequest.nonce,
      validatedRequest.authority,
      validatedRequest.loginHint || "",
      validatedRequest.account || null
    );
    return validatedRequest;
  };
  /**
   * Generates an auth code request tied to the url request.
   * @param request
   */
  ClientApplication.prototype.initializeAuthorizationCodeRequest = function (
    request
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var generatedPkceParams, authCodeRequest;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.logger.verbose(
              "initializeAuthorizationRequest called",
              request.correlationId
            );
            return [4 /*yield*/, this.browserCrypto.generatePkceCodes()];
          case 1:
            generatedPkceParams = _a.sent();
            authCodeRequest = __assign(__assign({}, request), {
              redirectUri: request.redirectUri,
              code: "",
              codeVerifier: generatedPkceParams.verifier,
            });
            request.codeChallenge = generatedPkceParams.challenge;
            request.codeChallengeMethod = Constants.S256_CODE_CHALLENGE_METHOD;
            return [2 /*return*/, authCodeRequest];
        }
      });
    });
  };
  /**
   * Initializer for the logout request.
   * @param logoutRequest
   */
  ClientApplication.prototype.initializeLogoutRequest = function (
    logoutRequest
  ) {
    this.logger.verbose(
      "initializeLogoutRequest called",
      logoutRequest === null || logoutRequest === void 0
        ? void 0
        : logoutRequest.correlationId
    );
    // Check if interaction is in progress. Throw error if true.
    if (this.interactionInProgress()) {
      throw BrowserAuthError.createInteractionInProgressError();
    }
    var validLogoutRequest = __assign(
      { correlationId: this.browserCrypto.createNewGuid() },
      logoutRequest
    );
    /*
     * Only set redirect uri if logout request isn't provided or the set uri isn't null.
     * Otherwise, use passed uri, config, or current page.
     */
    if (!logoutRequest || logoutRequest.postLogoutRedirectUri !== null) {
      if (logoutRequest && logoutRequest.postLogoutRedirectUri) {
        this.logger.verbose(
          "Setting postLogoutRedirectUri to uri set on logout request",
          validLogoutRequest.correlationId
        );
        validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(
          logoutRequest.postLogoutRedirectUri,
          BrowserUtils.getCurrentUri()
        );
      } else if (this.config.auth.postLogoutRedirectUri === null) {
        this.logger.verbose(
          "postLogoutRedirectUri configured as null and no uri set on request, not passing post logout redirect",
          validLogoutRequest.correlationId
        );
      } else if (this.config.auth.postLogoutRedirectUri) {
        this.logger.verbose(
          "Setting postLogoutRedirectUri to configured uri",
          validLogoutRequest.correlationId
        );
        validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(
          this.config.auth.postLogoutRedirectUri,
          BrowserUtils.getCurrentUri()
        );
      } else {
        this.logger.verbose(
          "Setting postLogoutRedirectUri to current page",
          validLogoutRequest.correlationId
        );
        validLogoutRequest.postLogoutRedirectUri = UrlString.getAbsoluteUrl(
          BrowserUtils.getCurrentUri(),
          BrowserUtils.getCurrentUri()
        );
      }
    } else {
      this.logger.verbose(
        "postLogoutRedirectUri passed as null, not setting post logout redirect uri",
        validLogoutRequest.correlationId
      );
    }
    return validLogoutRequest;
  };
  /**
   * Adds event callbacks to array
   * @param callback
   */
  ClientApplication.prototype.addEventCallback = function (callback) {
    return this.eventHandler.addEventCallback(callback);
  };
  /**
   * Removes callback with provided id from callback array
   * @param callbackId
   */
  ClientApplication.prototype.removeEventCallback = function (callbackId) {
    this.eventHandler.removeEventCallback(callbackId);
  };
  /**
   * Returns the logger instance
   */
  ClientApplication.prototype.getLogger = function () {
    return this.logger;
  };
  /**
   * Replaces the default logger set in configurations with new Logger with new configurations
   * @param logger Logger instance
   */
  ClientApplication.prototype.setLogger = function (logger) {
    this.logger = logger;
  };
  /**
   * Called by wrapper libraries (Angular & React) to set SKU and Version passed down to telemetry, logger, etc.
   * @param sku
   * @param version
   */
  ClientApplication.prototype.initializeWrapperLibrary = function (
    sku,
    version
  ) {
    // Validate the SKU passed in is one we expect
    this.wrapperSKU = sku;
    this.wrapperVer = version;
  };
  /**
   * Sets navigation client
   * @param navigationClient
   */
  ClientApplication.prototype.setNavigationClient = function (
    navigationClient
  ) {
    this.navigationClient = navigationClient;
  };
  return ClientApplication;
})();

export { ClientApplication };
//# sourceMappingURL=ClientApplication.js.map
