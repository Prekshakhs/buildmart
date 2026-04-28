import React from "react";

export function StatCard({ icon: Icon, label, value, color = "blue" }) {
  const colorClasses = {
    blue: "border-blue-500 text-blue-600",
    green: "border-green-500 text-green-600",
    orange: "border-orange-500 text-orange-600",
    red: "border-red-500 text-red-600",
    purple: "border-purple-500 text-purple-600",
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={`text-4xl ${colorClasses[color]} opacity-20`}>
            <Icon />
          </div>
        )}
      </div>
    </div>
  );
}
