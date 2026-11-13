import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { RequireAuth } from "./features/auth/RequireAuth";
import { StorePage } from "./features/products/StorePage";
import { SiteLayout } from "./components/SiteLayout";

const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const AdminLayout = lazy(() => import("./features/admin/AdminLayout"));
const AdminHome = lazy(() => import("./features/admin/AdminHome"));
const BrandsAdminPage = lazy(() => import("./features/brands/BrandsAdminPage"));
const CategoriesAdminPage = lazy(
  () => import("./features/categories/CategoriesAdminPage"),
);
const PetTypesAdminPage = lazy(
  () => import("./features/petTypes/PetTypesAdminPage"),
);
const ProvidersAdminPage = lazy(
  () => import("./features/providers/ProvidersAdminPage"),
);
const ProductsAdminPage = lazy(
  () => import("./features/products/ProductsAdminPage"),
);

export default function App() {
  return (
    <Suspense fallback={<p className="p-6 text-slate-500">Cargando…</p>}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="brands" element={<BrandsAdminPage />} />
              <Route path="categories" element={<CategoriesAdminPage />} />
              <Route path="pet-types" element={<PetTypesAdminPage />} />
              <Route path="providers" element={<ProvidersAdminPage />} />
              <Route path="products" element={<ProductsAdminPage />} />
            </Route>
          </Route>
          <Route
            path="*"
            element={<p className="p-6">Página no encontrada.</p>}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
