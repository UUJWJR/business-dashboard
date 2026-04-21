interface Props {
  columns: string[];
  rows: Record<string, string | number>[];
  maxRows?: number;
}

export default function SlideTable({ columns, rows, maxRows = 12 }: Props) {
  const displayRows = rows.slice(0, maxRows);
  const hasMore = rows.length > maxRows;

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-2 py-1.5 text-center font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: '#D6E7F5',
                  color: '#00467F',
                  borderBottom: '1px solid #D9D9D9',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#F5F6F8',
              }}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-2 py-1.5 text-center whitespace-nowrap"
                  style={{
                    color: '#1A1A1A',
                    borderBottom: '1px solid #D9D9D9',
                  }}
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <p className="text-xs text-center py-1" style={{ color: '#8C8C8C' }}>
          共 {rows.length} 行，仅展示前 {maxRows} 行
        </p>
      )}
    </div>
  );
}
