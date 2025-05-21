import { SearchClient } from './SearchClient';

export default function Page() {
  const email = process.env.NEXT_PUBLIC_INDX_EMAIL!;
  const password = process.env.NEXT_PUBLIC_INDX_PASSWORD!;

  console.log(password);

  return <SearchClient email={email} password={password} />;
}