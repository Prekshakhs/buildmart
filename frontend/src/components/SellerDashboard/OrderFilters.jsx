import React from "react";

export function OrderFilters({ filters, onFilterChange }) {
  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value, page: 1 });
  };

  const handleDateChange = (e) => {
    onFilterChange({ ...filters, dateRange: e.target.value, page: 1 });
  };

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({ status: "all", dateRange: "all", search: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Status
          </label>
          <select
            value={filters.status || "all"}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange || "all"}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Order # or buyer name..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Clear Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
