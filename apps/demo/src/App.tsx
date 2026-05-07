import '@indxsearch/intrface/styles.css';
import './globals.css';
import React, { useState } from 'react';
import { SearchClient } from './SearchClient';
import {
  ActiveFiltersPanel,
  ValueFilterPanel,
  RangeFilterPanel,
  SortByPanel,
  SearchSettingsPanel
} from '@indxsearch/intrface';
import { Spark } from '@indxsearch/pixl';

const fields = ['name', 'is_legendary', 'type1', 'type2', 'hp', 'speed', 'attack', 'abilities'];

const filters = (
  <>
    <ActiveFiltersPanel />
    <SortByPanel displayType="radio" />
    <SortByPanel startCollapsed={true} />
    <ValueFilterPanel label="Primary type" layout="grid" field="type1" preserveBlankFacetState={true} preserveBlankFacetStateOrder={false} displayType="button" limit={30} />
    <ValueFilterPanel
      label="Secondary type"
      displayCondition={({ filters}) => {
        return (
          (filters.type1 || []).includes('water') ||
          (filters.type1 || []).includes('fire')
        );
      }}
      field="type2"
      startCollapsed={true}
      displayType="button"
      layout="grid"
    />
    <ValueFilterPanel label="Legendary" field="is_legendary" preserveBlankFacetState={true} displayType="toggle" />
    <RangeFilterPanel label="Speed" field="speed" displayType="slider" expectedMin={5} expectedMax={180} />
    <RangeFilterPanel label="Attack" field="attack" displayType="slider" startCollapsed={true} />
    <RangeFilterPanel label="HP" field="hp" displayType="slider" startCollapsed={true} />
    <ValueFilterPanel label="Speed" field="speed" displayType="button" preserveBlankFacetStateOrder={false} sortFacetsBy="numeric" startCollapsed={true} />
    <ValueFilterPanel label="Attack" field="attack" layout="grid" startCollapsed={true} showCount={true} />
    <ValueFilterPanel label="HP" startCollapsed={true} field="hp" />
    <SearchSettingsPanel />
  </>
);

// Tag component
const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span>{children}</span>
);

// Rich renderResult
const renderResult = (item: any) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', font: 'var(--text-base)', color: 'var(--lv8)', marginBottom: '0.5rem' }}>
        {item.name}
        {item.is_legendary && <Spark color="gold" size={14} />}
        {item.type1 && <Tag>{item.type1}</Tag>}
        {item.type2 && <Tag>{item.type2}</Tag>}
      </div>

      {Array.isArray(item.abilities) && item.abilities.length > 0 && (
        <div>
          Abilities:{' '}
          {item.abilities.map((ability: string, idx: number) => (
            <Tag key={`${ability}-${idx}`}>{ability}</Tag>
          ))}
        </div>
      )}

      <div>
        Stats:{' '}
        {typeof item.hp === 'number' && <Tag>HP: {item.hp}</Tag>}
        {typeof item.speed === 'number' && <Tag>Speed: {item.speed}</Tag>}
        {typeof item.attack === 'number' && <Tag>Attack: {item.attack}</Tag>}
      </div>
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState<'text' | 'hybrid'>('text');

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 1rem',
    cursor: 'pointer',
    color: active ? 'var(--lv8)' : 'var(--lv5)',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--lv8)' : '2px solid transparent',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem 0', borderBottom: '1px solid var(--lv2)' }}>
        <button style={tabStyle(tab === 'text')} onClick={() => setTab('text')}>Text search</button>
        <button style={tabStyle(tab === 'hybrid')} onClick={() => setTab('hybrid')}>Hybrid / Vector</button>
      </div>

      <SearchClient
        dataset="pokedex"
        fields={fields}
        filters={filters}
        renderResult={renderResult}
        activeTab={tab}
      />
    </div>
  );
}
