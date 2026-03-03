import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Share2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDocuments, setSelectedId } from "@/store/documents.slice";
import { APP_VIEWS_MAP } from "@/helpers/constants";
import ROUTES from "@/utils/routes";

import PageHeader from "@/components/common/PageHeader";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import FolderItem from "@/components/dashboard/FolderItem";
import FileItem from "@/components/dashboard/FileItem";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import ResourceNotFound from "@/components/common/ResourceNotFound";
import ContextMenu from "@/components/common/ContextMenu";
import useFileFolderContextMenu from "@/hooks/useFileFolderContextMenu";

const SharePage = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { documents, isLoading, selectedId, currentFolderId } = useSelector(
    (state) => state.documentSystem,
  );

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

  const { contextMenu, handleContextMenu, closeContextMenu, getContextMenuItems } =
    useFileFolderContextMenu(APP_VIEWS_MAP.SHARED);

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

  const handleClickOutsideMain = () => {
    dispatch(setSelectedId(null));
    closeContextMenu();
  };

  return (
    <div className="relative h-full flex flex-col px-8 py-6" onClick={handleClickOutsideMain}>
      <PageHeader>
        <PageHeader.Left title="Shared with me" subtitle="Viewing shared content" />
      </PageHeader>

      <div className="mb-6">
        <Breadcrumb mode={APP_VIEWS_MAP.SHARED} currentFolderId={folderId || currentFolderId} />
      </div>
      <div className="flex-1 relative flex flex-col min-h-0">
        {isRefreshing && <Loading text="Refreshing items all..." />}
        {isEmpty && !isLoading ? (
          <EmptyState
            icon={<Share2 />}
            title="No shared items"
            description="Items that others share with you will appear here. You can collaborate on documents and folders in real-time."
          />
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
                    onSelect={handleSelect}
                    onContextMenu={handleContextMenu}
                  />
                ) : (
                  <FileItem
                    key={document.id}
                    file={document}
                    isSelected={selectedId === document.id}
                    onSelect={handleSelect}
                    onContextMenu={handleContextMenu}
                  />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default SharePage;
