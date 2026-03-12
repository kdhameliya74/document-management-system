import { useDispatch } from "react-redux";
import { getURL } from "@/store/documents.slice";
import toast from "react-hot-toast";
import { FILE_MESSAGES } from "@/helpers/constants";
import { useCallback } from "react";
import DocumentService from "@/services/document.service";

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

  const downloadFolder = async ({ docId, name }) => {
    if (!docId) return;
    const toastId = toast.loading(FILE_MESSAGES.DOWNLOAD_ZIP_LOADING);
    try {
      const res = await DocumentService.downloadZip(docId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(FILE_MESSAGES.DOWNLOAD_ZIP_SUCCESS, { id: toastId })
    } catch (err) {
      toast.error(err, { id: toastId });
    }
  };

  return { downloadFile, getFileUrl, downloadFolder };
}
