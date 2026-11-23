import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { TextField } from "../../components/TextField";
import { ApiError } from "../../lib/api";
import { phoneOnly } from "../../lib/inputFilters";
import { usePageTitle } from "../../lib/usePageTitle";
import { useCurrentUser, useRegister, type RegisterInput } from "./api";
import { registerSchema, type RegisterFormValues } from "./registerSchema";

const serverFields = [
  "firstName",
  "lastName",
  "email",
  "phoneNumber",
  "password",
] as const;

function registerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429)
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    if (error.status === 403)
      return "La sesión de seguridad expiró. Recarga la página e inténtalo de nuevo.";
    if (error.status === 400) return error.message;
  }
  return "No se pudo crear la cuenta. Inténtalo de nuevo.";
}

export default function RegisterPage() {
  usePageTitle("Crear cuenta");
  const { data: user, isPending } = useCurrentUser();
  const signUp = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Esperar a /auth/me garantiza que ya existe la cookie CSRF antes de enviar el formulario
  if (isPending)
    return <p className="page-container py-6 text-slate-500">Caragando...</p>;
  if (user) return <Navigate to="/" replace />;

  function handleServerError(error: unknown) {
    resetField("password");
    resetField("confirmPassword");
    if (!(error instanceof ApiError)) return;

    if (error.status === 409) {
      setError("email", { message: error.message });
    } else if (error.status === 400 && error.errors) {
      for (const field of serverFields) {
        const message = error.errors[field];
        if (message) setError(field, { message });
      }
    }
  }

  function onSubmit(values: RegisterFormValues) {
    const input: RegisterInput = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber === "" ? null : values.phoneNumber,
    };
    signUp.mutate(input, {
      onSuccess: ({ loggedIn }) => {
        if (!loggedIn)
          navigate("/login", { replace: true, state: { registered: true } });
      },
      onError: handleServerError,
    });
  }

  const generalError =
    signUp.isError && Object.keys(errors).length === 0
      ? registerErrorMessage(signUp.error)
      : null;

  return (
    <main className="page-container flex justify-center py-10 text-stone-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold">Crear cuenta</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="register-first-name"
            label="Nombre"
            autoComplete="given-name"
            error={errors.firstName}
            registration={register("firstName")}
          />
          <TextField
            id="register-last-name"
            label="Apellidos"
            autoComplete="family-name"
            error={errors.lastName}
            registration={register("lastName")}
          />
        </div>

        <TextField
          id="register-email"
          label="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email}
          registration={register("email")}
        />

        <TextField
          id="register-phone"
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          sanitize={phoneOnly}
          error={errors.phoneNumber}
          registration={register("phoneNumber")}
        />

        <TextField
          id="register-password"
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 10 caracteres. Una frase larga es mejor que una palabra con símbolos."
          error={errors.password}
          registration={register("password")}
        />

        <TextField
          id="register-confirm-password"
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          registration={register("confirmPassword")}
        />

        {generalError && (
          <p role="alert" className="text-sm text-red-600">
            {generalError}
          </p>
        )}

        <button
          type="submit"
          disabled={signUp.isPending}
          className="w-full cursor-pointer rounded-md bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signUp.isPending ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-stone-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-700 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
