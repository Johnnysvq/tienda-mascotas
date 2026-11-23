import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

interface NavSearchProps {
  variant: "onDark" | "onLight"; // Segun el fondo del navbar
  className?: string;
  onSearched?: () => void; //
}

export function NavSearch({
  variant,
  className = "",
  onSearched,
}: NavSearchProps) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const onStore = pathname === "/";
  const urlValue = onStore ? (params.get("q") ?? "") : "";

  const [text, setText] = useState(urlValue);
  const [previous, setPrevious] = useState(urlValue);
  const timer = useRef<number | undefined>(undefined);

  if (urlValue !== previous) {
    setPrevious(urlValue);
    if (text.trim() !== urlValue) setText(urlValue);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function search(value: string) {
    const next = new URLSearchParams(onStore ? params : undefined);
    if (value) next.set("q", value);
    else next.delete("q");
    next.delete("page");
    const query = next.toString();
    navigate(
      { pathname: "/", search: query ? `?${query}` : "" },
      { replace: onStore },
    );
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setText(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => search(next.trim()), 400);
  }

  // Enter busca al instante, sin esperar la pausa
  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    window.clearTimeout(timer.current);
    search(text.trim());
    onSearched?.();
  }

  const inputClass =
    variant === "onDark"
      ? "bg-white/15 text-white placeholder:text-white/70 focus:bg-white/25 focus:ring-naranja/60"
      : "bg-stone-100 text-stone-800 placeholder:text-stone-500 focus:bg-white focus:ring-verdeMen";

  const searchIconColor = 
    variant === "onDark"
      ? "#cb6330"
      : "#83b4ae"

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative ${className}`}
    >
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
        aria-hidden="true"
        color={searchIconColor}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        aria-label="Buscar productos"
        value={text}
        onChange={handleChange}
        maxLength={100}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Buscar productos"
        className={`w-full rounded-full border-0 py-2 pl-9 pr-4 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-2 ${inputClass}`}
      />
    </form>
  );
}
