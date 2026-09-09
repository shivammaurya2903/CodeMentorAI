import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileCode2 } from 'lucide-react';

export function FileTreeItem({ node, activeFile, onSelectFile }) {
  const [isOpen, setIsOpen] = useState(false);

  if (node.type === 'folder') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            color: 'var(--text)',
            userSelect: 'none',
            fontWeight: 'var(--fw-medium)',
            transition: 'background-color var(--transition-fast)',
          }}
          className="c-tree-item"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {isOpen ? <FolderOpen size={18} style={{ color: 'var(--primary)' }} /> : <Folder size={18} style={{ color: 'var(--primary)' }} />}
          <span>{node.name}</span>
        </div>

        {isOpen && (
          <div style={{ paddingLeft: '1.25rem', borderLeft: '1px solid var(--border)', marginLeft: '0.75rem' }}>
            {Object.keys(node.children).map((key) => (
              <FileTreeItem
                key={node.children[key].path}
                node={node.children[key]}
                activeFile={activeFile}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = activeFile === node.path;

  return (
    <div
      onClick={() => onSelectFile(node.path)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.45rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        fontSize: 'var(--text-base)',
        fontFamily: 'var(--font-mono)',
        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
        backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
        fontWeight: isSelected ? 'var(--fw-semibold)' : 'var(--fw-normal)',
        transition: 'all var(--transition-fast)',
      }}
      className="c-tree-item"
    >
      <FileCode2 size={16} style={{ opacity: isSelected ? 1 : 0.75, flexShrink: 0 }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {node.name}
      </span>
    </div>
  );
}

export function FileTree({ files = [], activeFile, onSelectFile }) {
  const tree = {};
  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {
          type: 'folder',
          name: part,
          children: {},
          path: parts.slice(0, i + 1).join('/'),
        };
      }
      current = current[part].children;
    }
    const filename = parts[parts.length - 1];
    current[filename] = { type: 'file', name: filename, path: file.path };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {Object.keys(tree).map((key) => (
        <FileTreeItem key={tree[key].path} node={tree[key]} activeFile={activeFile} onSelectFile={onSelectFile} />
      ))}
    </div>
  );
}
