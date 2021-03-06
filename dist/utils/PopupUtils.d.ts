import { CommonEndSessionRequest, Logger } from "@azure/msal-common";
import { BrowserCacheManager } from "../cache/BrowserCacheManager";
import { AuthorizationUrlRequest } from "../request/AuthorizationUrlRequest";
export declare class PopupUtils {
    private browserStorage;
    private logger;
    private currentWindow;
    constructor(storageImpl: BrowserCacheManager, logger: Logger);
    /**
     * @hidden
     *
     * Configures popup window for login.
     *
     * @param urlNavigate
     * @param title
     * @param popUpWidth
     * @param popUpHeight
     * @ignore
     * @hidden
     */
    openPopup(urlNavigate: string, popupName: string, popup?: Window | null): Window;
    static openSizedPopup(urlNavigate: string, popupName: string): Window | null;
    /**
     * Event callback to unload main window.
     */
    unloadWindow(e: Event): void;
    /**
     * Closes popup, removes any state vars created during popup calls.
     * @param popupWindow
     */
    cleanPopup(popupWindow?: Window): void;
    /**
     * Monitors a window until it loads a url with the same origin.
     * @param popupWindow - window that is being monitored
     */
    monitorPopupForSameOrigin(popupWindow: Window): Promise<void>;
    /**
     * Generates the name for the popup based on the client id and request
     * @param clientId
     * @param request
     */
    static generatePopupName(clientId: string, request: AuthorizationUrlRequest): string;
    /**
     * Generates the name for the popup based on the client id and request for logouts
     * @param clientId
     * @param request
     */
    static generateLogoutPopupName(clientId: string, request: CommonEndSessionRequest): string;
}
//# sourceMappingURL=PopupUtils.d.ts.map