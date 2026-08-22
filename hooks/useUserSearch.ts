"use client";

import { useEffect, useMemo, useState } from "react";
import { searchUsers } from "@/lib/api/endpoints";
import type { User } from "@/lib/api/types";

/**
 * Debounced `/users/search` lookup, shared by "start a chat" and "add
 * people to a group". An empty query returns the API's full user list
 * (confirmed live — `q` is an optional filter, not required), which
 * would dump the whole directory into the picker, so this only searches
 * once the user has typed at least 2 characters and shows a prompt
 * instead of an empty-looking list before that.
 */
export function useUserSearch(excludeIds: string[] = []) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excludeKey = excludeIds.join(",");

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function run() {
      const trimmed = query.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      timer = setTimeout(() => {
        searchUsers(trimmed)
          .then((users) => {
            if (cancelled) return;
            const exclude = new Set(excludeKey ? excludeKey.split(",") : []);
            setResults(users.filter((u) => !exclude.has(u.id)));
          })
          .catch((err) => {
            if (cancelled) return;
            setError(err instanceof Error ? err.message : "Search failed.");
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      }, 300);
    }

    run();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [query, excludeKey]);

  return useMemo(
    () => ({ query, setQuery, results, loading, error }),
    [query, results, loading, error],
  );
}
