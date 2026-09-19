import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { decodeAccessToken } from '@/lib/jwt';
import type { RootState } from '@/app/store';

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  // True until the initial POST /auth/refresh (fired once on app load to
  // trade the httpOnly cookie for an access token) has settled. Route guards
  // read this so they can wait for a real answer instead of assuming
  // "logged out" for the split second before that request resolves.
  isBootstrapping: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isBootstrapping: true,
};

// Access token lives in the Redux store's in-memory state only — never
// persisted to localStorage/sessionStorage — so an XSS payload can't read it
// off disk. The refresh token is a separate httpOnly cookie the browser
// controls, invisible to any JS on this page.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      const claims = decodeAccessToken(action.payload.accessToken);
      state.accessToken = action.payload.accessToken;
      state.user = { userId: claims.sub, email: claims.email };
      state.isBootstrapping = false;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isBootstrapping = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsBootstrapping = (state: RootState) =>
  state.auth.isBootstrapping;
