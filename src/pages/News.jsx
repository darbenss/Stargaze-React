// src/pages/News.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { newsService } from '../services/newsService';
// Assuming Person A created these components:
import { NewsCard } from '../components/NewsCard'; 
import { Pagination } from '../components/Pagination'; // Generic pagination component
import { Loader } from '../components/Loader';

// Simple debounce utility (or use lodash/useDebounce hook)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function News() {
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters / Pagination State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search to prevent API spam (Legacy used 350ms)
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Fetch Logic
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items: fetchedItems, meta } = await newsService.fetchNews({
        page,
        limit: 8,
        title: debouncedSearch
      });
      setItems(fetchedItems);
      // If we need the total pages for pagination component:
      setTotalPages(meta.pageCount || 1); 
    } catch (err) {
      console.error(err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  const [totalPages, setTotalPages] = useState(1);

  // Effect: Fetch on mount + when page/search changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="news-page-container p-6">
      <header className="mb-8">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-4">Latest News</h1>
        
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search news..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 border rounded shadow-sm focus:ring focus:ring-blue-300"
        />
      </header>

      {/* Error State */}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {/* Loading State */}
      {loading ? (
        <Loader /> // Or <p>Loading...</p>
      ) : (
        <>
          {/* Grid Layout */}
          {items.length === 0 ? (
             <p className="text-gray-500">No news found matching your criteria.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="news-cards-container">
              {items.map((newsItem) => (
                <NewsCard key={newsItem.id} data={newsItem} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          )}
        </>
        // Footer here
      )}
    </div>
  );
}