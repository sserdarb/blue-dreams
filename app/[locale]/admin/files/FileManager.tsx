'use client';

import { useState, useRef } from 'react';
import { uploadFile, deleteFile } from '@/app/actions/media';
import Image from 'next/image';
import { Trash2, Copy, Upload } from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  type: string;
  createdAt: Date;
}

export default function FileManager({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUpload(formData: FormData) {
    setUploading(true);
    const result = await uploadFile(formData);
    setUploading(false);

    if (result.success) {
      formRef.current?.reset();
      // In a real app we might re-fetch, but here we depend on revalidatePath
      // However, revalidatePath affects server components.
      // Since we are in a client component, we should probably just refresh the page
      // or the parent should have passed a server action wrapper that revalidates.
      window.location.reload();
    } else {
      alert('Upload failed: ' + result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const result = await deleteFile(id);
    if (result.success) {
      setFiles(files.filter(f => f.id !== id));
    } else {
      alert('Delete failed');
    }
  }

  function copyToClipboard(url: string) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(url).then(() => {
        alert('URL copied to clipboard: ' + url);
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">File Manager</h1>

      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Upload New File</h2>
        <form ref={formRef} action={handleUpload} className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="file"
              name="file"
              required
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded shadow overflow-hidden group relative">
            <div className="relative h-32 w-full bg-gray-100">
                {file.type.startsWith('image/') ? (
                     <Image
                        src={file.url}
                        alt={file.filename}
                        fill
                        className="object-cover"
                        unoptimized // For user uploaded content usually safer or needed if domain not allowlisted
                     />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        File
                    </div>
                )}
            </div>
            <div className="p-2 text-xs truncate border-t">
                {file.filename}
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded">
                <button
                    onClick={() => copyToClipboard(file.url)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Copy URL"
                >
                    <Copy size={16} />
                </button>
                <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
