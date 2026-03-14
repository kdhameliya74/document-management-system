import { useState, useEffect, useRef, useCallback } from "react";
import DocumentService from "@/services/document.service";
import { debounce } from "@/helpers/utils";
export const useGlobalSearch = (query, limit = 10) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const queryRef = useRef(query);

    useEffect(() => {
        queryRef.current = query;
    }, [query]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setTotalResults(0);
            setHasMore(false);
            setPage(1);
            return;
        }

        const fetchInitialResults = debounce(async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await DocumentService.globalSearch(query, 1, limit);
                if (queryRef.current !== query) return;
                setResults(response.documents);
                setTotalResults(response.total);
                setHasMore(response.hasMore);
                setPage(1);
            } catch (err) {
                if (queryRef.current !== query) return;
                setError(err);
                setResults([]);
            } finally {
                if (queryRef.current === query) {
                    setLoading(false);
                }
            }
        }, 300);

        fetchInitialResults();
    }, [query, limit]);

    const loadMore = useCallback(async () => {
        if (loading || loadingMore || !hasMore || !query) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await DocumentService.globalSearch(query, nextPage, limit);
            if (queryRef.current !== query) return;
            setResults((prev) => [...prev, ...response.documents]);
            setHasMore(response.hasMore);
            setPage(nextPage);
        } catch (err) {
            setError(err);
        } finally {
            setLoadingMore(false);
        }
    }, [query, page, limit, loading, loadingMore, hasMore]);

    return { results, loading, loadingMore, error, hasMore, totalResults, loadMore };
};