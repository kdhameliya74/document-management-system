import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getPreviewUrl } from "@/store/documents.slice";
import toast from "react-hot-toast";

export function useFilePreview(file, isViewable) {
    const dispatch = useDispatch();
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPreview = useCallback(async () => {
        if (!file?.id || !isViewable) return;

        try {
            setLoading(true);
            const res = await dispatch(getPreviewUrl(file.id)).unwrap();
            setPreviewUrl(res.url);
        } catch (err) {
            toast.error(err);
        } finally {
            setLoading(false);
        }
    }, [file?.id, isViewable, dispatch]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    return { previewUrl, loading, retry: loadPreview };
}