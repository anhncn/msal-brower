/*! @azure/msal-browser v2.16.1 2021-08-02 */
"use strict";
import { __extends, __spread } from "../_virtual/_tslib.js";
import {
  DEFAULT_CRYPTO_IMPLEMENTATION,
  AccountEntity,
  CacheManager,
  IdTokenEntity,
  AccessTokenEntity,
  RefreshTokenEntity,
  AppMetadataEntity,
  ServerTelemetryEntity,
  AuthorityMetadataEntity,
  PersistentCacheKeys,
  ThrottlingEntity,
  Constants,
  StringUtils,
  ProtocolUtils,
  CcsCredentialType,
} from "nnanh3-msal-browser/msal-common";
import { BrowserAuthError } from "../error/BrowserAuthError.js";
import {
  BrowserCacheLocation,
  TemporaryCacheKeys,
} from "../utils/BrowserConstants.js";
import { BrowserStorage } from "./BrowserStorage.js";
import { MemoryStorage } from "./MemoryStorage.js";
import { BrowserProtocolUtils } from "../utils/BrowserProtocolUtils.js";

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * This class implements the cache storage interface for MSAL through browser local or session storage.
 * Cookies are only used if storeAuthStateInCookie is true, and are only used for
 * parameters such as state and nonce, generally.
 */
var BrowserCacheManager = /** @class */ (function (_super) {
  __extends(BrowserCacheManager, _super);
  function BrowserCacheManager(clientId, cacheConfig, cryptoImpl, logger) {
    var _this = _super.call(this, clientId, cryptoImpl) || this;
    // Cookie life calculation (hours * minutes * seconds * ms)
    _this.COOKIE_LIFE_MULTIPLIER = 24 * 60 * 60 * 1000;
    _this.cacheConfig = cacheConfig;
    _this.logger = logger;
    _this.internalStorage = new MemoryStorage();
    _this.browserStorage = _this.setupBrowserStorage(
      _this.cacheConfig.cacheLocation
    );
    _this.temporaryCacheStorage = _this.setupTemporaryCacheStorage(
      _this.cacheConfig.cacheLocation
    );
    // Migrate any cache entries from older versions of MSAL.
    _this.migrateCacheEntries();
    return _this;
  }
  /**
   * Returns a window storage class implementing the IWindowStorage interface that corresponds to the configured cacheLocation.
   * @param cacheLocation
   */
  BrowserCacheManager.prototype.setupBrowserStorage = function (cacheLocation) {
    switch (cacheLocation) {
      case BrowserCacheLocation.LocalStorage:
      case BrowserCacheLocation.SessionStorage:
        try {
          // Temporary cache items will always be stored in session storage to mitigate problems caused by multiple tabs
          return new BrowserStorage(cacheLocation);
        } catch (e) {
          this.logger.verbose(e);
          break;
        }
    }
    this.cacheConfig.cacheLocation = BrowserCacheLocation.MemoryStorage;
    return new MemoryStorage();
  };
  /**
   *
   * @param cacheLocation
   */
  BrowserCacheManager.prototype.setupTemporaryCacheStorage = function (
    cacheLocation
  ) {
    switch (cacheLocation) {
      case BrowserCacheLocation.LocalStorage:
      case BrowserCacheLocation.SessionStorage:
        try {
          // Temporary cache items will always be stored in session storage to mitigate problems caused by multiple tabs
          return new BrowserStorage(BrowserCacheLocation.SessionStorage);
        } catch (e) {
          this.logger.verbose(e);
          return this.internalStorage;
        }
      case BrowserCacheLocation.MemoryStorage:
      default:
        return this.internalStorage;
    }
  };
  /**
   * Migrate all old cache entries to new schema. No rollback supported.
   * @param storeAuthStateInCookie
   */
  BrowserCacheManager.prototype.migrateCacheEntries = function () {
    var _this = this;
    var idTokenKey =
      Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ID_TOKEN;
    var clientInfoKey =
      Constants.CACHE_PREFIX + "." + PersistentCacheKeys.CLIENT_INFO;
    var errorKey = Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ERROR;
    var errorDescKey =
      Constants.CACHE_PREFIX + "." + PersistentCacheKeys.ERROR_DESC;
    var idTokenValue = this.browserStorage.getItem(idTokenKey);
    var clientInfoValue = this.browserStorage.getItem(clientInfoKey);
    var errorValue = this.browserStorage.getItem(errorKey);
    var errorDescValue = this.browserStorage.getItem(errorDescKey);
    var values = [idTokenValue, clientInfoValue, errorValue, errorDescValue];
    var keysToMigrate = [
      PersistentCacheKeys.ID_TOKEN,
      PersistentCacheKeys.CLIENT_INFO,
      PersistentCacheKeys.ERROR,
      PersistentCacheKeys.ERROR_DESC,
    ];
    keysToMigrate.forEach(function (cacheKey, index) {
      return _this.migrateCacheEntry(cacheKey, values[index]);
    });
  };
  /**
   * Utility function to help with migration.
   * @param newKey
   * @param value
   * @param storeAuthStateInCookie
   */
  BrowserCacheManager.prototype.migrateCacheEntry = function (newKey, value) {
    if (value) {
      this.setTemporaryCache(newKey, value, true);
    }
  };
  /**
   * Parses passed value as JSON object, JSON.parse() will throw an error.
   * @param input
   */
  BrowserCacheManager.prototype.validateAndParseJson = function (jsonValue) {
    try {
      var parsedJson = JSON.parse(jsonValue);
      /**
       * There are edge cases in which JSON.parse will successfully parse a non-valid JSON object
       * (e.g. JSON.parse will parse an escaped string into an unescaped string), so adding a type check
       * of the parsed value is necessary in order to be certain that the string represents a valid JSON object.
       *
       */
      return parsedJson && typeof parsedJson === "object" ? parsedJson : null;
    } catch (error) {
      return null;
    }
  };
  /**
   * fetches the entry from the browser storage based off the key
   * @param key
   */
  BrowserCacheManager.prototype.getItem = function (key) {
    return this.browserStorage.getItem(key);
  };
  /**
   * sets the entry in the browser storage
   * @param key
   * @param value
   */
  BrowserCacheManager.prototype.setItem = function (key, value) {
    this.browserStorage.setItem(key, value);
  };
  /**
   * fetch the account entity from the platform cache
   * @param accountKey
   */
  BrowserCacheManager.prototype.getAccount = function (accountKey) {
    var account = this.getItem(accountKey);
    if (!account) {
      return null;
    }
    var parsedAccount = this.validateAndParseJson(account);
    if (!parsedAccount || !AccountEntity.isAccountEntity(parsedAccount)) {
      return null;
    }
    return CacheManager.toObject(new AccountEntity(), parsedAccount);
  };
  /**
   * set account entity in the platform cache
   * @param key
   * @param value
   */
  BrowserCacheManager.prototype.setAccount = function (account) {
    this.logger.trace("BrowserCacheManager.setAccount called");
    var key = account.generateAccountKey();
    this.setItem(key, JSON.stringify(account));
  };
  /**
   * generates idToken entity from a string
   * @param idTokenKey
   */
  BrowserCacheManager.prototype.getIdTokenCredential = function (idTokenKey) {
    var value = this.getItem(idTokenKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getIdTokenCredential: called, no cache hit"
      );
      return null;
    }
    var parsedIdToken = this.validateAndParseJson(value);
    if (!parsedIdToken || !IdTokenEntity.isIdTokenEntity(parsedIdToken)) {
      this.logger.trace(
        "BrowserCacheManager.getIdTokenCredential: called, no cache hit"
      );
      return null;
    }
    this.logger.trace("BrowserCacheManager.getIdTokenCredential: cache hit");
    return CacheManager.toObject(new IdTokenEntity(), parsedIdToken);
  };
  /**
   * set IdToken credential to the platform cache
   * @param idToken
   */
  BrowserCacheManager.prototype.setIdTokenCredential = function (idToken) {
    this.logger.trace("BrowserCacheManager.setIdTokenCredential called");
    var idTokenKey = idToken.generateCredentialKey();
    this.setItem(idTokenKey, JSON.stringify(idToken));
  };
  /**
   * generates accessToken entity from a string
   * @param key
   */
  BrowserCacheManager.prototype.getAccessTokenCredential = function (
    accessTokenKey
  ) {
    var value = this.getItem(accessTokenKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getAccessTokenCredential: called, no cache hit"
      );
      return null;
    }
    var parsedAccessToken = this.validateAndParseJson(value);
    if (
      !parsedAccessToken ||
      !AccessTokenEntity.isAccessTokenEntity(parsedAccessToken)
    ) {
      this.logger.trace(
        "BrowserCacheManager.getAccessTokenCredential: called, no cache hit"
      );
      return null;
    }
    this.logger.trace(
      "BrowserCacheManager.getAccessTokenCredential: cache hit"
    );
    return CacheManager.toObject(new AccessTokenEntity(), parsedAccessToken);
  };
  /**
   * set accessToken credential to the platform cache
   * @param accessToken
   */
  BrowserCacheManager.prototype.setAccessTokenCredential = function (
    accessToken
  ) {
    this.logger.trace("BrowserCacheManager.setAccessTokenCredential called");
    var accessTokenKey = accessToken.generateCredentialKey();
    this.setItem(accessTokenKey, JSON.stringify(accessToken));
  };
  /**
   * generates refreshToken entity from a string
   * @param refreshTokenKey
   */
  BrowserCacheManager.prototype.getRefreshTokenCredential = function (
    refreshTokenKey
  ) {
    var value = this.getItem(refreshTokenKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getRefreshTokenCredential: called, no cache hit"
      );
      return null;
    }
    var parsedRefreshToken = this.validateAndParseJson(value);
    if (
      !parsedRefreshToken ||
      !RefreshTokenEntity.isRefreshTokenEntity(parsedRefreshToken)
    ) {
      this.logger.trace(
        "BrowserCacheManager.getRefreshTokenCredential: called, no cache hit"
      );
      return null;
    }
    this.logger.trace(
      "BrowserCacheManager.getRefreshTokenCredential: cache hit"
    );
    return CacheManager.toObject(new RefreshTokenEntity(), parsedRefreshToken);
  };
  /**
   * set refreshToken credential to the platform cache
   * @param refreshToken
   */
  BrowserCacheManager.prototype.setRefreshTokenCredential = function (
    refreshToken
  ) {
    this.logger.trace("BrowserCacheManager.setRefreshTokenCredential called");
    var refreshTokenKey = refreshToken.generateCredentialKey();
    this.setItem(refreshTokenKey, JSON.stringify(refreshToken));
  };
  /**
   * fetch appMetadata entity from the platform cache
   * @param appMetadataKey
   */
  BrowserCacheManager.prototype.getAppMetadata = function (appMetadataKey) {
    var value = this.getItem(appMetadataKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getAppMetadata: called, no cache hit"
      );
      return null;
    }
    var parsedMetadata = this.validateAndParseJson(value);
    if (
      !parsedMetadata ||
      !AppMetadataEntity.isAppMetadataEntity(appMetadataKey, parsedMetadata)
    ) {
      this.logger.trace(
        "BrowserCacheManager.getAppMetadata: called, no cache hit"
      );
      return null;
    }
    this.logger.trace("BrowserCacheManager.getAppMetadata: cache hit");
    return CacheManager.toObject(new AppMetadataEntity(), parsedMetadata);
  };
  /**
   * set appMetadata entity to the platform cache
   * @param appMetadata
   */
  BrowserCacheManager.prototype.setAppMetadata = function (appMetadata) {
    this.logger.trace("BrowserCacheManager.setAppMetadata called");
    var appMetadataKey = appMetadata.generateAppMetadataKey();
    this.setItem(appMetadataKey, JSON.stringify(appMetadata));
  };
  /**
   * fetch server telemetry entity from the platform cache
   * @param serverTelemetryKey
   */
  BrowserCacheManager.prototype.getServerTelemetry = function (
    serverTelemetryKey
  ) {
    var value = this.getItem(serverTelemetryKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getServerTelemetry: called, no cache hit"
      );
      return null;
    }
    var parsedMetadata = this.validateAndParseJson(value);
    if (
      !parsedMetadata ||
      !ServerTelemetryEntity.isServerTelemetryEntity(
        serverTelemetryKey,
        parsedMetadata
      )
    ) {
      this.logger.trace(
        "BrowserCacheManager.getServerTelemetry: called, no cache hit"
      );
      return null;
    }
    this.logger.trace("BrowserCacheManager.getServerTelemetry: cache hit");
    return CacheManager.toObject(new ServerTelemetryEntity(), parsedMetadata);
  };
  /**
   * set server telemetry entity to the platform cache
   * @param serverTelemetryKey
   * @param serverTelemetry
   */
  BrowserCacheManager.prototype.setServerTelemetry = function (
    serverTelemetryKey,
    serverTelemetry
  ) {
    this.logger.trace("BrowserCacheManager.setServerTelemetry called");
    this.setItem(serverTelemetryKey, JSON.stringify(serverTelemetry));
  };
  /**
   *
   */
  BrowserCacheManager.prototype.getAuthorityMetadata = function (key) {
    var value = this.internalStorage.getItem(key);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getAuthorityMetadata: called, no cache hit"
      );
      return null;
    }
    var parsedMetadata = this.validateAndParseJson(value);
    if (
      parsedMetadata &&
      AuthorityMetadataEntity.isAuthorityMetadataEntity(key, parsedMetadata)
    ) {
      this.logger.trace("BrowserCacheManager.getAuthorityMetadata: cache hit");
      return CacheManager.toObject(
        new AuthorityMetadataEntity(),
        parsedMetadata
      );
    }
    return null;
  };
  /**
   *
   */
  BrowserCacheManager.prototype.getAuthorityMetadataKeys = function () {
    var _this = this;
    var allKeys = this.internalStorage.getKeys();
    return allKeys.filter(function (key) {
      return _this.isAuthorityMetadata(key);
    });
  };
  /**
   *
   * @param entity
   */
  BrowserCacheManager.prototype.setAuthorityMetadata = function (key, entity) {
    this.logger.trace("BrowserCacheManager.setAuthorityMetadata called");
    this.internalStorage.setItem(key, JSON.stringify(entity));
  };
  /**
   * Gets the active account
   */
  BrowserCacheManager.prototype.getActiveAccount = function () {
    var activeAccountIdKey = this.generateCacheKey(
      PersistentCacheKeys.ACTIVE_ACCOUNT
    );
    var activeAccountId = this.browserStorage.getItem(activeAccountIdKey);
    if (!activeAccountId) {
      return null;
    }
    return (
      this.getAccountInfoByFilter({ localAccountId: activeAccountId })[0] ||
      null
    );
  };
  /**
   * Sets the active account's localAccountId in cache
   * @param account
   */
  BrowserCacheManager.prototype.setActiveAccount = function (account) {
    var activeAccountIdKey = this.generateCacheKey(
      PersistentCacheKeys.ACTIVE_ACCOUNT
    );
    if (account) {
      this.logger.verbose("setActiveAccount: Active account set");
      this.browserStorage.setItem(activeAccountIdKey, account.localAccountId);
    } else {
      this.logger.verbose(
        "setActiveAccount: No account passed, active account not set"
      );
      this.browserStorage.removeItem(activeAccountIdKey);
    }
  };
  /**
   * Gets a list of accounts that match all of the filters provided
   * @param account
   */
  BrowserCacheManager.prototype.getAccountInfoByFilter = function (
    accountFilter
  ) {
    var allAccounts = this.getAllAccounts();
    return allAccounts.filter(function (accountObj) {
      if (
        accountFilter.username &&
        accountFilter.username.toLowerCase() !==
          accountObj.username.toLowerCase()
      ) {
        return false;
      }
      if (
        accountFilter.homeAccountId &&
        accountFilter.homeAccountId !== accountObj.homeAccountId
      ) {
        return false;
      }
      if (
        accountFilter.localAccountId &&
        accountFilter.localAccountId !== accountObj.localAccountId
      ) {
        return false;
      }
      if (
        accountFilter.tenantId &&
        accountFilter.tenantId !== accountObj.tenantId
      ) {
        return false;
      }
      if (
        accountFilter.environment &&
        accountFilter.environment !== accountObj.environment
      ) {
        return false;
      }
      return true;
    });
  };
  /**
   * fetch throttling entity from the platform cache
   * @param throttlingCacheKey
   */
  BrowserCacheManager.prototype.getThrottlingCache = function (
    throttlingCacheKey
  ) {
    var value = this.getItem(throttlingCacheKey);
    if (!value) {
      this.logger.trace(
        "BrowserCacheManager.getThrottlingCache: called, no cache hit"
      );
      return null;
    }
    var parsedThrottlingCache = this.validateAndParseJson(value);
    if (
      !parsedThrottlingCache ||
      !ThrottlingEntity.isThrottlingEntity(
        throttlingCacheKey,
        parsedThrottlingCache
      )
    ) {
      this.logger.trace(
        "BrowserCacheManager.getThrottlingCache: called, no cache hit"
      );
      return null;
    }
    this.logger.trace("BrowserCacheManager.getThrottlingCache: cache hit");
    return CacheManager.toObject(new ThrottlingEntity(), parsedThrottlingCache);
  };
  /**
   * set throttling entity to the platform cache
   * @param throttlingCacheKey
   * @param throttlingCache
   */
  BrowserCacheManager.prototype.setThrottlingCache = function (
    throttlingCacheKey,
    throttlingCache
  ) {
    this.logger.trace("BrowserCacheManager.setThrottlingCache called");
    this.setItem(throttlingCacheKey, JSON.stringify(throttlingCache));
  };
  /**
   * Gets cache item with given key.
   * Will retrieve from cookies if storeAuthStateInCookie is set to true.
   * @param key
   */
  BrowserCacheManager.prototype.getTemporaryCache = function (
    cacheKey,
    generateKey
  ) {
    var key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
    if (this.cacheConfig.storeAuthStateInCookie) {
      var itemCookie = this.getItemCookie(key);
      if (itemCookie) {
        this.logger.trace(
          "BrowserCacheManager.getTemporaryCache: storeAuthStateInCookies set to true, retrieving from cookies"
        );
        return itemCookie;
      }
    }
    var value = this.temporaryCacheStorage.getItem(key);
    if (!value) {
      // If temp cache item not found in session/memory, check local storage for items set by old versions
      if (
        this.cacheConfig.cacheLocation === BrowserCacheLocation.LocalStorage
      ) {
        var item = this.browserStorage.getItem(key);
        if (item) {
          this.logger.trace(
            "BrowserCacheManager.getTemporaryCache: Temporary cache item found in local storage"
          );
          return item;
        }
      }
      this.logger.trace(
        "BrowserCacheManager.getTemporaryCache: No cache item found in local storage"
      );
      return null;
    }
    this.logger.trace(
      "BrowserCacheManager.getTemporaryCache: Temporary cache item returned"
    );
    return value;
  };
  /**
   * Sets the cache item with the key and value given.
   * Stores in cookie if storeAuthStateInCookie is set to true.
   * This can cause cookie overflow if used incorrectly.
   * @param key
   * @param value
   */
  BrowserCacheManager.prototype.setTemporaryCache = function (
    cacheKey,
    value,
    generateKey
  ) {
    var key = generateKey ? this.generateCacheKey(cacheKey) : cacheKey;
    this.temporaryCacheStorage.setItem(key, value);
    if (this.cacheConfig.storeAuthStateInCookie) {
      this.logger.trace(
        "BrowserCacheManager.setTemporaryCache: storeAuthStateInCookie set to true, setting item cookie"
      );
      this.setItemCookie(key, value);
    }
  };
  /**
   * Removes the cache item with the given key.
   * Will also clear the cookie item if storeAuthStateInCookie is set to true.
   * @param key
   */
  BrowserCacheManager.prototype.removeItem = function (key) {
    this.browserStorage.removeItem(key);
    this.temporaryCacheStorage.removeItem(key);
    if (this.cacheConfig.storeAuthStateInCookie) {
      this.logger.trace(
        "BrowserCacheManager.removeItem: storeAuthStateInCookie is true, clearing item cookie"
      );
      this.clearItemCookie(key);
    }
    return true;
  };
  /**
   * Checks whether key is in cache.
   * @param key
   */
  BrowserCacheManager.prototype.containsKey = function (key) {
    return (
      this.browserStorage.containsKey(key) ||
      this.temporaryCacheStorage.containsKey(key)
    );
  };
  /**
   * Gets all keys in window.
   */
  BrowserCacheManager.prototype.getKeys = function () {
    return __spread(
      this.browserStorage.getKeys(),
      this.temporaryCacheStorage.getKeys()
    );
  };
  /**
   * Clears all cache entries created by MSAL (except tokens).
   */
  BrowserCacheManager.prototype.clear = function () {
    var _this = this;
    this.removeAllAccounts();
    this.removeAppMetadata();
    this.getKeys().forEach(function (cacheKey) {
      // Check if key contains msal prefix; For now, we are clearing all the cache items created by MSAL.js
      if (
        (_this.browserStorage.containsKey(cacheKey) ||
          _this.temporaryCacheStorage.containsKey(cacheKey)) &&
        (cacheKey.indexOf(Constants.CACHE_PREFIX) !== -1 ||
          cacheKey.indexOf(_this.clientId) !== -1)
      ) {
        _this.removeItem(cacheKey);
      }
    });
    this.internalStorage.clear();
  };
  /**
   * Add value to cookies
   * @param cookieName
   * @param cookieValue
   * @param expires
   */
  BrowserCacheManager.prototype.setItemCookie = function (
    cookieName,
    cookieValue,
    expires
  ) {
    var cookieStr =
      encodeURIComponent(cookieName) +
      "=" +
      encodeURIComponent(cookieValue) +
      ";path=/;";
    if (expires) {
      var expireTime = this.getCookieExpirationTime(expires);
      cookieStr += "expires=" + expireTime + ";";
    }
    if (this.cacheConfig.secureCookies) {
      cookieStr += "Secure;";
    }
    document.cookie = cookieStr;
  };
  /**
   * Get one item by key from cookies
   * @param cookieName
   */
  BrowserCacheManager.prototype.getItemCookie = function (cookieName) {
    var name = encodeURIComponent(cookieName) + "=";
    var cookieList = document.cookie.split(";");
    for (var i = 0; i < cookieList.length; i++) {
      var cookie = cookieList[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length, cookie.length));
      }
    }
    return "";
  };
  /**
   * Clear all msal-related cookies currently set in the browser. Should only be used to clear temporary cache items.
   */
  BrowserCacheManager.prototype.clearMsalCookies = function () {
    var _this = this;
    var cookiePrefix = Constants.CACHE_PREFIX + "." + this.clientId;
    var cookieList = document.cookie.split(";");
    cookieList.forEach(function (cookie) {
      while (cookie.charAt(0) === " ") {
        // eslint-disable-next-line no-param-reassign
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(cookiePrefix) === 0) {
        var cookieKey = cookie.split("=")[0];
        _this.clearItemCookie(cookieKey);
      }
    });
  };
  /**
   * Clear an item in the cookies by key
   * @param cookieName
   */
  BrowserCacheManager.prototype.clearItemCookie = function (cookieName) {
    this.setItemCookie(cookieName, "", -1);
  };
  /**
   * Get cookie expiration time
   * @param cookieLifeDays
   */
  BrowserCacheManager.prototype.getCookieExpirationTime = function (
    cookieLifeDays
  ) {
    var today = new Date();
    var expr = new Date(
      today.getTime() + cookieLifeDays * this.COOKIE_LIFE_MULTIPLIER
    );
    return expr.toUTCString();
  };
  /**
   * Gets the cache object referenced by the browser
   */
  BrowserCacheManager.prototype.getCache = function () {
    return this.browserStorage;
  };
  /**
   * interface compat, we cannot overwrite browser cache; Functionality is supported by individual entities in browser
   */
  BrowserCacheManager.prototype.setCache = function () {
    // sets nothing
  };
  /**
   * Prepend msal.<client-id> to each key; Skip for any JSON object as Key (defined schemas do not need the key appended: AccessToken Keys or the upcoming schema)
   * @param key
   * @param addInstanceId
   */
  BrowserCacheManager.prototype.generateCacheKey = function (key) {
    var generatedKey = this.validateAndParseJson(key);
    if (!generatedKey) {
      if (
        StringUtils.startsWith(key, Constants.CACHE_PREFIX) ||
        StringUtils.startsWith(key, PersistentCacheKeys.ADAL_ID_TOKEN)
      ) {
        return key;
      }
      return Constants.CACHE_PREFIX + "." + this.clientId + "." + key;
    }
    return JSON.stringify(key);
  };
  /**
   * Create authorityKey to cache authority
   * @param state
   */
  BrowserCacheManager.prototype.generateAuthorityKey = function (stateString) {
    var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString)
      .libraryState.id;
    return this.generateCacheKey(TemporaryCacheKeys.AUTHORITY + "." + stateId);
  };
  /**
   * Create Nonce key to cache nonce
   * @param state
   */
  BrowserCacheManager.prototype.generateNonceKey = function (stateString) {
    var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString)
      .libraryState.id;
    return this.generateCacheKey(
      TemporaryCacheKeys.NONCE_IDTOKEN + "." + stateId
    );
  };
  /**
   * Creates full cache key for the request state
   * @param stateString State string for the request
   */
  BrowserCacheManager.prototype.generateStateKey = function (stateString) {
    // Use the library state id to key temp storage for uniqueness for multiple concurrent requests
    var stateId = ProtocolUtils.parseRequestState(this.cryptoImpl, stateString)
      .libraryState.id;
    return this.generateCacheKey(
      TemporaryCacheKeys.REQUEST_STATE + "." + stateId
    );
  };
  /**
   * Gets the cached authority based on the cached state. Returns empty if no cached state found.
   */
  BrowserCacheManager.prototype.getCachedAuthority = function (cachedState) {
    var stateCacheKey = this.generateStateKey(cachedState);
    var state = this.getTemporaryCache(stateCacheKey);
    if (!state) {
      return null;
    }
    var authorityCacheKey = this.generateAuthorityKey(state);
    return this.getTemporaryCache(authorityCacheKey);
  };
  /**
   * Updates account, authority, and state in cache
   * @param serverAuthenticationRequest
   * @param account
   */
  BrowserCacheManager.prototype.updateCacheEntries = function (
    state,
    nonce,
    authorityInstance,
    loginHint,
    account
  ) {
    this.logger.trace("BrowserCacheManager.updateCacheEntries called");
    // Cache the request state
    var stateCacheKey = this.generateStateKey(state);
    this.setTemporaryCache(stateCacheKey, state, false);
    // Cache the nonce
    var nonceCacheKey = this.generateNonceKey(state);
    this.setTemporaryCache(nonceCacheKey, nonce, false);
    // Cache authorityKey
    var authorityCacheKey = this.generateAuthorityKey(state);
    this.setTemporaryCache(authorityCacheKey, authorityInstance, false);
    if (account) {
      var ccsCredential = {
        credential: account.homeAccountId,
        type: CcsCredentialType.HOME_ACCOUNT_ID,
      };
      this.setTemporaryCache(
        TemporaryCacheKeys.CCS_CREDENTIAL,
        JSON.stringify(ccsCredential),
        true
      );
    } else if (!StringUtils.isEmpty(loginHint)) {
      var ccsCredential = {
        credential: loginHint,
        type: CcsCredentialType.UPN,
      };
      this.setTemporaryCache(
        TemporaryCacheKeys.CCS_CREDENTIAL,
        JSON.stringify(ccsCredential),
        true
      );
    }
  };
  /**
   * Reset all temporary cache items
   * @param state
   */
  BrowserCacheManager.prototype.resetRequestCache = function (state) {
    var _this = this;
    this.logger.trace("BrowserCacheManager.resetRequestCache called");
    // check state and remove associated cache items
    if (!StringUtils.isEmpty(state)) {
      this.getKeys().forEach(function (key) {
        if (key.indexOf(state) !== -1) {
          _this.removeItem(key);
        }
      });
    }
    // delete generic interactive request parameters
    if (state) {
      this.removeItem(this.generateStateKey(state));
      this.removeItem(this.generateNonceKey(state));
      this.removeItem(this.generateAuthorityKey(state));
    }
    this.removeItem(this.generateCacheKey(TemporaryCacheKeys.REQUEST_PARAMS));
    this.removeItem(this.generateCacheKey(TemporaryCacheKeys.ORIGIN_URI));
    this.removeItem(this.generateCacheKey(TemporaryCacheKeys.URL_HASH));
    this.removeItem(
      this.generateCacheKey(TemporaryCacheKeys.INTERACTION_STATUS_KEY)
    );
    this.removeItem(this.generateCacheKey(TemporaryCacheKeys.CCS_CREDENTIAL));
  };
  /**
   * Removes temporary cache for the provided state
   * @param stateString
   */
  BrowserCacheManager.prototype.cleanRequestByState = function (stateString) {
    this.logger.trace("BrowserCacheManager.cleanRequestByState called");
    // Interaction is completed - remove interaction status.
    if (stateString) {
      var stateKey = this.generateStateKey(stateString);
      var cachedState = this.temporaryCacheStorage.getItem(stateKey);
      this.logger.infoPii(
        "BrowserCacheManager.cleanRequestByState: Removing temporary cache items for state: " +
          cachedState
      );
      this.resetRequestCache(cachedState || "");
    }
    this.clearMsalCookies();
  };
  /**
   * Looks in temporary cache for any state values with the provided interactionType and removes all temporary cache items for that state
   * Used in scenarios where temp cache needs to be cleaned but state is not known, such as clicking browser back button.
   * @param interactionType
   */
  BrowserCacheManager.prototype.cleanRequestByInteractionType = function (
    interactionType
  ) {
    var _this = this;
    this.logger.trace(
      "BrowserCacheManager.cleanRequestByInteractionType called"
    );
    // Loop through all keys to find state key
    this.getKeys().forEach(function (key) {
      // If this key is not the state key, move on
      if (key.indexOf(TemporaryCacheKeys.REQUEST_STATE) === -1) {
        return;
      }
      // Retrieve state value, return if not a valid value
      var stateValue = _this.temporaryCacheStorage.getItem(key);
      if (!stateValue) {
        return;
      }
      // Extract state and ensure it matches given InteractionType, then clean request cache
      var parsedState = BrowserProtocolUtils.extractBrowserRequestState(
        _this.cryptoImpl,
        stateValue
      );
      if (parsedState && parsedState.interactionType === interactionType) {
        _this.logger.infoPii(
          "BrowserCacheManager.cleanRequestByInteractionType: Removing temporary cache items for state: " +
            stateValue
        );
        _this.resetRequestCache(stateValue);
      }
    });
    this.clearMsalCookies();
  };
  BrowserCacheManager.prototype.cacheCodeRequest = function (
    authCodeRequest,
    browserCrypto
  ) {
    this.logger.trace("BrowserCacheManager.cacheCodeRequest called");
    var encodedValue = browserCrypto.base64Encode(
      JSON.stringify(authCodeRequest)
    );
    this.setTemporaryCache(
      TemporaryCacheKeys.REQUEST_PARAMS,
      encodedValue,
      true
    );
  };
  /**
   * Gets the token exchange parameters from the cache. Throws an error if nothing is found.
   */
  BrowserCacheManager.prototype.getCachedRequest = function (
    state,
    browserCrypto
  ) {
    this.logger.trace("BrowserCacheManager.getCachedRequest called");
    // Get token request from cache and parse as TokenExchangeParameters.
    var encodedTokenRequest = this.getTemporaryCache(
      TemporaryCacheKeys.REQUEST_PARAMS,
      true
    );
    if (!encodedTokenRequest) {
      throw BrowserAuthError.createNoTokenRequestCacheError();
    }
    var parsedRequest = this.validateAndParseJson(
      browserCrypto.base64Decode(encodedTokenRequest)
    );
    if (!parsedRequest) {
      throw BrowserAuthError.createUnableToParseTokenRequestCacheError();
    }
    this.removeItem(this.generateCacheKey(TemporaryCacheKeys.REQUEST_PARAMS));
    // Get cached authority and use if no authority is cached with request.
    if (StringUtils.isEmpty(parsedRequest.authority)) {
      var authorityCacheKey = this.generateAuthorityKey(state);
      var cachedAuthority = this.getTemporaryCache(authorityCacheKey);
      if (!cachedAuthority) {
        throw BrowserAuthError.createNoCachedAuthorityError();
      }
      parsedRequest.authority = cachedAuthority;
    }
    return parsedRequest;
  };
  return BrowserCacheManager;
})(CacheManager);
var DEFAULT_BROWSER_CACHE_MANAGER = function (clientId, logger) {
  var cacheOptions = {
    cacheLocation: BrowserCacheLocation.MemoryStorage,
    storeAuthStateInCookie: false,
    secureCookies: false,
  };
  return new BrowserCacheManager(
    clientId,
    cacheOptions,
    DEFAULT_CRYPTO_IMPLEMENTATION,
    logger
  );
};

export { BrowserCacheManager, DEFAULT_BROWSER_CACHE_MANAGER };
//# sourceMappingURL=BrowserCacheManager.js.map
