"use client";

import { useState, useMemo } from 'react';
import { Game } from '@/types/game'; // Assuming Game type has language_supports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LanguageSupportItem {
  id: number;
  language?: {
    id: number;
    name: string;
    native_name?: string;
    locale?: string;
  };
  language_support_type?: {
    id: number;
    name: string; // e.g., "audio", "subtitles", "interface"
  };
}

interface TransformedLanguageSupport {
  langId: number;
  langName: string;
  nativeName?: string;
  locale?: string;
  audio: boolean;
  subtitles: boolean;
  interface: boolean;
}

interface SupportedLanguagesProps {
  languageSupports: LanguageSupportItem[] | undefined;
  initialCount?: number;
}

const SUPPORT_TYPE_MAP = {
  AUDIO: 1,
  SUBTITLES: 2,
  INTERFACE: 3,
};

export function SupportedLanguages({ languageSupports, initialCount = 5 }: SupportedLanguagesProps) {
  const [showAll, setShowAll] = useState(false);

  const processedLanguages = useMemo(() => {
    if (!languageSupports || languageSupports.length === 0) {
      return [];
    }

    const langMap = new Map<number, TransformedLanguageSupport>();

    languageSupports.forEach(support => {
      if (support.language && support.language_support_type) {
        const langId = support.language.id;
        const langName = support.language.name;
        const nativeName = support.language.native_name;
        const locale = support.language.locale;

        if (!langMap.has(langId)) {
          langMap.set(langId, {
            langId,
            langName,
            nativeName,
            locale,
            audio: false,
            subtitles: false,
            interface: false,
          });
        }

        const currentLangSupport = langMap.get(langId)!;

        switch (support.language_support_type.id) {
          case SUPPORT_TYPE_MAP.AUDIO:
            currentLangSupport.audio = true;
            break;
          case SUPPORT_TYPE_MAP.SUBTITLES:
            currentLangSupport.subtitles = true;
            break;
          case SUPPORT_TYPE_MAP.INTERFACE:
            currentLangSupport.interface = true;
            break;
        }
      }
    });
    return Array.from(langMap.values()).sort((a, b) => a.langName.localeCompare(b.langName));
  }, [languageSupports]);

  if (!processedLanguages.length) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Langues supportées</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Aucune information sur les langues supportées.</p>
            </CardContent>
        </Card>
    );
  }

  const languagesToDisplay = showAll ? processedLanguages : processedLanguages.slice(0, initialCount);
  const totalLanguages = processedLanguages.length;

  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Langues supportées</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2 px-3 text-left font-medium text-muted-foreground w-2/5">Langue</th>
                            <th className="py-2 px-3 text-center font-medium text-muted-foreground">Audio</th>
                            <th className="py-2 px-3 text-center font-medium text-muted-foreground">Sous-titres</th>
                            <th className="py-2 px-3 text-center font-medium text-muted-foreground">Interface</th>
                        </tr>
                    </thead>
                    <tbody>
                        {languagesToDisplay.map((lang) => (
                            <tr key={lang.langId} className="border-b last:border-b-0 hover:bg-muted/50">
                                <td className="py-2 px-3">
                                    {lang.nativeName || lang.langName}
                                    {lang.nativeName && lang.langName !== lang.nativeName && (
                                        <span className="text-xs text-muted-foreground ml-1">({lang.langName})</span>
                                    )}
                                </td>
                                <td className="py-2 px-3 text-center">{lang.audio ? '✓' : ''}</td>
                                <td className="py-2 px-3 text-center">{lang.subtitles ? '✓' : ''}</td>
                                <td className="py-2 px-3 text-center">{lang.interface ? '✓' : ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalLanguages > initialCount && (
                <Button
                    variant="link"
                    className="mt-3 px-0 text-primary hover:text-primary/80"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Afficher moins' : `Afficher les ${totalLanguages} langues supportées`}
                </Button>
            )}
        </CardContent>
    </Card>
  );
} 