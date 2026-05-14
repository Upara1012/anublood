import React from 'react';
interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}
export function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyMessage = 'No data available'
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>);

  }
  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
          <tr>
            {columns.map((col, i) =>
            <th
              key={i}
              className={`px-6 py-4 font-medium ${col.className || ''}`}>
              
                {col.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ?
          <tr>
              <td
              colSpan={columns.length}
              className="px-6 py-8 text-center text-gray-500">
              
                {emptyMessage}
              </td>
            </tr> :

          data.map((item) =>
          <tr
            key={keyExtractor(item)}
            className="hover:bg-gray-50 transition-colors">
            
                {columns.map((col, i) =>
            <td
              key={i}
              className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
              
                    {col.cell ?
              col.cell(item) :
              col.accessorKey ?
              String(item[col.accessorKey]) :
              null}
                  </td>
            )}
              </tr>
          )
          }
        </tbody>
      </table>
    </div>);

}