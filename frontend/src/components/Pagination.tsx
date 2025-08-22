'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* First Page */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1 || isLoading}
        className="hidden sm:flex items-center gap-1"
      >
        <ChevronsLeft className="h-4 w-4" />
        First
      </Button>

      {/* Previous Page */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "primary" : "secondary"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Page */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages || isLoading}
        className="hidden sm:flex items-center gap-1"
      >
        Last
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
