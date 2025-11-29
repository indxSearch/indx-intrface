import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { FilterPanelBase, RadioButton, Select } from '@indxsearch/systm';
import styles from './SortByPanel.module.css';

type SortByPanelProps = {
  displayType?: 'dropdown' | 'radio';
  collapsible?: boolean;
  startCollapsed?: boolean;
};

export const SortByPanel: React.FC<SortByPanelProps> = ({ displayType = 'dropdown', collapsible = true, startCollapsed = false }) => {
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

  // Determine whether to actually collapse based on `collapsible` + `startCollapsed`
  const actualCollapsed = collapsible ? startCollapsed : false;

  return (
      <FilterPanelBase 
        title='Sort by' 
        collapsible={collapsible}
        collapsed={actualCollapsed}
      >
        {displayType === 'dropdown' ? (
          <Select
            value={currentValue}
            onValueChange={handleChange}
            options={options}
            placeholder="Select sort..."
          />
        ) : (
          <div className={styles.radioGroup}>
            <RadioButton
              id="sort-none"
              name="sort-by"
              value=""
              label="None"
              checked={currentValue === ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
            />
            {options.map((opt) => (
              <RadioButton
                key={opt.value}
                id={`sort-${opt.value}`}
                name="sort-by"
                value={opt.value}
                label={opt.label}
                checked={currentValue === opt.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
              />
            ))}
          </div>
        )}
      </FilterPanelBase>
  );
};
