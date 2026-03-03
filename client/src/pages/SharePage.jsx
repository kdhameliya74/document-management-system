import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDocuments } from "@/store/documentSystemSlice";
import { APP_VIEWS_MAP } from "@/helpers/constants";
import ROUTES from "@/utils/routes";

import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import EmptyFolderScreen from "@/components/dashboard/EmptyFolderScreen";
import FolderItem from "@/components/dashboard/FolderItem";
import FileItem from "@/components/dashboard/FileItem";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import ResourceNotFound from "@/components/common/ResourceNotFound";
import toast from "react-hot-toast";

const SharePage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { documents, isLoading, selectedId, currentFolderId } = useSelector((state) => state.documentSystem);

  const normalizedFolderId = folderId || APP_VIEWS_MAP.SHARED;
  const currentFolder = documents[normalizedFolderId];

  const isInitialLoading = isLoading && !currentFolder;
  const isRefreshing = isLoading && !!currentFolder;

  useEffect(() => {
    const parentId = normalizedFolderId === APP_VIEWS_MAP.SHARED ? null : normalizedFolderId;

    const loadSharedDocuments = async () => {
      try {
        await dispatch(fetchDocuments({ parentId, mode: APP_VIEWS_MAP.SHARED })).unwrap();
      } catch (err) {
        toast.error(err);
      }
    };

    loadSharedDocuments();
  }, [folderId, dispatch]); // eslint-disable-line

  const handleNavigate = (id) => {
    navigate(ROUTES.APP.SHARED_DYNAMIC(id));
  };

  const handleSelect = (id) => {
    dispatch(setSelectedId(id));
  };

  const childDocuments = useMemo(
    () => currentFolder?.childDocuments?.map((id) => documents[id]).filter(Boolean) || [],
    [currentFolder?.childDocuments, documents],
  );

  const isEmpty = childDocuments.length === 0;
  // 🔥 Full page loader (initial load)
  if (isInitialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading text="Refreshing items..." />
      </div>
    );
  }

  // 🔥 404
  if (!isLoading && !currentFolder) {
    return <ResourceNotFound />;
  }

  return (
    <div className="relative h-full flex flex-col px-8 py-6">
      <PageHeader>
        <PageHeader.Left title="Shared with me" subtitle="Viewing shared content" />
      </PageHeader>

      <div className="mb-6">
        <Breadcrumb mode={APP_VIEWS_MAP.SHARED} currentFolderId={folderId || currentFolderId} />
      </div>
      <div className="flex-1 relative flex flex-col min-h-0">
        {isRefreshing && <Loading text="Refreshing items all..." />}
        {isEmpty && !isLoading ? (
          <EmptyFolderScreen />
        ) : (
          <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-5 py-2">
              {childDocuments.map((document) =>
                document.docType === "folder" ? (
                  <FolderItem
                    key={document.id}
                    folder={document}
                    isSelected={selectedId === document.id}
                    onNavigate={handleNavigate}
                  />
                ) : (
                  <FileItem
                    key={document.id}
                    file={document}
                    isSelected={selectedId === document.id}
                    onSelect={handleSelect}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePage;
