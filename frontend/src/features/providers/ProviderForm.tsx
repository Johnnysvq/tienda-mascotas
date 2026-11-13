import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField } from "../../components/TextField";
import { ApiError } from "../../lib/api";
import { errorMessage } from "../../lib/errors";
import {
  useCreateProvider,
  useUpdateProvider,
  type Provider,
  type ProviderInput,
} from "./api";
import { providerSchema, type ProviderFormValues } from "./providerSchema";
import { saveBtnClass, cancelBtnClass } from "../../lib/buttonStyles";

const empyValues: ProviderFormValues = { name: "", phoneNumber: "", email: "" };
const formFields = ["name", "phoneNumber", "email"] as const;

interface ProviderFormProps {
  provider: Provider | null;
  onDone: () => void;
}

export function ProviderForm({ provider, onDone }: ProviderFormProps) {
  const create = useCreateProvider();
  const update = useUpdateProvider();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: provider
      ? {
          name: provider.name,
          phoneNumber: provider.phoneNumber ?? "",
          email: provider.email,
        }
      : empyValues,
  });

  const pending = create.isPending || update.isPending;
  const failure = create.error ?? update.error;

  // Los errores que el servidor atriibuye a un campo se muestran junto a el
  function handleServerError(error: unknown) {
    if (!(error instanceof ApiError)) return;
    if (error.status === 409) {
      // El backend avisa de nombre repetido o de correo repetido
      setError(
        error.message.toLowerCase().includes("correo") ? "email" : "name",
        {
          message: error.message,
        },
      );
    } else if (error.status === 400 && error.errors) {
      for (const field of formFields) {
        const message = error.errors[field];
        if (message) setError(field, { message });
      }
    }
  }

  function onSubmit(values: ProviderFormValues) {
    const input: ProviderInput = {
      name: values.name,
      // El backend no acepta "" en el telefono, si esta vacio se envia null
      phoneNumber: values.phoneNumber === "" ? null : values.phoneNumber,
      email: values.email,
    };
    const options = {
      onSuccess: () => {
        reset(empyValues);
        onDone();
      },
      onError: handleServerError,
    };
    if (provider) update.mutate({ id: provider.id, ...input }, options);
    else create.mutate(input, options);
  }

  const hasFieldError = Boolean(
    errors.name || errors.phoneNumber || errors.email,
  );
  const generalError = failure && !hasFieldError ? errorMessage(failure) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-lg border border-slate-200 bg-formBg p-4 shadow-md"
    >
      <h2 className="text-lg font-semibold">
        {provider ? "Editar Proveedor" : "Nuevo Proveedor"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id="provider-name"
          label="Nombre"
          autoComplete="off"
          error={errors.name}
          registration={register("name")}
        />
        <TextField
          id="provider-email"
          label="Correo"
          type="email"
          autoComplete="off"
          error={errors.email}
          registration={register("email")}
        />
        <TextField
          id="provider-phone"
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="off"
          error={errors.phoneNumber}
          registration={register("phoneNumber")}
        />
      </div>

      {generalError && (
        <p role="alert" className="text-sm text-red-600">
          {generalError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className={saveBtnClass}
        >
          {pending
            ? "Guardando..."
            : provider
              ? "Guardar cambios"
              : "Crear proveedor"}
        </button>
        {provider && (
          <button
            type="button"
            onClick={onDone}
            className={cancelBtnClass}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
