import type { TablePayload } from '../../../types/pageBuilder';

interface TableElementProps {
  content: TablePayload;
}

export default function TableElement({ content }: TableElementProps) {
  const { headers, rows } = content;

  return (
    <div className="w-full h-full overflow-auto p-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/[0.06]">
            {headers.map((header, i) => (
              <th
                key={i}
                className="text-left py-1.5 px-2 font-semibold text-gray-900 dark:text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-gray-100 dark:border-white/[0.04] last:border-0"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="py-1.5 px-2 text-gray-700 dark:text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
