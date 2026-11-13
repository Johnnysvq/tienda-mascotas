import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Pagination } from "../../components/Pagination";
import { errorMessage } from "../../lib/errors";
import { formatPrice } from "../../lib/format";
import { productImage } from "../../lib/images";
import { useAdminProducts, useDeleteProduct, type Product } from "./api";
import { useOptions } from "./options";
import { ProductForm, type ProductFormOptions } from "./ProductForm";
import { deleteBtnClass, editBtnClass } from "../../lib/buttonStyles";
import { Edit2, Trash2 } from 'reicon-react';

export default function ProductsAdminPage() {
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isPending, isError, isPlaceholderData } =
    useAdminProducts(page);
  const remove = useDeleteProduct();

  const brands = useOptions("brands");
  const categories = useOptions("categories");
  const petTypes = useOptions("pet-types");
  const providers = useOptions("providers");

  const options: ProductFormOptions | null =
    brands.data && categories.data && petTypes.data && providers.data
      ? {
          brands: brands.data.content,
          categories: categories.data.content,
          petTypes: petTypes.data.content,
          providers: providers.data.content,
        }
      : null;

  const optionsFailed =
    brands.isError ||
    categories.isError ||
    petTypes.isError ||
    providers.isError;
  const missingOptions =
    options !== null &&
    (options.brands.length === 0 ||
      options.categories.length === 0 ||
      options.petTypes.length === 0 ||
      options.providers.length === 0);

  function finishForm() {
    setEditing(null);
    setFormVersion((v) => v + 1);
  }

  function confirmDelete() {
    if (!toDelete) return;
    const wasLastOnPage = data?.content.length === 1 && page > 0;
    const deletedId = toDelete.id;

    remove.mutate(deletedId, {
      onSuccess: () => {
        setToDelete(null);
        if (wasLastOnPage) setPage((p) => p - 1);
        if (editing?.id === deletedId) finishForm();
      },
      onError: (error) => {
        setToDelete(null);
        setDeleteError(errorMessage(error));
      },
    });
  }

  return (
    <section className="space-y-6">

      {!options && !optionsFailed && (
        <p className="text-slate-500">Cargando formulario...</p>
      )}
      {optionsFailed && (
        <p role="alert" className="text-red-600">
          No se pudieron cargar las listas de marcas, categorías, tipos o
          proveedores.
        </p>
      )}

      {missingOptions && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Para crear productos debe existir al menos una marca, una categoría,
          un tipo de mascota y un proveedor.
        </p>
      )}

      {options && (
        <ProductForm
          key={`${editing?.id ?? "new"}-${formVersion}`}
          product={editing}
          options={options}
          onDone={finishForm}
        />
      )}

      {deleteError && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {deleteError}
        </p>
      )}

      {isPending && <p className="text-slate-500">Cargando productos...</p>}
      {isError && (
        <p role="alert" className="text-red-600">
          No se pudo cargar la lista de productos.
        </p>
      )}

      {data && data.content.length === 0 && (
        <p className="text-slate-500">Aún no hay productos.</p>
      )}

      {data && data.content.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-md">
            <table
              className={`w-full text-left text-sm ${isPlaceholderData ? "opacity-60" : ""}`}
            >
              <thead className="border-b border-slate-200 bg-papaya text-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Imagen
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Descripción
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Marca
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Categoría
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Tipo
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Precio
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-tableBg">
                {data.content.map((product) => {
                  const thumb = productImage(product.imageKey, 96);
                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-slate-100" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {product.description}
                      </td>
                      <td className="px-4 py-3 font-medium">{product.brand.name}</td>
                      <td className="px-4 py-3 font-medium">{product.category.name}</td>
                      <td className="px-4 py-3 font-medium">{product.petType.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      {formatPrice(product.price)}  
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{product.stock}</td>
                      <td className="px-4 py-3 font-medium">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-200 text-red-700"
                          }`}
                        >
                          {product.status === "ACTIVE" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={editBtnClass}
                            aria-label={`Editar ${product.description}`}
                            onClick={() => {
                              setDeleteError(null);
                              setEditing(product);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <Edit2 size={24} color="black"/>
                          </button>
                          <button
                            type="button"
                            className={deleteBtnClass}
                            aria-label={`Eliminar ${product.description}`}
                            onClick={() => {
                              setDeleteError(null);
                              setToDelete(product);
                            }}
                          >
                            <Trash2 size={24} color="black"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page.number}
            totalPages={data.page.totalPages}
            onPageChange={setPage}
            disabled={isPlaceholderData}
          />
        </>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${toDelete?.description ?? ""}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        pending={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </section>
  );
}
