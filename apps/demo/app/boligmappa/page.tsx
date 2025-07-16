'use client';
import { SearchClient } from '../SearchClient';
import {
  ActiveFiltersPanel,
  ValueFilterPanel,
  RangeFilterPanel,
  SortByPanel,
  SearchSettingsPanel
} from '@indxsearch/intrface';
import { Check } from '@indxsearch/pixl';

const fields = ['legalName', 'professionTypes.name', 'address.postalPlace', 'companyCertificates.displayName', 'isVatRegistered'];
// const fields = ['legalName'];

const filters = (
  <>
    <ActiveFiltersPanel />
    <SortByPanel displayType="radio" />
    <ValueFilterPanel label="Profession types" layout="grid" field="professionTypes.name" preserveBlankFacetState={true} preserveBlankFacetStateOrder={false} displayType="button" limit={30} />
    <ValueFilterPanel label="VAT registered" field="isVatRegistered" startCollapsed={true} />
    <ValueFilterPanel label="Postal place" field="address.postalPlace" displayType="button" preserveBlankFacetStateOrder={false} sortFacetsBy="numeric" startCollapsed={true} />
    <ValueFilterPanel label="Company certificates" field="companyCertificates.displayName" layout="grid" startCollapsed={true} showCount={true} />
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
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {item.legalName}
        {item.isVatRegistered && <Check color="green" size={14} />}
        {item?.address?.postalPlace && <Tag>{item.address.postalPlace}</Tag>}
      </h2>

      {Array.isArray(item?.companyCertificates?.displayName) && item.companyCertificates.displayName.length > 0 && (
        <div>
          Certificates:{' '}
          {item.companyCertificates.displayName.map((cert: string, idx: number) => (
            <Tag key={`${cert}-${idx}`}>{cert}</Tag>
          ))}
        </div>
      )}

    </div>
  );
};

export default function Page() {
  return (
    <SearchClient
      dataset="boligmappa"
      fields={fields}
      filters={filters}
      renderResult={renderResult}
    />
  );
}
