export const dynamic = 'force-dynamic'

import { createPage } from '@/app/actions/admin'

export default function NewPage() {
  return (
    <div className="max-w-xl bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Create New Page</h2>
      <form action={createPage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            className="w-full border p-2 rounded"
            placeholder="e.g. Home Page"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            required
            className="w-full border p-2 rounded"
            placeholder="e.g. home or rooms/suite"
          />
          <p className="text-xs text-gray-500 mt-1">Use 'home' for the main page.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Locale</label>
          <select name="locale" className="w-full border p-2 rounded">
            <option value="en">English (EN)</option>
            <option value="tr">Turkish (TR)</option>
            <option value="de">German (DE)</option>
            <option value="ru">Russian (RU)</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 w-full"
        >
          Create Page
        </button>
      </form>
    </div>
  )
}
