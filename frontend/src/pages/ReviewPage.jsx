import React from 'react';
import { ReviewWorkspace } from '../components/review/ReviewWorkspace';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Card';
import { Sparkles } from 'lucide-react';

export function ReviewPage() {
  const sampleCode = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="AI Code Review Workbench"
        description="Select a language, paste your source code snippet, and run AI analysis for bug detection, score breakdown, and refactoring guidance."
        badge={
          <Badge variant="info" size="sm" icon={Sparkles}>
            AST & Quality Analyzer
          </Badge>
        }
      />

      <ReviewWorkspace initialCode={sampleCode} initialLanguage="javascript" />
    </div>
  );
}
