import { useNavigate } from "react-router-dom";
import { Folder, ChevronRight, Search, Loader2 } from "lucide-react";
import { FOLDER_COLORS } from "@/helpers/constants.js";
import FileIcon from "@/components/common/FileIcon";
import ROUTES from "@/utils/routes";

const GlobalSearchResults = ({
  isSearchFocused,
  searchQuery,
  results,
  totalResults,
  loading,
  loadingMore,
  hasMore,
  loadMore,
}) => {
  const navigate = useNavigate();
  if (!isSearchFocused || searchQuery.length === 0) return null;
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (hasMore && !loading && !loadingMore && loadMore) {
        loadMore();
      }
    }
  };

  const navigateTo = (result) => {
    const id = result.docType === "folder" ? result.id : result.parentId;
    navigate(ROUTES.APP.FOLDER_DYNAMIC(id));
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-bg-panel border border-border-main rounded-2xl shadow-xl overflow-hidden z-20 flex flex-col max-h-[400px] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-border-muted flex items-center justify-between bg-bg-main/50 sticky top-0 z-10 backdrop-blur-sm">
        <span className="text-xs font-semibold text-text-dim uppercase tracking-wider">
          Search Results
        </span>
        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
          {totalResults} items found
        </span>
      </div>

      {/* Scrollable Results List */}
      <div className="flex-1 overflow-y-auto py-2" onScroll={handleScroll}>
        {loading && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-dim px-4">
            <Loader2 size={24} className="animate-spin text-primary mb-4" />
            <p className="text-sm font-medium text-text-main">Searching...</p>
          </div>
        ) : results && results.length > 0 ? (
          <>
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => navigateTo(result)}
                className="px-4 py-3 hover:bg-bg-hover cursor-pointer transition-colors flex items-center gap-3 group/item relative"
              >
                <div className="p-2.5 bg-bg-main border border-border-muted/30 rounded-xl text-primary/70 group-hover/item:text-primary group-hover/item:bg-primary/10 transition-colors shrink-0 shadow-sm">
                  {result.docType === "folder" ? (
                    <Folder
                      size={18}
                      strokeWidth={1.5}
                      fill={result.color || FOLDER_COLORS.DEFAULT}
                      color={result.color || FOLDER_COLORS.DEFAULT}
                    />
                  ) : (
                    <FileIcon mimeType={result.mimeType} size={18} strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-semibold text-text-main truncate mb-0.5 group-hover/item:text-primary transition-colors">
                    {result.name}
                  </p>
                  <p className="text-[11px] text-text-dim flex items-center gap-1.5 truncate">
                    {result.path || "Home"}
                  </p>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-md bg-bg-main shadow-sm border border-border-muted/30">
                  <ChevronRight size={14} className="text-text-muted" />
                </div>
              </div>
            ))}
            {/* Infinite Load indicator */}
            {(loadingMore || hasMore) && (
              <div className="py-4 flex justify-center border-t border-border-muted/50 mt-2">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10 shadow-sm">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading more results...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-text-muted font-medium px-4 py-1.5">
                    <span>Scroll for more</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-text-dim px-4">
            <div className="w-12 h-12 bg-bg-main rounded-2xl flex items-center justify-center mb-4 border border-border-muted/50 shadow-sm">
              <Search size={22} className="text-text-muted" />
            </div>
            <p className="text-sm font-medium text-text-main mb-1.5">No results found</p>
            <p className="text-xs text-center max-w-[220px] leading-relaxed">
              We couldn't find anything matching{" "}
              <span className="font-semibold text-text-main">"{searchQuery}"</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearchResults;
