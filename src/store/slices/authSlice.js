import { createSlice } from "@reduxjs/toolkit";
import { loginUser, logoutUser } from "../authThunks";
import { loadAuthState } from "../authStorage";

const persistedAuth = loadAuthState();

const initialState = persistedAuth || {
  user: null,
  loading: false,
  error: null,
  token: null,
  on_boarding_request_status: "",
  on_boarding_exists: false,
  business_needs_exists: false,
  store_id: null,
  is_plan_purchase: false,
  expires_at: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateuser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, token, on_boarding_exists, expires_at } = action.payload;
        state.loading = false;
        state.user = user;
        state.token = token;
        state.on_boarding_exists = on_boarding_exists;
        state.expires_at = expires_at;

        if (typeof window !== "undefined") {
          localStorage.setItem("auth", JSON.stringify(state));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { logout, updateCustomer } = authSlice.actions;
export default authSlice.reducer;
