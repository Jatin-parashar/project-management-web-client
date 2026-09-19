import { useState } from 'react';
import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import {
  useGetPasskeyLoginOptionsMutation,
  useGetPasskeyRegistrationOptionsMutation,
  useVerifyPasskeyLoginMutation,
  useVerifyPasskeyRegistrationMutation,
} from '@/features/auth/auth-api';

export function usePasskeyAuth() {
  const [getRegistrationOptions] = useGetPasskeyRegistrationOptionsMutation();
  const [verifyRegistration] = useVerifyPasskeyRegistrationMutation();
  const [getLoginOptions] = useGetPasskeyLoginOptionsMutation();
  const [verifyLogin] = useVerifyPasskeyLoginMutation();
  const [isLoading, setIsLoading] = useState(false);

  async function registerWithPasskey(email: string, name: string) {
    setIsLoading(true);
    try {
      const optionsJSON = await getRegistrationOptions({
        email,
        name,
      }).unwrap();
      const response = await startRegistration({ optionsJSON });
      await verifyRegistration({ email, response }).unwrap();
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithPasskey(email: string) {
    setIsLoading(true);
    try {
      const optionsJSON = await getLoginOptions({ email }).unwrap();
      const response = await startAuthentication({ optionsJSON });
      await verifyLogin({ email, response }).unwrap();
    } finally {
      setIsLoading(false);
    }
  }

  return { registerWithPasskey, loginWithPasskey, isLoading };
}
