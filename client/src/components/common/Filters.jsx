import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, X, SortAsc, Filter } from "lucide-react";
import { FOLDER_COLORS } from "@/helpers/constants";

const Filters = ({ onChange }) => {
  const [selectedColor, setSelectedColor] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const colorRef = useRef(null);
  const sortRef = useRef(null);
  const hasFilters = selectedColor || sortBy !== "date_desc";

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

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ color: selectedColor, sortBy });
    }, 300);

    return () => clearTimeout(handler);
  }, [selectedColor, sortBy, onChange]);

  const sortOptions = [
    { label: "Date (Newest)", value: "date_desc" },
    { label: "Date (Oldest)", value: "date_asc" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  const handleClearColor = (e) => {
    e.stopPropagation();
    setSelectedColor("");
    setShowColorDropdown(false);
  };

  const clearAllFilters = () => {
    setSelectedColor("");
    setSortBy("date_desc");
    setShowColorDropdown(false);
    setShowSortDropdown(false);
  };

  return (
    <>
      <div className="filter-container z-1">
        <div className="relative" ref={colorRef}>
          <button
            className={`filter-button group ${selectedColor ? "filter-button-active" : ""}`}
            onClick={() => setShowColorDropdown(!showColorDropdown)}
          >
            <Filter
              size={14}
              className={
                selectedColor ? "text-primary" : "text-text-dim group-hover:text-text-main"
              }
            />
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
            <div className="filter-dropdown left-0 w-44 animate-in fade-in zoom-in duration-200">
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
                    {selectedColor === code && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
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

        <div className="relative" ref={sortRef}>
          <button
            className="filter-button group"
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
            <div className="filter-dropdown right-0 w-48 p-1.5 animate-in fade-in zoom-in duration-200">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-3 py-2.5 text-[13px] rounded-xl hover:bg-white/5 transition-all flex items-center justify-between group ${
                    sortBy === option.value
                      ? "text-primary bg-primary/5 font-medium"
                      : "text-text-main"
                  }`}
                  onClick={() => {
                    setSortBy(option.value);
                    setShowSortDropdown(false);
                  }}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {hasFilters && (
          <button className="filter-button" onClick={clearAllFilters}>
            <X size={14} />
            Clear all
          </button>
        )}
      </div>
    </>
  );
};

export default Filters;
