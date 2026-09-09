import React from 'react';
import { FolderGit2, Lock, ArrowRight } from 'lucide-react';
import { Card, Badge } from '../ui/Card';
import { Button } from '../ui/Button';

export function RepositoryCard({ repo, onSelect }) {
  return (
    <Card hoverable style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <FolderGit2 size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {repo.name}
            </h4>
          </div>
          {repo.private && (
            <Badge variant="neutral" size="sm">
              <Lock size={12} /> Private
            </Badge>
          )}
        </div>

        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 'var(--lh-relaxed)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {repo.description || 'No repository description provided.'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
        <Badge variant="info" size="sm">
          {repo.language || 'Codebase'}
        </Badge>
        <Button variant="secondary" size="sm" iconRight={ArrowRight} onClick={() => onSelect(repo.full_name)}>
          Inspect Workbench
        </Button>
      </div>
    </Card>
  );
}
