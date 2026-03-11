import { useDispatch } from "react-redux";
import { getURL } from "@/store/documents.slice";
import toast from "react-hot-toast";
import { FILE_MESSAGES } from "@/helpers/constants";
import { useCallback } from "react";

export function useDownloadDocument() {
  const dispatch = useDispatch();
  const getURLAndDownload = async (docId) => {
    const toastId = toast.loading(FILE_MESSAGES.DOWNLOAD_LOADING);
    try {
      const res = await dispatch(getURL(docId)).unwrap();
      toast.dismiss(toastId);
      return res?.url;
    } catch (err) {
      toast.error(err, { id: toastId });
    }
  };
  const downloadFile = async ({ url, force, docId }) => {
    let downloadUrl = url;
    if (force) {
      downloadUrl = await getURLAndDownload(docId);
    }
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank");
  };

  const getFileUrl = useCallback(
    async (docId) => {
      return await dispatch(getURL(docId)).unwrap();
    },
    [dispatch],
  );

  return { downloadFile, getFileUrl };
}
