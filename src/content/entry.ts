import { getEntry, type CollectionEntry } from 'astro:content';

export type PageId =
  | 'home'
  | 'architecture'
  | 'methodology'
  | 'process'
  | 'contact'
  | 'oribos'
  | 'fdesforce'
  | 'heirloom';

export async function publishedPage(id: PageId): Promise<CollectionEntry<'pages'>> {
  const entry = await getEntry('pages', id);
  if (!entry || entry.data.draft) {
    throw new Error(`Missing published content entry: pages/${id}`);
  }
  return entry;
}
