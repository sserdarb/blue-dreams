import { createPage } from '@/app/actions/admin'

export default function NewPage() {
  return (
    <div className="max-w-xl bg-slate-800 p-8 rounded-lg shadow border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Yeni Sayfa Oluştur</h2>
      <form action={createPage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Başlık</label>
          <input
            type="text"
            name="title"
            required
            className="w-full border border-slate-600 bg-slate-700 text-white p-2 rounded focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="ör: Ana Sayfa"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Slug</label>
          <input
            type="text"
            name="slug"
            required
            className="w-full border border-slate-600 bg-slate-700 text-white p-2 rounded focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="ör: home veya rooms/suite"
          />
          <p className="text-xs text-slate-500 mt-1">Ana sayfa için 'home' kullanın.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Dil</label>
          <select name="locale" className="w-full border border-slate-600 bg-slate-700 text-white p-2 rounded focus:ring-cyan-500 focus:border-cyan-500">
            <option value="tr">Türkçe (TR)</option>
            <option value="en">English (EN)</option>
            <option value="de">Deutsch (DE)</option>
            <option value="ru">Русский (RU)</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-cyan-600 text-white px-6 py-2 rounded hover:bg-cyan-700 w-full"
        >
          Sayfa Oluştur
        </button>
      </form>
    </div>
  )
}

