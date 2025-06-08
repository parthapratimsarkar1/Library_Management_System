import { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // If total pages is less than max pages to show, display all pages
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always include first page, last page, current page, and one page before and after current page
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center px-3 py-2 text-sm rounded-md 
          ${currentPage === 1 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 text-gray-700'} 
          border border-gray-300`}
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Previous
      </button>
      
      <div className="hidden md:flex">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' 
            ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`mx-1 px-4 py-2 text-sm rounded-md ${
                  currentPage === page 
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                }`}
              >
                {page}
              </button>
            )
            : (
              <span key={index} className="mx-1 px-4 py-2 text-sm text-gray-700">
                {page}
              </span>
            )
        ))}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center px-3 py-2 text-sm rounded-md 
          ${currentPage === totalPages 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white hover:bg-gray-50 text-gray-700'} 
          border border-gray-300`}
      >
        Next
        <ChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  );
};

export default Pagination;