import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { FilterPanelBase } from '@indxsearch/systm';
import { RadioButton } from '@indxsearch/systm';
import styles from './SortByPanel.module.css';

type SortByPanelProps = {
  type?: 'dropdown' | 'radio';
};

export const SortByPanel: React.FC<SortByPanelProps> = ({ type = 'dropdown' }) => {
  const {
    state: { sortableFields, sortBy, sortAscending },
    setSort,
  } = useSearchContext();

  if (!sortableFields || sortableFields.length === 0) return null;

  const currentValue = sortBy ? `${sortBy}:${sortAscending ? 'asc' : 'desc'}` : '';

  const options = sortableFields.flatMap((field) => [
    { label: `${field} (asc)`, value: `${field}:asc` },
    { label: `${field} (desc)`, value: `${field}:desc` },
  ]);

  const handleChange = (value: string) => {
    if (value === '') {
      setSort(null, true);
    } else {
      const [field, direction] = value.split(':');
      setSort(field, direction === 'asc');
    }
  };

  return (
    <div className={styles.wrapper}>
      <FilterPanelBase>
        <h3>Sort by</h3>
        {type === 'dropdown' ? (
          <select
            className={styles.select}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
          >
            <option value="">None</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div className={styles.radioGroup}>
            <RadioButton
              id="sort-none"
              name="sort-by"
              value=""
              label="None"
              checked={currentValue === ''}
              onChange={(e) => handleChange(e.target.value)}
            />
            {options.map((opt) => (
              <RadioButton
                key={opt.value}
                id={`sort-${opt.value}`}
                name="sort-by"
                value={opt.value}
                label={opt.label}
                checked={currentValue === opt.value}
                onChange={(e) => handleChange(e.target.value)}
              />
            ))}
          </div>
        )}
      </FilterPanelBase>
    </div>
  );
};
