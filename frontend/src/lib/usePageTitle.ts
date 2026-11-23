import { useEffect } from "react";

export function usePageTitle(title: string | undefined) {
    useEffect(() => {
        if (!title) return
        const previous = document.title
        document.title = `${title} · Tienda Mascotas`
        return () => {
            document.title = previous
        }
    }, [title])
}