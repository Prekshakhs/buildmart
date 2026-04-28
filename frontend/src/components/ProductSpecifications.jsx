import React from "react";

export default function ProductSpecifications({ specifications = [] }) {
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-700 text-sm uppercase tracking-widest text-steel-400">
        Specifications
      </h3>

      <div className="bg-steel-900 border border-steel-800 rounded-lg divide-y divide-steel-800">
        {specifications.map((spec, index) => (
          <div key={index} className="flex items-start p-4 hover:bg-steel-800/50 transition-colors">
            <div className="flex-1">
              <p className="text-xs font-mono text-steel-500 uppercase tracking-wider mb-1">
                {spec.label}
              </p>
              <p className="text-sm text-steel-100 font-body">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
