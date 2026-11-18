const CATEGORIES = ['All', 'Hardware', 'Software', 'Network', 'Access', 'Other']
const STATUSES   = ['All', 'Open', 'In Progress', 'Resolved', 'Closed']

export default function FilterBar({ filters, onChange }) {
  return (
    <div className="filter-bar">
      <span className="filter-label">Filter</span>

      <div className="filter-group">
        <label className="filter-select-label">Status</label>
        <select
          className="filter-select"
          value={filters.status}
          onChange={e => onChange({ ...filters, status: e.target.value })}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-select-label">Category</label>
        <select
          className="filter-select"
          value={filters.category}
          onChange={e => onChange({ ...filters, category: e.target.value })}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}
