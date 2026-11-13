import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Page } from "../../lib/types";

export interface Provider {
  id: number;
  name: string;
  phoneNumber: string | null;
  email: string;
  createdAt: string;
}

export interface ProviderInput {
  name: string;
  phoneNumber: string;
  email: string;
}

export function useProviders(page = 0) {
    return useQuery({
      queryKey: ['providers', page],
      queryFn: ({ signal }) => api<Page<Provider>>(`/providers?page=${page}&size=20`, { signal }),
      staleTime: 60_000,
      placeholderData: keepPreviousData,
    })
  }

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProviderInput) =>
      api<Provider>("/providers", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }),
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProviderInput & { id: number }) =>
      api<Provider>(`/providers/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }),
  });
}

export function useDeleteProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      api<void>(`/providers/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["providers"] }),
  });
}
