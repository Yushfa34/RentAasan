import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getMe } from "@/lib/api";

export const meQuery = queryOptions({ queryKey: ["me"], queryFn: getMe, staleTime: 60_000 });

export function useMe() {
  const { data } = useSuspenseQuery(meQuery);
  if (!data) throw new Error("Not signed in");
  return data;
}
