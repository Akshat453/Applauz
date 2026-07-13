function DataTable({ columns, rows, emptyMessage = 'No rows available.' }) {
  if (!rows.length) {
    return <div className="rounded-lg border border-dashed border-line bg-white p-6 text-sm text-ink/60">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-surface text-xs uppercase tracking-[0.14em] text-ink/55">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-4 font-semibold">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="border-t border-line/70 text-sm text-ink">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-top">{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
