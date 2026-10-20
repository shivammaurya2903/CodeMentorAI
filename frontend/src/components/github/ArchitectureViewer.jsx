import React from 'react';
import { Layers, Server, Shield, Cpu, TestTube2, Database, Terminal } from 'lucide-react';
import { Card, Badge } from '../ui/Card';

export function ArchitectureViewer({ index, className = '', style = {} }) {
  if (!index) return null;

  const stack = {
    frontend: ['React 18', 'Vite 5 Bundler', 'React Router 6'],
    backend: ['Node.js', 'Express REST API', 'Helmet Security'],
    auth: ['GitHub OAuth 2.0', 'Express Session Cookie'],
    ai: ['Groq Llama-3 70B Engine', 'AST Security Parser'],
    testing: ['Jest Unit Test Suite', 'Supertest Assertions'],
  };

  const totalFiles = index.totalFiles || 0;
  const routesCount = index.routes?.length || 0;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', ...style }} className={className}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={22} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)', color: 'var(--text)', margin: 0 }}>
            Repository Architecture Overview
          </h3>
        </div>

        <Badge variant="primary" size="md">
          {totalFiles} Indexed Files ({routesCount} Routes)
        </Badge>
      </div>

      {/* Stack Layers Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
            <Terminal size={16} /> FRONTEND LAYER
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {stack.frontend.map(item => (
              <Badge key={item} variant="info" size="sm">{item}</Badge>
            ))}
          </div>
        </div>

        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
            <Server size={16} /> BACKEND API LAYER
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {stack.backend.map(item => (
              <Badge key={item} variant="success" size="sm">{item}</Badge>
            ))}
          </div>
        </div>

        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
            <Cpu size={16} /> AI & AUTH INTEGRATION
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {[...stack.auth, ...stack.ai].map(item => (
              <Badge key={item} variant="primary" size="sm">{item}</Badge>
            ))}
          </div>
        </div>

        <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontWeight: 'var(--fw-bold)', fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
            <TestTube2 size={16} /> TESTING & ASSERTIONS
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {stack.testing.map(item => (
              <Badge key={item} variant="warning" size="sm">{item}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Visual System Flow Block */}
      <pre
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#0a0e17',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.6,
          color: '#38bdf8',
          overflowX: 'auto',
          margin: 0,
        }}
      >
      </pre>
    </Card>
  );
}
