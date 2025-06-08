'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface GameListItem {
  id: string;
  game_id: string;
  cover_url?: string;
  added_at?: string;
}

interface List {
  id: string;
  name: string;
  description?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
  items?: GameListItem[];
  game_list_items?: GameListItem[];
}

interface ListsGridProps {
  lists: List[];
  isLoading?: boolean;
}

function ListSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden"
              >
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function ListsGrid({ lists, isLoading = false }: ListsGridProps) {
  // Pour stocker les covers IGDB chargées dynamiquement
  const [covers, setCovers] = useState<{ [gameId: string]: string }>({});

  // Batch fetch des covers IGDB manquantes
  useEffect(() => {
    // Récupérer tous les game_id sans cover_url à afficher (max 20 pour limiter la charge)
    const missingIds = new Set<string>();
    lists.forEach(list => {
      (list.items || list.game_list_items || []).slice(0, 10).forEach((item) => {
        if (!item.cover_url && item.game_id && !covers[item.game_id]) {
          missingIds.add(item.game_id);
        }
      });
    });
    if (missingIds.size === 0) return;
    const idsArr = Array.from(missingIds).slice(0, 20);
    const idsParam = idsArr.join(",");
    fetch(`/api/igdb/covers?ids=${idsParam}`)
      .then(res => res.json())
      .then((data: { [gameId: string]: string | null }) => {
        // Ne stocke que les covers valides (string)
        const validCovers: { [gameId: string]: string } = {};
        Object.entries(data).forEach(([gameId, url]) => {
          if (typeof url === 'string' && url) {
            validCovers[gameId] = url;
          }
        });
        setCovers(prev => ({ ...prev, ...validCovers }));
      })
      .catch(() => {});
  }, [lists, covers]);

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <ListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Aucune liste disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {lists.map((list) => {
        const items = list.items || list.game_list_items || [];
        
        return (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{list.name}</CardTitle>
                  {list.description && (
                    <CardDescription className="line-clamp-2">
                      {list.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={list.is_public ? "default" : "secondary"}>
                      {list.is_public ? "Public" : "Privé"}
                    </Badge>
                    <span>•</span>
                    <span>{items.length} jeu{items.length > 1 ? 'x' : ''}</span>
                  </div>
                </div>
                <Link 
                  href={`/lists/${list.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Voir la liste
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {items.slice(0, 10).map((item) => {
                    const cover = item.cover_url || covers[item.game_id];
                    return (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted relative group"
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs text-center p-1">
                          {cover ? (
                            <Image 
                              src={cover} 
                              alt={`Cover for game ${item.game_id}`} 
                              width={64} 
                              height={64}
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">?</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {items.length > 10 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xs">
                      +{items.length - 10}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}