import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button, Input } from '@/components/common';
import { ProjectStatus } from '@/types';
import { debounce } from '@/utils';

interface ProjectSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ProjectStatus[];
  onStatusFilterChange: (statuses: ProjectStatus[]) => void;
  onClearFilters: () => void;
}

export const ProjectSearch: React.FC<ProjectSearchProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Debounced search to avoid too many API calls
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => onSearchChange(query), 300),
    [onSearchChange]
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleStatusToggle = (status: ProjectStatus) => {
    const newStatuses = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    onStatusFilterChange(newStatuses);
  };

  const hasActiveFilters = statusFilter.length > 0 || searchQuery.length > 0;

  const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: 'bg-success-100 text-success-800' },
    { value: 'completed', label: 'Completed', color: 'bg-primary-100 text-primary-800' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-accent-100 text-accent-800' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            defaultValue={searchQuery}
            onChange={handleSearchInput}
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center ${showFilters ? 'bg-primary-50 border-primary-200' : ''}`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {statusFilter.length + (searchQuery ? 1 : 0)}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="space-y-4">
            {/* Status Filters */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusToggle(option.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                      statusFilter.includes(option.value)
                        ? option.color
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {option.label}
                    {statusFilter.includes(option.value) && (
                      <X className="inline-block ml-1 h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 hover:text-primary-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {statusFilter.map((status) => {
            const option = statusOptions.find(opt => opt.value === status);
            return (
              <span
                key={status}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${option?.color}`}
              >
                Status: {option?.label}
                <button
                  onClick={() => handleStatusToggle(status)}
                  className="ml-1 hover:opacity-70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};