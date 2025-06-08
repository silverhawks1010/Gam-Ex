"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";

function normalize(str: string) {
  return str.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

interface GuessGameData {
  name: string;
  screenshot: string | null;
  hints: { type: 'text' | 'image'; value: string }[];
}

const MODES = [
  {
    key: "all",
    label: "Tous les jeux",
    desc: "N'importe quel jeu de la base IGDB. Difficulté maximale !",
    color: "bg-blue-600",
  },
  {
    key: "recent",
    label: "Jeux récents connus",
    desc: "Jeux sortis ces 2 dernières années et populaires.",
    color: "bg-green-600",
  },
  {
    key: "famous",
    label: "Jeux cultes",
    desc: "Les jeux les plus connus et populaires, toutes années.",
    color: "bg-yellow-500",
  },
  {
    key: "upcoming",
    label: "Futurs jeux",
    desc: "Jeux à venir très attendus.",
    color: "bg-purple-600",
  },
  {
    key: "retro",
    label: "Jeux rétro",
    desc: "Classiques sortis avant 2005.",
    color: "bg-pink-600",
  },
];

const MODE_ICONS = {
  all: "🎮",
  recent: "⭐",
  famous: "🏆",
  upcoming: "⏳",
  retro: "🕹️",
};

export default function GuessTheGamePage() {
  const [mode, setMode] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [game, setGame] = useState<GuessGameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Autocomplete
  const [suggestions, setSuggestions] = useState<{ id: number; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Charger un jeu selon le mode
  useEffect(() => {
    if (!mode) return;
    setLoading(true);
    setTries(0);
    setStatus("playing");
    setInput("");
    setGame(null);
    setError(null);
    fetch(`/api/games/random?mode=${mode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setGame(null);
        } else {
          setGame(data);
          setError(null);
        }
      })
      .catch(() => setError("Erreur lors du chargement du jeu."))
      .finally(() => setLoading(false));
  }, [mode]);

  // Debounced autocomplete
  useEffect(() => {
    if (!input.trim() || status !== "playing") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const handler = setTimeout(() => {
      fetch(`/api/games/search?q=${encodeURIComponent(input)}`)
        .then(res => res.json())
        .then((data) => {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
          setHighlighted(-1);
        });
    }, 200);
    return () => clearTimeout(handler);
  }, [input, status]);

  // Fermer suggestions au clic dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showSuggestions]);

  const handleSuggestionClick = (name: string) => {
    setInput(name);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setHighlighted((h) => (h + 1) % suggestions.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlighted((h) => (h - 1 + suggestions.length) % suggestions.length);
      e.preventDefault();
    } else if (e.key === "Enter" && highlighted >= 0) {
      setInput(suggestions[highlighted].name);
      setShowSuggestions(false);
      inputRef.current?.blur();
      e.preventDefault();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!game) return;
    if (normalize(input) === normalize(game.name)) {
      setStatus("won");
    } else if (tries >= 4) {
      setStatus("lost");
    } else {
      setTries(tries + 1);
      setInput("");
    }
  };

  // MENU ACCUEIL
  if (!mode) {
    return (
      <div>
        <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-8">
        <Card className="w-full max-w-2xl mx-auto p-8 shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-background to-muted/60">
          <CardHeader>
            <CardTitle className="text-4xl text-center mb-2 font-extrabold tracking-tight">Guess the Game</CardTitle>
            <CardDescription className="text-center mb-6 text-lg text-muted-foreground">Devine le jeu à partir d&apos;un screenshot et d&apos;indices. Choisis ton mode de jeu !</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  className={`rounded-xl p-6 flex flex-col items-center shadow-lg hover:scale-[1.04] transition-transform border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${m.color} text-white group`}
                  onClick={() => setMode(m.key)}
                >
                  <span className="text-4xl mb-2">{MODE_ICONS[m.key as keyof typeof MODE_ICONS]}</span>
                  <span className="text-xl font-bold mb-1 group-hover:underline">{m.label}</span>
                  <span className="text-base opacity-90 text-center">{m.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
    );
  }

  // PARTIE EN COURS
  return (
    <div>
    <Navbar />

    <div className="flex flex-col items-center justify-center min-h-screen bg-background py-8">
      <Card className="w-full max-w-xl mx-auto shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-background to-muted/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-extrabold flex items-center gap-2">{MODE_ICONS[mode as keyof typeof MODE_ICONS]} Guess the Game</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setMode(null)} className="flex items-center gap-1">
              <span className="text-lg">↩️</span>
              <span className="hidden sm:inline">Retour</span>
            </Button>
          </div>
          <CardDescription className="mt-2 text-base">
            Mode : <span className="font-semibold">{MODES.find(m => m.key === mode)?.label}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-96 h-56 rounded-xl" />
              <div className="w-full flex flex-col gap-2 mt-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-full h-8 rounded mb-1" />
                ))}
              </div>
              <div className="w-full flex gap-2 mt-4">
                <Skeleton className="h-10 w-full rounded" />
                <Skeleton className="h-10 w-24 rounded" />
              </div>
            </div>
          ) : error || !game ? (
            <div className="text-center text-red-600 font-bold min-h-[200px] flex items-center justify-center">{error || "Aucun jeu trouvé."}</div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-full flex justify-center">
                <div
                  className="relative w-96 h-56 rounded-xl overflow-hidden border shadow bg-muted group cursor-zoom-in transition-transform hover:scale-[1.03]"
                  onClick={() => game.screenshot && setShowModal(true)}
                  title={game.screenshot ? 'Agrandir' : ''}
                >
                  {game.screenshot ? (
                    <Image
                      src={"https:" + game.screenshot.replace('/t_thumb/', '/t_1080p/')}
                      alt="Screenshot du jeu à deviner"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-muted-foreground">Aucune image</span>
                  )}
                </div>
                <Dialog open={showModal} onOpenChange={setShowModal}>
                  <DialogContent className="max-w-none flex flex-col items-center justify-center p-2">
                    {game.screenshot && (
                      <div className="relative w-[90vw] h-[90vh]">
                        <Image
                          src={"https:" + game.screenshot.replace('/t_thumb/', '/t_1080p/')}
                          alt="Screenshot du jeu à deviner (agrandi)"
                          fill
                          className="rounded-2xl object-contain"
                          priority
                        />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              <div className="w-full flex flex-col gap-2 mt-2">
                {game.hints.slice(0, tries + (status !== "playing" ? 1 : 0)).map((hint, i) => (
                  hint.type === 'text' ? (
                    <Badge key={i} variant="secondary" className="w-full text-left whitespace-normal py-3 px-4 mb-1 text-base rounded-lg shadow">
                      {hint.value}
                    </Badge>
                  ) : hint.type === 'image' ? (
                    <div key={i} className="w-full flex justify-center mb-2">
                      <div className="relative w-40 h-56 rounded-lg overflow-hidden border shadow bg-muted">
                        <Image
                          src={"https:" + hint.value.replace("t_thumb", "t_cover_big")}
                          alt="Jacket très floutée"
                          fill
                          className="object-cover w-full h-full blur-[8px]"
                          style={{ filter: 'blur(8px)' }}
                        />
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
              {status === "playing" && (
                <form onSubmit={handleGuess} className="w-full flex flex-col gap-0 mt-4 relative">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="Nom du jeu..."
                      className="flex-1 text-lg px-4 py-3 rounded-lg shadow"
                      autoFocus
                      disabled={status !== "playing"}
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={!input.trim()} className="text-lg px-6 py-3 rounded-lg shadow font-bold">
                      Valider
                    </Button>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 right-0 top-full z-20 bg-popover border border-border rounded-b-xl shadow-lg max-h-56 overflow-auto mt-1"
                    >
                      {suggestions.map((s, i) => (
                        <div
                          key={s.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-accent rounded transition-colors ${i === highlighted ? 'bg-accent' : ''}`}
                          onMouseDown={() => handleSuggestionClick(s.name)}
                          onMouseEnter={() => setHighlighted(i)}
                          tabIndex={-1}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              )}
              <div className="w-full flex justify-between mt-2 text-base text-muted-foreground">
                <span>Essais restants : <span className="font-bold text-foreground">{5 - tries}</span></span>
                <span>Indice {game.hints.length ? Math.min(tries + 1, game.hints.length) : 0}/{game.hints.length}</span>
              </div>
              {status === "won" && (
                <div className="w-full text-center mt-4 bg-green-100 text-green-700 font-bold text-xl rounded-lg py-4 shadow flex flex-col items-center gap-2">
                  <span className="text-3xl">🎉</span>
                  Bravo ! C&apos;était bien <span className="underline">{game.name}</span>
                  <Button className="mt-2" onClick={() => { setMode(null); setTimeout(() => setMode(mode), 0); }}>
                    Rejouer
                  </Button>
                </div>
              )}
              {status === "lost" && (
                <div className="w-full text-center mt-4 bg-red-100 text-red-700 font-bold text-xl rounded-lg py-4 shadow flex flex-col items-center gap-2">
                  <span className="text-3xl">😢</span>
                  Raté ! La réponse était <span className="underline">{game.name}</span>
                  <Button className="mt-2" onClick={() => { setMode(null); setTimeout(() => setMode(mode), 0); }}>
                    Rejouer
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
} 