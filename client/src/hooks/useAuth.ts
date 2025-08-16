import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: () => fetch('/api/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
