import { Link } from "react-router";

interface NotFoundProps {
  title?: string;
}

export function NotFound({ title = "Página no encontrada" }: NotFoundProps) {
  return (
    <main className="page-container py-12 text-center text-stone-900">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-stone-600">
        Es posible que el enlace sea incorrecto o que la página ya no exista.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-full bg-brand-700 px-6 py-2 text-sm font-medium text-white hover:bg-brand-800"
      >
        Volver a la tienda
      </Link>
    </main>
  );
}
