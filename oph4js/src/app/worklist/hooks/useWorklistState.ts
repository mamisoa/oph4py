import { useState, useCallback } from 'react';

interface WorklistItem {
  id: number;
  id_auth_user: number;
  sending_app: string;
  sending_facility: number;
  receiving_app: string;
  receiving_facility: number;
  message_unique_id: string;
  procedure: number;
  provider: number;
  senior: number;
  requested_time: string;
  modality_dest: number;
  laterality: string;
  status_flag: string;
  counter: number;
  warning?: string | null;
  transaction_id?: string | null;
  patient?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
  };
  procedureRel?: {
    id: number;
    exam_name: string;
    exam_description?: string | null;
  };
  modality?: {
    id: number;
    modality_name: string;
  };
  providerDoctor?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
  };
  seniorDoctor?: {
    id: number;
    first_name: string | null;
    last_name: string | null;
  };
}

interface WorklistResponse {
  count: number;
  items: WorklistItem[];
}

interface Filters {
  status?: string;
  provider?: number;
  search?: string;
}

interface Pagination {
  limit: number;
  offset: number;
}

/**
 * Custom hook for managing worklist state
 * Handles data fetching, filtering, and CRUD operations
 */
export function useWorklistState() {
  const [items, setItems] = useState<WorklistItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState<Pagination>({
    limit: 20,
    offset: 0,
  });
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());
  
  /**
   * Fetches worklist items based on current filters and pagination
   */
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.provider) {
        params.append('provider', filters.provider.toString());
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      // Fetch data from API
      const response = await fetch(`/api/worklist?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data: WorklistResponse = await response.json();
      
      setItems(data.items);
      setTotalCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching worklist items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);
  
  /**
   * Updates filters and resets pagination
   */
  const updateFilters = useCallback((newFilters: Filters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, offset: 0 }));
  }, []);
  
  /**
   * Updates a worklist item's status
   */
  const updateItemStatus = useCallback(async (id: number, newStatus: string) => {
    setProcessingItems(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/worklist/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_flag: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, status_flag: newStatus } : item
        )
      );
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(`Error updating item ${id} status:`, err);
      return false;
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);
  
  /**
   * Creates a new worklist item
   */
  const createItem = useCallback(async (itemData: Omit<WorklistItem, 'id'>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/worklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
      }
      
      const newItem = await response.json();
      
      // Update local state if successful
      setItems(prev => [newItem, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating worklist item:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Creates multiple worklist items in a batch (combo)
   */
  const createBatch = useCallback(async (itemsData: Omit<WorklistItem, 'id'>[]) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Refresh the list to include new items
      await fetchItems();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating batch worklist items:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems]);
  
  /**
   * Deletes a worklist item
   */
  const deleteItem = useCallback(async (id: number) => {
    setProcessingItems(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/worklist/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== id));
      setTotalCount(prev => prev - 1);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(`Error deleting item ${id}:`, err);
      return false;
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);
  
  /**
   * Updates pagination
   */
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      offset: page * prev.limit,
    }));
  }, []);
  
  /**
   * Changes the number of items per page
   */
  const changePageSize = useCallback((size: number) => {
    setPagination({
      limit: size,
      offset: 0, // Reset to first page
    });
  }, []);
  
  return {
    items,
    totalCount,
    isLoading,
    error,
    filters,
    pagination,
    processingItems,
    fetchItems,
    updateFilters,
    updateItemStatus,
    createItem,
    createBatch,
    deleteItem,
    goToPage,
    changePageSize,
    
    // Derived data
    currentPage: Math.floor(pagination.offset / pagination.limit),
    totalPages: Math.ceil(totalCount / pagination.limit),
    isItemProcessing: (id: number) => processingItems.has(id),
  };
} 