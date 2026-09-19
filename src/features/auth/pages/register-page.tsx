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
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/auth-schemas';
import { useRegisterPasswordMutation } from '@/features/auth/auth-api';
import { usePasskeyAuth } from '@/features/auth/use-passkey-auth';
import { getErrorMessage } from '@/lib/error-message';

export function RegisterPage() {
  const navigate = useNavigate();
  const [registerPassword, { isLoading }] = useRegisterPasswordMutation();
  const { registerWithPasskey, isLoading: isPasskeyLoading } = usePasskeyAuth();

  const { control, handleSubmit, getValues } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerPassword(values).unwrap();
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  });

  async function handlePasskeyRegister() {
    const { email, name } = getValues();
    if (!email || !name) {
      toast.error('Enter your name and email first');
      return;
    }
    try {
      await registerWithPasskey(email, name);
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Get started managing your team's work"
      footer={
        <>
          Already have an account?&nbsp;
          <Link
            to="/login"
            className="text-foreground font-medium underline underline-offset-4"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Ada Lovelace"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
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
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2Icon className="animate-spin" />}
              Create account
            </Button>
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field>
            <Button
              type="button"
              variant="outline"
              disabled={isPasskeyLoading}
              onClick={handlePasskeyRegister}
            >
              {isPasskeyLoading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <KeyRoundIcon />
              )}
              Create with a passkey instead
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </AuthLayout>
  );
}
