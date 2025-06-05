'use client';
import dynamic from 'next/dynamic';

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

export function MarkdownDescription({ source }: { source: string }) {
  return (
    <div className="prose prose-primary min-h-[60px]">
      <MarkdownPreview source={source}  style={{ background: 'transparent' }} />
    </div>
  );
} 