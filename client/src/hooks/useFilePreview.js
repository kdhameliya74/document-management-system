import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getURL } from "@/store/documents.slice";
import toast from "react-hot-toast";
import { FILE_MESSAGES } from "@/helpers/constants";

export function useFilePreview(file, isViewable) {
  const dispatch = useDispatch();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadFile = async () => {
    if (!file) return;
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    } else {
      const toastId = toast.loading(FILE_MESSAGES.DOWNLOAD_LOADING);
      getFileUrl().then((res) => {
        window.open(res.url, "_blank");
      }).catch((err) => {
        toast.error(err, { id: toastId });
      }).finally(() => {
        toast.dismiss(toastId);
      });
    }
  };

  const getFileUrl = async () => {
    return await dispatch(getURL(file.id)).unwrap();
  };

  const loadPreview = useCallback(async () => {
    if (!file?.id || !isViewable) return;
    try {
      setLoading(true);
      const res = await getFileUrl();
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

  return { previewUrl, loading, retry: loadPreview, downloadFile, getFileUrl };
}
