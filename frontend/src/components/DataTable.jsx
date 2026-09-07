import { useState } from 'react';

/**
 * Generic sortable/filterable table — pure React (no TanStack Table).
 * Compatible with @tanstack/react-table v9 which changed its API.
 * Props:
 *   data: array of objects
 *   columns: array of { key, header, render?, sortable? }
 *   globalFilterPlaceholder: string
 */
const DataTable = ({ data, columns, globalFilterPlaceholder = 'Search...' }) => {
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [globalFilter, setGlobalFilter] = useState('');

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = globalFilter.trim()
    ? data.filter((row) => {
        const q = globalFilter.toLowerCase();
        return Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
          return String(val).toLowerCase().includes(q);
        });
      })
    : data;

  // ─── Sort ─────────────────────────────────────────────────────────────────
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const cmp = typeof aVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sortOrder === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key) => {
    if (sortKey !== key) return <span style={{ marginLeft: 6, color: 'var(--text-muted)', opacity: 0.4 }}>⇅</span>;
    return <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      <div className="filters-bar">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="form-control search-input"
            placeholder={globalFilterPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            id="table-global-search"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false && col.key ? 'pointer' : 'default' }}
                >
                  {col.header}
                  {col.sortable !== false && col.key && getSortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No results found</p>
                  </div>
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr key={row.id ?? idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.header}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        {sorted.length} of {data.length} records
      </div>
    </div>
  );
};

export default DataTable;
