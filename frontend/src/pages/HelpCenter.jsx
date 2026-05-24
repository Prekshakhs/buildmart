import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Loader,
} from "lucide-react";
import { toast } from "react-toastify";
import { faqService } from "../api/services";
import { PageLoader, ErrorMessage } from "../components/Loaders";

const CATEGORIES = [
  "All",
  "Getting Started",
  "Buying",
  "Selling",
  "Payments",
  "Returns",
  "Account",
  "Shipping",
  "Technical",
];

export default function HelpCenter() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchFAQs();
  }, [selectedCategory, page]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
      fetchFAQs();
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (searchQuery.trim()) {
        response = await faqService.search(searchQuery, page);
      } else if (selectedCategory !== "All") {
        response = await faqService.getByCategory(selectedCategory, page);
      } else {
        response = await faqService.getAll(page);
      }

      const { data: responseData } = response;
      setFaqs(responseData.data);
      setTotalPages(responseData.pagination.pages);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError(err.response?.data?.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
    setSelectedFAQ(null);
  };

  const handleMarkHelpful = async (faqId) => {
    try {
      console.log("Marking FAQ as helpful:", faqId);
      const response = await faqService.markHelpful(faqId);
      console.log("Helpful response:", response);
      toast.success("Thank you for your feedback!");
      // Update selectedFAQ with new counts
      setSelectedFAQ((prev) =>
        prev ? { ...prev, helpful: prev.helpful + 1 } : null,
      );
    } catch (err) {
      console.error("Error marking helpful:", err);
      toast.error("Failed to submit feedback");
    }
  };

  const handleMarkUnhelpful = async (faqId) => {
    try {
      console.log("Marking FAQ as unhelpful:", faqId);
      const response = await faqService.markUnhelpful(faqId);
      console.log("Unhelpful response:", response);
      toast.success("Thank you for your feedback!");
      // Update selectedFAQ with new counts
      setSelectedFAQ((prev) =>
        prev ? { ...prev, unhelpful: prev.unhelpful + 1 } : null,
      );
    } catch (err) {
      console.error("Error marking unhelpful:", err);
      toast.error("Failed to submit feedback");
    }
  };

  if (loading && !faqs.length) return <PageLoader />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display font-800 text-4xl uppercase text-steel-50 mb-2">
          Help Center
        </h1>
        <p className="text-steel-400">
          Find answers to common questions about PickMyTools
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full pl-4 pr-12 py-3 bg-steel-900 border border-steel-800 rounded-lg text-steel-50 placeholder-steel-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-steel-400 hover:text-amber-400 transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
      </form>

      {/* Categories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === category
                ? "bg-amber-400 text-steel-950 font-semibold"
                : "bg-steel-800 text-steel-300 hover:bg-steel-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ List */}
        <div className="lg:col-span-2 space-y-3">
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <div
                key={faq._id}
                onClick={() => setSelectedFAQ(faq)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedFAQ?._id === faq._id
                    ? "bg-steel-800 border-amber-400 shadow-lg shadow-amber-400/10"
                    : "bg-steel-900 border-steel-800 hover:border-steel-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-steel-100 mb-1">
                      {faq.title}
                    </h3>
                    <p className="text-sm text-steel-400 line-clamp-2">
                      {faq.content}
                    </p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-steel-500 flex-shrink-0 transition-transform ${
                      selectedFAQ?._id === faq._id ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Views badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-steel-500">
                    Views: {faq.views}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-steel-400">
              <p>No FAQs found. Try a different search or category.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-steel-800">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-steel-800 text-steel-300 rounded-lg hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-steel-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-steel-800 text-steel-300 rounded-lg hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* FAQ Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedFAQ ? (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-steel-50 mb-3">
                {selectedFAQ.title}
              </h2>

              <p className="text-steel-400 mb-4 whitespace-pre-wrap">
                {selectedFAQ.content}
              </p>

              {selectedFAQ.tags && selectedFAQ.tags.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-steel-500 uppercase tracking-widest mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFAQ.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-steel-800 text-steel-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-steel-800 pt-4">
                <p className="text-sm text-steel-500 mb-3">
                  Was this article helpful?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkHelpful(selectedFAQ._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-colors"
                  >
                    <ThumbsUp size={16} />
                    <span>Yes ({selectedFAQ.helpful || 0})</span>
                  </button>
                  <button
                    onClick={() => handleMarkUnhelpful(selectedFAQ._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    <ThumbsDown size={16} />
                    <span>No ({selectedFAQ.unhelpful || 0})</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6 text-center text-steel-400">
              <p>Select an FAQ to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
