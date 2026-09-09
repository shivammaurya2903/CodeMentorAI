import React from 'react';
import { Code2 } from 'lucide-react';
import { Select } from '../ui/Input';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
];

export function LanguageSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={LANGUAGES}
        icon={Code2}
        style={{ minWidth: '150px' }}
      />
    </div>
  );
}
