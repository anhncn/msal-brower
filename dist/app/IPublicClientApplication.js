/*! @azure/msal-browser v2.16.1 2021-08-02 */
'use strict';
import { BrowserConfigurationAuthError } from '../error/BrowserConfigurationAuthError.js';

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var stubbedPublicClientApplication = {
    acquireTokenPopup: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    acquireTokenRedirect: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    acquireTokenSilent: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    getAllAccounts: function () {
        return [];
    },
    getAccountByHomeId: function () {
        return null;
    },
    getAccountByUsername: function () {
        return null;
    },
    getAccountByLocalId: function () {
        return null;
    },
    handleRedirectPromise: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    loginPopup: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    loginRedirect: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    logout: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    logoutRedirect: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    logoutPopup: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    ssoSilent: function () {
        return Promise.reject(BrowserConfigurationAuthError.createStubPcaInstanceCalledError());
    },
    addEventCallback: function () {
        return null;
    },
    removeEventCallback: function () {
        return;
    },
    getLogger: function () {
        throw BrowserConfigurationAuthError.createStubPcaInstanceCalledError();
    },
    setLogger: function () {
        return;
    },
    setActiveAccount: function () {
        return;
    },
    getActiveAccount: function () {
        return null;
    },
    initializeWrapperLibrary: function () {
        return;
    },
    setNavigationClient: function () {
        return;
    }
};

export { stubbedPublicClientApplication };
//# sourceMappingURL=IPublicClientApplication.js.map
