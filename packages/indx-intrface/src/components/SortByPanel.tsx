import React from 'react';
import { useSearchContext } from '../context/SearchContext';

export const SortByPanel: React.FC = () => {
  const {
    state: { sortableFields, sortBy, sortAscending },
    setSort,
  } = useSearchContext();

  if (!sortableFields || sortableFields.length === 0) return null;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      setSort(null, true); // Reset sort
    } else {
      const [field, direction] = value.split(':');
      setSort(field, direction === 'asc');
    }
  };

  return (
    <div>
      <label htmlFor="sort-by-select">Sort by:</label>
      <select
        id="sort-by-select"
        value={sortBy ? `${sortBy}:${sortAscending ? 'asc' : 'desc'}` : ''}
        onChange={handleSortChange}
      >
        <option value="">None</option>
        {sortableFields.map((field) => (
          <React.Fragment key={field}>
            <option value={`${field}:asc`}>{field} (asc)</option>
            <option value={`${field}:desc`}>{field} (desc)</option>
          </React.Fragment>
        ))}
      </select>
    </div>
  );
};