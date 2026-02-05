'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file uploaded' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filepath = path.join(uploadDir, filename);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

    await prisma.media.create({
      data: {
        name: file.name,
        url: publicUrl,
        type: file.type,
      },
    });

    revalidatePath('/admin/files');
    return { success: true };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to save file' };
  }
}

export async function getFiles() {
  const mediaFiles = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Map 'name' to 'filename' to match MediaFile interface
  return mediaFiles.map(file => ({
    id: file.id,
    url: file.url,
    filename: file.name,
    type: file.type,
    createdAt: file.createdAt,
  }));
}

export async function deleteFile(id: string) {
  try {
    const file = await prisma.media.findUnique({
      where: { id },
    });

    if (!file) {
      return { success: false, error: 'File not found' };
    }

    // Delete from disk
    const filepath = path.join(process.cwd(), 'public', file.url); // url starts with /uploads/...
    try {
      await fs.unlink(filepath);
    } catch (e) {
      console.warn("File not found on disk, deleting from DB anyway", e);
    }

    await prisma.media.delete({
      where: { id },
    });

    revalidatePath('/admin/files');
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}
