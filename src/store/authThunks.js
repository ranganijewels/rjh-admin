import { apiPost } from "@/services/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await apiPost("/api/login", { email, password });

      if (!res.status) {
        return thunkAPI.rejectWithValue(res.error);
      }

      const token = res?.data?.token;
      const storeId = res?.data?.store_id;
      const onBoardingExists = res?.data?.on_boarding_exists;

      if (token) {
        localStorage.setItem("authTokenStoreAdmin", token);
        document.cookie = `token=${token}; path=/; secure; SameSite=Strict;`;
      }

      if (onBoardingExists !== undefined) {
        document.cookie = `on_boarding_exists=${onBoardingExists}; path=/; secure; SameSite=Strict;`;
      }

      if (storeId) {
        localStorage.setItem("storeId", storeId);
        document.cookie = `store_id=${storeId}; path=/; secure; SameSite=Strict;`;
      }

      localStorage.setItem("auth", JSON.stringify(res.data));

      return {
        user: res?.data?.user,
        token,
        store_id: storeId,
        on_boarding_request_status: res?.data?.on_boarding_request_status,
        on_boarding_exists: onBoardingExists,
        is_plan_purchase: res?.data?.is_plan_purchase,
        expires_at: res?.data?.expires_at,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const token = state.auth.token;

    try {
      // apiPost() (services/api.js) returns the parsed JSON body on success
      // and already throws internally on any non-2xx response — so `res.ok`
      // here was always undefined and this threw unconditionally, meaning
      // logout never got past this line to clear the token or redirect.
      await apiPost(`/api/logout`);

      localStorage.removeItem("authTokenStoreAdmin");
      localStorage.removeItem("auth");
      localStorage.removeItem("storeId");

      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; SameSite=Strict;";
      document.cookie =
        "on_boarding_exists=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; SameSite=Strict;";

      // Success/error toasts are shown by the caller (SidebarMenu's
      // .unwrap().then()/.catch()) — not duplicated here.
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
