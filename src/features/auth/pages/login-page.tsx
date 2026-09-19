import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { KeyRoundIcon, Loader2Icon } from 'lucide-react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { AuthLayout } from '@/features/auth/components/auth-layout';
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/auth-schemas';
import { useLoginPasswordMutation } from '@/features/auth/auth-api';
import { usePasskeyAuth } from '@/features/auth/use-passkey-auth';
import { getErrorMessage } from '@/lib/error-message';

export function LoginPage() {
  const navigate = useNavigate();
  const [loginPassword, { isLoading }] = useLoginPasswordMutation();
  const { loginWithPasskey, isLoading: isPasskeyLoading } = usePasskeyAuth();

  const { control, handleSubmit, getValues } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginPassword(values).unwrap();
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  });

  async function handlePasskeyLogin() {
    const email = getValues('email');
    if (!email) {
      toast.error('Enter your email first');
      return;
    }
    try {
      await loginWithPasskey(email);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Log in to your account to continue"
      footer={
        <>
          Don&apos;t have an account?&nbsp;
          <Link
            to="/register"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="you@example.com"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="animate-spin" />}
              Log in
            </Button>
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <Button
              type="button"
              variant="outline"
              disabled={isPasskeyLoading}
              onClick={handlePasskeyLogin}
            >
              {isPasskeyLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <KeyRoundIcon />
              )}
              Continue with a passkey
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
