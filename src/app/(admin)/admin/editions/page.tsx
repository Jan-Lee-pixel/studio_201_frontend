'use client';

import Link from 'next/link';
import { MOCK_EDITIONS } from '@/features/editions/types';

export default function AdminEditionsPage() {
  return (
    <div className="content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="page-title">Editions</h1>
            <p className="page-subtitle text-gray-400">Review the current editions catalog shown on the public site.</p>
          </div>
          <Link href="/editions" className="btn btn-secondary btn-sm">
            View Public Editions
          </Link>
        </div>
      </div>

      <div className="border border-[var(--color-rule)] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-mono text-xs uppercase tracking-widest">
                <th className="pb-3 pt-4 px-6 font-normal">Title</th>
                <th className="pb-3 pt-4 px-6 font-normal">Artist</th>
                <th className="pb-3 pt-4 px-6 font-normal">Category</th>
                <th className="pb-3 pt-4 px-6 font-normal">Availability</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EDITIONS.map((edition) => (
                <tr key={edition.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-4 px-6">
                    <div className="font-medium text-[var(--color-near-black)]">{edition.title}</div>
                    {edition.isFeatured && (
                      <span className="inline-flex mt-2 text-[10px] font-mono uppercase tracking-widest bg-[var(--color-bone)] px-2 py-1">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-500">{edition.artist}</td>
                  <td className="py-4 px-6 text-gray-500">{edition.category}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-2 py-1 text-xs font-mono uppercase tracking-wider rounded-sm bg-gray-100 text-gray-700">
                      {edition.availability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
