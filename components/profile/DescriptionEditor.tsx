'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false });

export function DescriptionEditor({ 
  initialValue,
  onChange 
}: { 
  initialValue: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState<string>(initialValue || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 1500;

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleChange = (newValue: string | undefined) => {
    const value = newValue?.slice(0, maxLength) || '';
    setValue(value);
    onChange?.(value);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde.');
      setError(null);
      // Optionnel : afficher un toast ou message de succès
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={200}
        preview="edit"
        textareaProps={{
          maxLength,
          placeholder: 'Décris-toi en quelques mots... (formatage Markdown autorisé)',
        }}
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{value.length} / {maxLength} caractères</span>
        {error && <span className="text-red-500">{error}</span>}
      </div>
      <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving || value.length > maxLength}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
      {error === null && !saving && (
        <span className="text-green-600 text-xs mt-1">Description enregistrée !</span>
      )}
      <div className="mt-2">
        <div className="font-semibold mb-1">Aperçu :</div>
        <MarkdownPreview source={value}  style={{ background: 'transparent' }} />
      </div>
    </div>
  );
} 