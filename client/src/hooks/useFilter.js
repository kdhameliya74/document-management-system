import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { APP_VIEWS_MAP } from "@/helpers/constants";

export const useFilter = () => {
  const { folderId } = useParams();
  const normalizedFolderId = folderId || APP_VIEWS_MAP.FOLDERS;
  const { documents, filters } = useSelector((state) => state.documentSystem);
  const currentFolder = documents[normalizedFolderId];

  const filteredDocuments = useMemo(() => {
    const childDocuments =
      currentFolder?.childDocuments?.map((id) => documents[id]).filter(Boolean) || [];

    let result = childDocuments;

    if (filters?.color) {
      result = result.filter((doc) => doc.color === filters.color);
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      switch (filters?.sortBy) {
        case "date_desc":
          return dateB - dateA;
        case "date_asc":
          return dateA - dateB;
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [currentFolder, documents, filters]);

  return {
    childDocuments: filteredDocuments,
    isEmpty: filteredDocuments.length === 0,
  };
};
