import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X, SortAsc, Filter } from "lucide-react";
import { FOLDER_COLORS } from "@/helpers/constants";

const Filters = ({ onChange }) => {
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const colorRef = useRef(null);
  const sortRef = useRef(null);
  const hasFilters = search || selectedColor || sortBy !== "date_desc";

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setShowColorDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update parent when any filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ search, color: selectedColor, sortBy });
    }, 300);

    return () => clearTimeout(handler);
  }, [search, selectedColor, sortBy, onChange]);

  const sortOptions = [
    { label: "Date (Newest)", value: "date_desc" },
    { label: "Date (Oldest)", value: "date_asc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  const handleClearColor = (e) => {
    e.stopPropagation();
    setSelectedColor("");
  };

  const clearAllFilters = () => {
    setSearch("");
    setSelectedColor("");
    setSortBy("date_desc");
  };

  return (
    <div className="flex items-center gap-3 bg-bg-panel/50 backdrop-blur-sm p-1.5 pl-3 rounded-2xl border border-border-main shadow-lg">
      {/* Search Input */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white/5 rounded-full border border-border-main focus-within:border-primary/50 focus-within:bg-white/10 transition-all w-60 group">
        <Search size={16} className="text-text-dim group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search Drive..."
          className="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-text-dim/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-text-dim hover:text-white p-0.5 hover:bg-white/10 rounded-md transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="h-5 w-[1px] bg-border-main/50 mx-1" />

      {/* Color Filter */}
      <div className="relative" ref={colorRef}>
        <button
          className={`group cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-[13px] font-medium ${
            selectedColor
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-white/5 border-border-main text-text-main hover:bg-white/10"
          }`}
          onClick={() => setShowColorDropdown(!showColorDropdown)}
        >
          <Filter size={14} className={selectedColor ? "text-primary" : "text-text-dim group-hover:text-text-main"} />
          <span>{selectedColor ? "Filtered" : "Color"}</span>
          <div className="flex items-center gap-1.5 ml-1">
            {selectedColor && (
              <div
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: selectedColor }}
              />
            )}
            <ChevronDown
              size={13}
              className={`transition-transform duration-300 ${showColorDropdown ? "rotate-180" : ""} text-text-dim`}
            />
          </div>
        </button>

        {showColorDropdown && (
          <div className="absolute top-full left-0 mt-3 w-44 bg-bg-panel rounded-2xl shadow-2xl border border-border-main p-2 z-50 animate-in fade-in zoom-in duration-200">
            <div className="grid grid-cols-4 gap-2 p-1">
              {Object.entries(FOLDER_COLORS).map(([name, code]) => (
                <button
                  key={name}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${
                    selectedColor === code ? "border-white shadow-lg" : "border-transparent"
                  }`}
                  style={{ backgroundColor: code }}
                  title={name}
                  onClick={() => {
                    setSelectedColor(code);
                    setShowColorDropdown(false);
                  }}
                >
                  {selectedColor === code && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              ))}
            </div>
            {selectedColor && (
              <button
                className="w-full cursor-pointer text-left px-2.5 py-2 text-[12px] text-text-dim hover:text-white hover:bg-white/5 rounded-xl mt-2 flex items-center gap-2 transition-colors border-t border-border-main pt-2"
                onClick={handleClearColor}
              >
                <X size={13} />
                Clear color filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="relative" ref={sortRef}>
        <button
          className="group cursor-pointer flex items-center gap-2 px-3 py-2 bg-white/5 border border-border-main rounded-full hover:bg-white/10 hover:border-border-main/80 transition-all text-[13px] font-medium text-text-main"
          onClick={() => setShowSortDropdown(!showSortDropdown)}
        >
          <SortAsc size={14} className="text-text-dim group-hover:text-text-main" />
          <span className="min-w-[80px] text-left">
            {sortOptions.find((opt) => opt.value === sortBy)?.label.split(" ")[0]}
          </span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-300 ${showSortDropdown ? "rotate-180" : ""} text-text-dim`}
          />
        </button>

        {showSortDropdown && (
          <div className="absolute top-full right-0 mt-3 w-48 bg-bg-panel rounded-2xl shadow-2xl border border-border-main p-1.5 z-50 animate-in fade-in zoom-in duration-200">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-3 py-2.5 text-[13px] rounded-xl hover:bg-white/5 transition-all flex items-center justify-between group ${
                  sortBy === option.value ? "text-primary bg-primary/5 font-medium" : "text-text-main"
                }`}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSortDropdown(false);
                }}
              >
                <span>{option.label}</span>
                {sortBy === option.value && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasFilters && (
        <button
          className="flex cursor-pointer items-center gap-2 px-3 py-2 bg-white/5 border border-border-main rounded-full hover:bg-white/10 hover:border-border-main/80 transition-all text-[13px] text-text-main"
          onClick={clearAllFilters}
        >
          <X size={14} />
          Clear all
        </button>
      )}
    </div>
  );
};

export default Filters