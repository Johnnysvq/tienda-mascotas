import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { SelectField, type SelectOption } from "../../components/SelectField";
import { TextField } from "../../components/TextField";
import { ApiError } from "../../lib/api";
import { errorMessage } from "../../lib/errors";
import { productImage } from "../../lib/images";
import {
  useCreateProduct,
  useUpdateProduct,
  type Product,
  type ProductInput,
  type Ref,
} from "./api";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  uploadProductImage,
} from "./imageUpload";
import { productSchema, type ProductFormValues } from "./productSchema";
import { decimalOnly, digitsOnly } from "../../lib/inputFilters";
import { saveBtnClass, cancelBtnClass } from "../../lib/buttonStyles"

export interface ProductFormOptions {
  brands: Ref[];
  categories: Ref[];
  petTypes: Ref[];
  providers: Ref[];
}

interface ProductFormProps {
  product: Product | null; // null = crear; con valor = editar
  options: ProductFormOptions;
  onDone: () => void;
}

const emptyValues: ProductFormValues = {
  description: "",
  detail: "",
  price: "",
  stock: "0",
  status: "ACTIVE",
  brandId: "",
  categoryId: "",
  petTypeId: "",
  providerId: "",
};

const formFields = [
  "description",
  "detail",
  "price",
  "stock",
  "status",
  "brandId",
  "categoryId",
  "petTypeId",
  "providerId",
] as const;

const statusOptions: SelectOption[] = [
  { value: "ACTIVE", label: "Activo (visible en la tienda)" },
  { value: "INACTIVE", label: "Inactivo (oculto)" },
];

const toOptions = (refs: Ref[]): SelectOption[] =>
  refs.map((r) => ({ value: r.id, label: r.name }));

export function ProductForm({ product, options, onDone }: ProductFormProps) {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const upload = useMutation({ mutationFn: uploadProductImage });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          description: product.description,
          detail: product.detail ?? "",
          price: String(product.price),
          stock: String(product.stock),
          status: product.status,
          brandId: String(product.brand.id),
          categoryId: String(product.category.id),
          petTypeId: String(product.petType.id),
          providerId: product.providerId ? String(product.providerId) : "",
        }
      : emptyValues,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function rejectFile(message: string, input: HTMLInputElement) {
    input.value = "";
    setFile(null);
    setPreviewUrl(null);
    setImageError(message);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setUploadedKey(null);
    setImageError(null);

    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selected.type)) {
      rejectFile("Solo se permiten imágenes JPG, PNG, WebP.", event.target);
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      rejectFile("La imagen no puede superar los 5 MB.", event.target);
      return;
    }
    setRemoveImage(false);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleRemoveImage() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
    setPreviewUrl(null);
    setUploadedKey(null);
    setImageError(null);
    setRemoveImage(true);
  }

  const currentImage =
    !removeImage && !file && product?.imageKey
      ? productImage(product.imageKey, 160)
      : undefined;
  const shownImage = previewUrl ?? currentImage;

  function handleServerError(error: unknown) {
    if (error instanceof ApiError && error.status === 400 && error.errors) {
      for (const field of formFields) {
        const message = error.errors[field];
        if (message) setError(field, { message });
      }
    }
  }

  async function onSubmit(values: ProductFormValues) {
    setImageError(null);
    let imageKey: string | null = removeImage
      ? null
      : (product?.imageKey ?? null);

    if (file) {
      try {
        // Si ya se subió y falló el guardado, se reutiliza para no duplicar la imagen
        const key = uploadedKey ?? (await upload.mutateAsync(file));
        setUploadedKey(key);
        imageKey = key;
      } catch (error) {
        setImageError(
          error instanceof ApiError
            ? errorMessage(error)
            : "No se pudo subir la imagen. Revisa el archivo e inténtalo de nuevo.",
        );
        return;
      }
    }

    const input: ProductInput = {
      description: values.description,
      detail: values.detail === "" ? null : values.detail,
      price: Number(values.price.replace(",", ".")),
      stock: Number(values.stock),
      status: values.status,
      imageKey,
      brandId: Number(values.brandId),
      categoryId: Number(values.categoryId),
      petTypeId: Number(values.petTypeId),
      providerId: Number(values.providerId),
    };

    const mutateOptions = {
      onSuccess: () => onDone(),
      onError: handleServerError,
    };
    if (product) update.mutate({ id: product.id, ...input }, mutateOptions);
    else create.mutate(input, mutateOptions);
  }

  const pending = create.isPending || update.isPending || upload.isPending;
  const failure = create.error ?? update.error;
  const hasFieldError = Object.keys(errors).length > 0;
  const generalError = failure && !hasFieldError ? errorMessage(failure) : null;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-lg border border-slate-200 bg-formBg p-4 shadow-md"
    >
      <h2 className="text-lg font-semibold">
        {product ? "Editar Producto" : "Nuevo Producto"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TextField
            id="product-description"
            label="Descripción"
            autoComplete="off"
            error={errors.description}
            registration={register("description")}
          />
        </div>
        <TextField
          id="product-price"
          label="Precio"
          inputMode="decimal"
          autoComplete="off"
          sanitize={decimalOnly}
          error={errors.price}
          registration={register("price")}
        />

        <TextField
          id="product-stock"
          label="Stock"
          inputMode="numeric"
          autoComplete="off"
          sanitize={digitsOnly}
          error={errors.stock}
          registration={register("stock")}
        />

        <SelectField
          id="product-status"
          label="Estado"
          options={statusOptions}
          error={errors.status}
          registration={register("status")}
        />

        <SelectField
          id="product-brand"
          label="Marca"
          placeholder="Selecciona…"
          options={toOptions(options.brands)}
          error={errors.brandId}
          registration={register("brandId")}
        />

        <SelectField
          id="product-category"
          label="Categoría"
          placeholder="Selecciona…"
          options={toOptions(options.categories)}
          error={errors.categoryId}
          registration={register("categoryId")}
        />

        <SelectField
          id="product-pet-type"
          label="Tipo de mascota"
          placeholder="Selecciona…"
          options={toOptions(options.petTypes)}
          error={errors.petTypeId}
          registration={register("petTypeId")}
        />

        <SelectField
          id="product-provider"
          label="Proveedor"
          placeholder="Selecciona…"
          options={toOptions(options.providers)}
          error={errors.providerId}
          registration={register("providerId")}
        />

        <div className="sm:col-span-2 lg:col-span-3">
          <label
            htmlFor="product-detail"
            className="block text-sm font-medium text-slate-700"
          >
            Detalle (opcional)
          </label>
          <textarea
            id="product-detail"
            rows={3}
            aria-invalid={errors.detail ? true : undefined}
            aria-describedby={
              errors.detail ? "product-detail-error" : undefined
            }
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-papaya focus:outline-hidden focus:ring-1 focus:ring-papaya"
            {...register("detail")}
          />
          {errors.detail && (
            <p
              id="product-detail-error"
              role="alert"
              className="mt-1 text-sm text-red-600"
            >
              {errors.detail.message}
            </p>
          )}
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label
            htmlFor="product-image"
            className="block text-sm font-medium text-slate-700"
          >
            Imagen (opcional · JPG, PNG o WebP, máx. 5 MB)
          </label>
          <div className="mt-1 flex items-center gap-4">
            {shownImage && (
              <img
                src={shownImage}
                alt="Vista previa de la imagen del producto"
                width={80}
                height={80}
                className="h-20 w-20 rounded-md border border-slate-200 object-cover"
              />
            )}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                id="product-image"
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={handleFileChange}
                className="block text-sm text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100"
              />
              {shownImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-600 hover:underline cursor-pointer"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
          {imageError && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {imageError}
            </p>
          )}
        </div>
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
          {upload.isPending
            ? "Subiendo imagen..."
            : pending
              ? "Guardando..."
              : product
                ? "Guardar cambios"
                : "Crear producto"}
        </button>
        {product && (
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
