import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/browser';
import { api } from '@/lib/api';
import { clearCredentials, setCredentials } from '@/features/auth/auth-slice';
import { getSocket } from '@/lib/socket';

interface AccessTokenResponse {
  accessToken: string;
}

interface RegisterPasswordRequest {
  email: string;
  name: string;
  password: string;
}

interface LoginPasswordRequest {
  email: string;
  password: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    registerPassword: builder.mutation<
      AccessTokenResponse,
      RegisterPasswordRequest
    >({
      query: (body) => ({
        url: '/auth/register/password',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    loginPassword: builder.mutation<AccessTokenResponse, LoginPasswordRequest>({
      query: (body) => ({ url: '/auth/login/password', method: 'POST', body }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    refresh: builder.mutation<AccessTokenResponse, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        await queryFulfilled;
        dispatch(clearCredentials());
        getSocket().disconnect();
      },
    }),
    getPasskeyRegistrationOptions: builder.mutation<
      PublicKeyCredentialCreationOptionsJSON,
      { email: string; name: string }
    >({
      query: (body) => ({
        url: '/auth/register/passkey/options',
        method: 'POST',
        body,
      }),
    }),
    verifyPasskeyRegistration: builder.mutation<
      AccessTokenResponse,
      { email: string; response: RegistrationResponseJSON }
    >({
      query: (body) => ({
        url: '/auth/register/passkey/verify',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
    getPasskeyLoginOptions: builder.mutation<
      PublicKeyCredentialRequestOptionsJSON,
      { email: string }
    >({
      query: (body) => ({
        url: '/auth/login/passkey/options',
        method: 'POST',
        body,
      }),
    }),
    verifyPasskeyLogin: builder.mutation<
      AccessTokenResponse,
      { email: string; response: AuthenticationResponseJSON }
    >({
      query: (body) => ({
        url: '/auth/login/passkey/verify',
        method: 'POST',
        body,
      }),
      onQueryStarted: async (_arg, { queryFulfilled, dispatch }) => {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data));
      },
    }),
  }),
});

export const {
  useRegisterPasswordMutation,
  useLoginPasswordMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetPasskeyRegistrationOptionsMutation,
  useVerifyPasskeyRegistrationMutation,
  useGetPasskeyLoginOptionsMutation,
  useVerifyPasskeyLoginMutation,
} = authApi;
