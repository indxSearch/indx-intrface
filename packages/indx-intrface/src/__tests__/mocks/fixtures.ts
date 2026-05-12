// Facets with numeric keys so rangeBounds calculation produces { price: { min: 10, max: 100 } }
export const FACETS = {
  price: [
    { key: '10', value: 5 },
    { key: '100', value: 3 },
  ],
};

export const RECORDS = [
  { documentKey: 1, score: 90 },
  { documentKey: 2, score: 80 },
];

export const DOCUMENTS = [
  { id: 1, title: 'Shoe A', price: 50 },
  { id: 2, title: 'Shoe B', price: 80 },
];

export const SEARCH_RESPONSE = {
  records: RECORDS,
  facets: FACETS,
  truncationIndex: -1,
};
