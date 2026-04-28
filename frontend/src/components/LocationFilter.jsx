import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function LocationFilter({ selectedCity, onCityChange, cities }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <label className="label">Location</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded bg-steel-800 text-steel-100 text-sm font-body text-left flex items-center justify-between hover:bg-steel-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <MapPin size={14} />
            {selectedCity
              ? selectedCity
              : "Select Location"}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-steel-800 border border-steel-700 rounded z-10 shadow-lg max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onCityChange("");
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm font-body transition-colors flex items-center gap-2 ${
                !selectedCity
                  ? "bg-amber-400/15 text-amber-400"
                  : "text-steel-300 hover:text-steel-100 hover:bg-steel-700"
              }`}
            >
              <MapPin size={14} />
              All Cities
            </button>

            {cities && cities.length > 0 ? (
              cities.map((cityData) => (
                <button
                  key={cityData.city}
                  onClick={() => {
                    onCityChange(cityData.city);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-body transition-colors flex items-center gap-2 ${
                    selectedCity === cityData.city
                      ? "bg-amber-400/15 text-amber-400"
                      : "text-steel-300 hover:text-steel-100 hover:bg-steel-700"
                  }`}
                >
                  <MapPin size={14} />
                  {cityData.city}, {cityData.state}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-steel-500">
                No cities available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
