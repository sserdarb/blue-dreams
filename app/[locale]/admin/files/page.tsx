export const dynamic = 'force-dynamic'

import { getFiles } from '@/app/actions/media';
import FileManager from './FileManager';
import { unstable_noStore as noStore } from 'next/cache';

export default async function FilesPage() {
  noStore(); // Ensure we always get fresh data
  const files = await getFiles();

  return <FileManager initialFiles={files} />;
}
