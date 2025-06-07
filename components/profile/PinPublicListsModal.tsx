import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

interface PinPublicListsModalProps {
  open: boolean;
  initialPinned: string[];
  onSave: (pinned: string[]) => void;
  onClose: () => void;
}

interface PublicList {
  id: string;
  name: string;
}

export const PinPublicListsModal: React.FC<PinPublicListsModalProps> = ({ open, initialPinned, onSave, onClose }) => {
  const [publicLists, setPublicLists] = useState<PublicList[]>([]);
  const [selected, setSelected] = useState<string[]>(initialPinned);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from('game_lists')
      .select('id, name')
      .eq('is_public', true)
      .then(({ data }) => {
        setPublicLists(data || []);
        setLoading(false);
      });
  }, [open]);

  useEffect(() => {
    setSelected(initialPinned);
  }, [initialPinned, open]);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(lid => lid !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background text-foreground rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Épingler des listes publiques</h2>
        {loading ? (
          <div>Chargement...</div>
        ) : publicLists.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Aucune liste publique disponible.</div>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {publicLists.map(list => (
              <li key={list.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{list.name}</div>
                  {list.description && <div className="text-xs text-muted-foreground">{list.description}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => toggle(list.id)}
                  className={`px-3 py-1 rounded border ${selected.includes(list.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground border-muted'} disabled:opacity-50`}
                  disabled={!selected.includes(list.id) && selected.length >= 3}
                >
                  {selected.includes(list.id) ? 'Épinglée' : 'Épingler'}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button className="px-4 py-2 rounded border bg-muted text-foreground" onClick={onClose}>Annuler</button>
          <button className="px-4 py-2 rounded border bg-primary text-primary-foreground" onClick={() => { onSave(selected); onClose(); }} disabled={loading}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}; 