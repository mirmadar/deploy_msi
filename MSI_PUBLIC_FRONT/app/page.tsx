import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const DEFAULT_CITY_SLUG = 'msk';

export default async function RootPage() {
  const cookieStore = await cookies();
  const savedCitySlug = cookieStore.get('citySlug')?.value;
  const citySlug =
    savedCitySlug && savedCitySlug.trim() !== '' ? savedCitySlug : DEFAULT_CITY_SLUG;

  redirect(`/${citySlug}`);
}

