// // ResultTitle.tsx
// import React from 'react';

// interface ResultTitleProps {
//   // This component expects at least “name” in its props,
//   // and maybe “is_legendary” if the dataset provides it.
//   name?: string;
//   is_legendary?: boolean;
// }

// /**
//  * We do all the “✨” logic here, in this standalone component,
//  * so SearchResults never needs to know about is_legendary.
//  */
// export const ResultTitle: React.FC<ResultTitleProps> = ({
//   name,
//   is_legendary,
// }) => {
//   if (!name) return null;
//   return (
//     <h2 className="result‐title">
//       {name} {is_legendary ? '✨' : ''}
//     </h2>
//   );
// };
