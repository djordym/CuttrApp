import axios from "axios";
import { store } from "../store"; // your Redux store
import { refreshTokenThunk, logout } from "../features/auth/store/authSlice";
import { setGlobalError } from "../store/slices/globalErrorSlice";
import { RootState } from "../store"; // your root state type
import { AuthTokenResponse } from "../types/apiTypes";
import { log } from "../utils/logger";
import { storage } from "../utils/storage"; // Import storage to clear tokens

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const api = axios.create({
  baseURL:
    "https://cuttrapi-epfvarfnb9bccdcn.westeurope-01.azurewebsites.net/api",
  timeout: 15000,
});

// ────────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ────────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    // Do not attach the Authorization header for refresh requests.
    if (config.url && config.url.includes("/auth/refresh")) {
      log.debug("API Request (refresh)", {
        baseUrl: api.defaults.baseURL,
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers,
      });
      return config;
    }
    log.debug("API Request", {
      baseUrl: api.defaults.baseURL,
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });
    const state: RootState = store.getState();
    const token = state.auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    log.error("API Request Error", error);
    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ────────────────────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    log.debug("API Response", {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  async (error) => {
    // If there's no response (network error), dispatch a global error and do not log out.
    if (!error.response) {
      store.dispatch(
        setGlobalError("Network Error: Unable to connect.")
      );
      return Promise.reject(error);
    }

    const { status } = error.response;
    const originalRequest = error.config;

    // ─────────────────────────────────────────────────────────────
    // 1. If the failing request is the refresh endpoint itself,
    // clear tokens and force logout.
    // ─────────────────────────────────────────────────────────────
    if (
      originalRequest.url &&
      originalRequest.url.includes("/auth/refresh")
    ) {
      log.error(
        "Refresh endpoint failed. Forcing logout.",
        error.response.data
      );
      await storage.clearTokens();
      store.dispatch(logout());
      return Promise.reject(error);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Handle 401 Unauthorized for token refresh for other requests.
    // ─────────────────────────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        try {
          log.debug("Refreshing token...");
          const result = await store.dispatch(refreshTokenThunk());
          let newTokens: AuthTokenResponse | undefined;
          if (refreshTokenThunk.fulfilled.match(result)) {
            newTokens = result.payload;
            log.debug("New tokens:", newTokens);
          } else {
            log.error(
              "Token refresh failed:",
              result.payload || result.error.message
            );
          }
          isRefreshing = false;
          pendingRequests.forEach((cb) =>
            cb(newTokens?.accessToken || "")
          );
          pendingRequests = [];
          // Retry the original request with the new token.
          return api(originalRequest);
        } catch (refreshError) {
          log.error("Refresh token failed, logging out:", refreshError);
          isRefreshing = false;
          pendingRequests = [];
          await storage.clearTokens();
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }
      // If a refresh is already in progress, queue this request.
      return new Promise((resolve) => {
        pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. For other errors, extract an error message and dispatch it globally.
    // ─────────────────────────────────────────────────────────────
    let errorMessage: string;
    if (typeof error.response.data === "string") {
      errorMessage = error.response.data;
    } else if (error.response.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = "An error occurred. Please try again later.";
    }
    store.dispatch(setGlobalError(errorMessage));
    return Promise.reject(error);
  }
);

export default api;
