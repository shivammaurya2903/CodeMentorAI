import React, { useState } from 'react';
import { Search, FolderGit2, Loader2 } from 'lucide-react';
import { RepositoryCard } from './RepositoryCard';
import { Input } from '../ui/Input';
import { Skeleton, EmptyState } from '../ui/EmptyState';

export function RepositoryList({ repos = [], loading = false, onSelectRepo }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRepos = repos.filter((r) =>
    (r.full_name || r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '2.5rem 1rem',
            backgroundColor: 'var(--surface-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border)',
          }}
        >
          <Loader2 size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontWeight: 500 }}>
            Fetching repositories from GitHub...
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <Skeleton height="160px" borderRadius="var(--radius-lg)" />
          <Skeleton height="160px" borderRadius="var(--radius-lg)" />
          <Skeleton height="160px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FolderGit2 size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)' }}>
            Your Repositories ({repos.length})
          </h3>
        </div>

        <div style={{ width: '300px' }}>
          <Input
            icon={Search}
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredRepos.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No repositories found"
          description={searchTerm ? `No repository matches "${searchTerm}".` : "No connected public or private GitHub repositories found."}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredRepos.map((repo) => (
            <RepositoryCard key={repo.full_name} repo={repo} onSelect={onSelectRepo} />
          ))}
        </div>
      )}
    </div>
  );
}
