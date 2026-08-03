import { useState, useEffect, useCallback } from 'react';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  token?: string | null;
}

export function usePagination<T>(url: string, options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 50, token } = options;
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const separator = url.includes('?') ? '&' : '?';
      const res = await fetch(`${url}${separator}page=${page}&limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result: PaginatedResult<T> = await res.json();
      setData(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [url, page, limit, token]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, total, page, limit, totalPages, loading, error, setPage, setLimit, refresh: fetchData };
}
