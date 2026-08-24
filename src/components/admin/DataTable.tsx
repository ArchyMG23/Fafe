import { ReactNode } from 'react';
import { Loader2, Search, FileSearch } from 'lucide-react';
import { Button } from '../ui/Button';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  // Optional pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Optional search
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  // Optional filters
  filters?: ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "Aucune donnée trouvée.",
  keyExtractor,
  onRowClick,
  page,
  totalPages,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters
}: DataTableProps<T>) {
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
      {/* Toolbar */}
      {(onSearchChange || filters) && (
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          {onSearchChange && (
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {filters && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{filters}</div>}
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-3 font-bold text-stone-500 uppercase tracking-wider text-xs ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E67E22]" />
                    <span>Chargement des données...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block text-sm">
                    {error}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-stone-500">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                    <FileSearch className="w-8 h-8 mb-1" />
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr 
                  key={keyExtractor(row)} 
                  className={`hover:bg-stone-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                      {typeof col.accessor === 'function' 
                        ? col.accessor(row) 
                        : col.accessor ? String(row[col.accessor] as any) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && page !== undefined && (
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Page <span className="font-bold text-stone-900">{page}</span> sur <span className="font-bold text-stone-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Précédent
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
