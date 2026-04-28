import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../api/services";

export default function SimilarProducts({ productId, maxProducts = 6 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await productService.getSimilar(productId);
        setProducts(data.data?.slice(0, maxProducts) || []);
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError("Failed to load similar products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId, maxProducts]);

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-lg font-display font-700 mb-4 text-steel-100">
          Similar Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-steel-900 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="py-8">
        <h2 className="text-lg font-display font-700 mb-4 text-steel-100">
          Similar Products
        </h2>
        <div className="text-center py-6 text-steel-400">
          <p className="text-sm">{error || "No similar products available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-lg font-display font-700 mb-4 text-steel-100">
        Similar Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
