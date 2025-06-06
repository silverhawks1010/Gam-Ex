import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  BsStar, BsPeople, BsController, BsDisplay, BsTranslate, 
  BsTag, BsBoxArrowUpRight, BsBag, BsCalendar, BsInfoCircle,
  BsImage, BsCameraVideo, BsList, BsCopy, BsGlobe, BsShop, 
  BsApple, BsGooglePlay, BsNintendoSwitch, BsXbox, BsPlaystation
} from 'react-icons/bs';
import { 
  BsFacebook, BsTwitter, BsTwitch, BsInstagram, BsYoutube,
  BsReddit
} from 'react-icons/bs';
import { SiSteam, SiItchdotio, SiEpicgames, SiGo } from 'react-icons/si';
import { IoGameController } from 'react-icons/io5';
import { MdOutlineShoppingCart } from 'react-icons/md';
import type { IconType } from 'react-icons';

import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { gameService } from "@/lib/services/gameService";
import { Game, Genre, Platform, IGDBImage, GameSummary, Video, Website } from "@/types/game";
import { RatingImage } from "@/components/atoms/RatingImage";
import { SupportedLanguages } from "@/components/molecules/SupportedLanguages";
import { GameCard } from '@/components/molecules/GameCard';
import { MediaCarousel } from '@/components/molecules/MediaCarousel';
import { AddToListModal } from '@/components/games/AddToListModal';

// Types pour les icônes
interface IconProps {
  className?: string;
}

const IconWrapper = ({ Icon, className }: { Icon: IconType } & IconProps) => (
  <Icon className={className} />
);

interface StoreLinkProps {
  id: number;
  url: string;
  store: {
    id: number;
    name: string;
    domain: string;
  };
}

async function getGame(id: string) {
  try {
    const [game, dlcs, franchiseGames] = await Promise.all([
      gameService.getGameDetails(parseInt(id)),
      gameService.getDLCs(parseInt(id)),
      gameService.getFranchiseGames(parseInt(id))
    ]);
    return { game, dlcs, franchiseGames };
  } catch (error) {
    console.error('Erreur lors du chargement du jeu:', error);
    return null;
  }
}

interface PageProps {
  params: { id: string };
}

// Helper functions (conservées)
function translateGameCategory(category?: number) {
  if (category === undefined) return 'Inconnu';
  const map: Record<number, string> = {
    0: 'Jeu principal', 1: 'DLC / Add-on', 2: 'Extension', 3: 'Bundle', 4: 'Jeu autonome',
    5: 'Mod', 6: 'Épisode', 7: 'Saison', 8: 'Remake', 9: 'Remaster',
    10: 'Jeu étendu', 11: 'Portage', 12: 'Fork', 13: 'Pack', 14: 'Mise à jour',
    15: 'Démo', 16: 'Bêta', 17: 'Accès Anticipé', 18: 'Annulé',
  };
  return map[category] || `Catégorie ${category}`;
}

function translateGameMode(modeName?: string) {
  if (!modeName) return 'Inconnu';
  const map: Record<string, string> = {
    'Single player': 'Solo', 'Multiplayer': 'Multijoueur', 'Co-operative': 'Coopératif',
    'Battle Royale': 'Battle Royale', 'Split screen': 'Écran partagé',
    'Massively Multiplayer Online (MMO)': 'MMO',
  };
  return map[modeName] || modeName;
}

const IconPlaceholder = ({ className }: { className?: string }) => <div className={`w-4 h-4 bg-muted rounded-sm ${className}`} />;

// Nouvelle fonction helper pour traduire la catégorie du contenu additionnel
function translateContentCategory(category?: number): string | undefined {
  if (category === undefined) return undefined;
  const map: Record<number, string> = {
    1: 'DLC / Add-on',
    2: 'Extension',
    3: 'Bundle',
    4: 'Jeu Autonome', // Standalone Expansion
    5: 'Mod',
    6: 'Épisode',
    7: 'Saison',
    // On peut ajouter d'autres cas si pertinent pour les GameSummary
  };
  return map[category] || `Type ${category}`;
}

// Utilitaire pour détecter la plateforme d'achat à partir de l'URL
const purchasePlatforms = [
  {
    name: 'Steam',
    domain: 'store.steampowered.com',
    icon: <IconWrapper Icon={SiSteam} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'GOG',
    domain: 'gog.com',
    icon: <IconWrapper Icon={SiGo} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Epic Games',
    domain: 'epicgames.com',
    icon: <IconWrapper Icon={SiEpicgames} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Xbox',
    domain: 'xbox.com',
    icon: <IconWrapper Icon={BsXbox} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'PlayStation',
    domain: 'store.playstation.com',
    icon: <IconWrapper Icon={BsPlaystation} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Nintendo',
    domain: 'nintendo.com',
    icon: <IconWrapper Icon={BsNintendoSwitch} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Itch.io',
    domain: 'itch.io',
    icon: <IconWrapper Icon={SiItchdotio} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Apple App Store',
    domain: 'apple.com',
    icon: <IconWrapper Icon={BsApple} className="w-4 h-4 mr-2" />,
  },
  {
    name: 'Google Play',
    domain: 'play.google.com',
    icon: <IconWrapper Icon={BsGooglePlay} className="w-4 h-4 mr-2" />,
  },
];

function getPurchasePlatform(url: string) {
  return purchasePlatforms.find(platform => url.includes(platform.domain));
}

export default async function GamePage({ params }: PageProps) {
  const data = await getGame(params.id);

  if (!data || !data.game) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex items-center justify-center min-h-[calc(100vh-128px)]">
          <div className="text-center">
            {/* <Info className="mx-auto h-12 w-12 text-destructive mb-4" /> */}
            <IconPlaceholder className="mx-auto h-12 w-12 mb-4" />
            <h1 className="text-3xl font-bold text-destructive mb-2">Jeu non trouvé</h1>
            <p className="text-muted-foreground">Désolé, nous n'avons pas pu charger les détails pour ce jeu.</p>
            <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/library">Retourner à la bibliothèque</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { game, franchiseGames } = data;

  const officialWebsite = game.websites?.find(w => getPurchasePlatform(w.url)?.name === 'Steam' || getPurchasePlatform(w.url)?.name === 'Site Officiel')?.url;

  // Préparation du contenu additionnel
  const additionalContentList: (GameSummary & { explicitType: string })[] = [];
  const seenIds = new Set<number>();

  const addContent = (items: GameSummary[] | undefined, explicitType?: string) => {
    items?.forEach(item => {
      if (!seenIds.has(item.id)) {
        additionalContentList.push({ 
            ...item, 
            explicitType: explicitType || translateContentCategory(item.category) || 'Contenu additionnel' 
        });
        seenIds.add(item.id);
      }
    });
  };

  // Prioriser les types spécifiques puis les collections plus générales
  addContent(game.dlcs, 'DLC');
  addContent(game.expansions, 'Extension');
  addContent(game.bundles, 'Bundle');
  addContent(game.additions); // Utilise translateContentCategory pour game.additions
  
  // Trier par date de sortie si disponible, sinon par nom
  additionalContentList.sort((a, b) => {
    if (a.first_release_date && b.first_release_date) {
      return b.first_release_date - a.first_release_date; // Plus récent d'abord
    }
    if (a.first_release_date) return -1; // a a une date, b n'en a pas
    if (b.first_release_date) return 1;  // b a une date, a n'en a pas
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] w-full text-white">
        <div className="absolute inset-0 bg-black/50 z-10" /> 
        {game.artworks && game.artworks.length > 0 ? (
            <Image
                src={game.artworks[0].url.replace('/t_thumb/', '/t_1080p/')}
                alt={`Artwork principal de ${game.name}`}
                fill
                className="object-cover"
                priority
            />
        ) : game.screenshots && game.screenshots.length > 0 ? (
            <Image
                src={game.screenshots[0].url.replace('/t_thumb/', '/t_1080p/')}
                alt={`Screenshot principal de ${game.name}`}
                fill
                className="object-cover"
                priority
            />
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                {/* <ImageIcon className="w-24 h-24 text-slate-700" /> */}
                <IconPlaceholder className="w-24 h-24" />
            </div>
        )}

        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <div className="container mx-auto px-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-3 tracking-tight leading-tight break-words">{game.name}</h1>
            {game.summary && <p className="text-sm md:text-base text-slate-300 max-w-3xl mb-4 line-clamp-2 md:line-clamp-3">{game.summary}</p>}
            <div className="flex flex-wrap gap-2 mb-6">
              {game.genres?.slice(0, 4).map(g => <Badge key={g.id} variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-none text-xs md:text-sm">
                <span>{g.name}</span>
              </Badge>)}
            </div>
            <div className="flex gap-4">
              {officialWebsite && (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold text-base px-8 py-6">
                  <Link href={officialWebsite} target="_blank" rel="noopener noreferrer">
                    <IconWrapper Icon={BsGlobe} className="mr-2 h-5 w-5" />
                    Site Officiel
                  </Link>
                </Button>
              )}
              <AddToListModal gameId={game.id.toString()} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar (Game Info) */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card className="shadow-lg border-border/60 pt-0">
              <CardContent className="p-0">
                {game.cover ? (
                  <AspectRatio ratio={3 / 4}>
                    <Image src={game.cover.url.replace('/t_thumb/', '/t_cover_big/')} alt={`Jaquette de ${game.name}`} fill className="object-cover rounded-t-lg" />
                  </AspectRatio>
                ) : (
                  <AspectRatio ratio={3 / 4} className="bg-muted flex items-center justify-center rounded-t-lg">
                    <IconWrapper Icon={BsImage} className="w-16 h-16 text-muted-foreground" />
                  </AspectRatio>
                )}
                <div className="p-4 space-y-3">
                  {(game.aggregated_rating || game.rating) && (
                    <div className="flex items-center">
                      <IconWrapper Icon={BsStar} className="w-5 h-5 text-yellow-400 mr-1.5" />
                      <span className="font-semibold text-lg">{(game.aggregated_rating || game.rating)?.toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                      <span className="text-xs text-muted-foreground ml-2">({(game.aggregated_rating_count || game.ratings_count || 0)} votes)</span>
                    </div>
                  )}
                  {game.first_release_date && (
                    <div className="flex items-center text-sm">
                      <IconWrapper Icon={BsCalendar} className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="font-medium">Sortie:</span>
                      <span className="text-muted-foreground ml-1.5">{new Date(game.first_release_date * 1000).toLocaleDateString()}</span>
                    </div>
                  )}
                  {game.category !== undefined && (
                     <div className="flex items-center text-sm">
                       <IconWrapper Icon={BsInfoCircle} className="w-4 h-4 text-muted-foreground mr-2" />
                       <span className="font-medium">Type:</span>
                       <span className="text-muted-foreground ml-1.5">{translateGameCategory(game.category)}</span>
                     </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-border/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-primary flex items-center">
                  <IconWrapper Icon={BsController} className="w-4 h-4 mr-2" />
                  Plateformes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {game.platforms && game.platforms.length > 0 ? 
                  game.platforms.map(({ platform }) => (
                    <Badge key={platform.id} variant="outline" className="border-primary/50 text-primary bg-primary/10 text-xs">
                      <span>{platform.name}</span>
                    </Badge>
                  ))
                  : <p className="text-xs text-muted-foreground">Non spécifiées</p>}
              </CardContent>
            </Card>

            {(game.developers || game.publishers) && (game.developers?.length || 0) + (game.publishers?.length || 0) > 0 && (
              <Card className="shadow-lg border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-primary flex items-center">
                    <IconWrapper Icon={BsPeople} className="w-4 h-4 mr-2" />
                    Créateurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {game.developers && game.developers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Développeurs</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {game.developers.map(dev => <Badge key={dev.id} variant="secondary" className="text-xs">
                          <span>{dev.name}</span>
                        </Badge>)}
                      </div>
                    </div>
                  )}
                  {game.publishers && game.publishers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-1.5">Éditeurs</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {game.publishers.map(pub => <Badge key={pub.id} variant="secondary" className="text-xs">
                          <span>{pub.name}</span>
                        </Badge>)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Nouvelle section pour les sites d'achat officiels */}
            {game.websites && game.websites.length > 0 && (
              <Card className="shadow-lg border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-primary flex items-center">
                    <IconWrapper Icon={MdOutlineShoppingCart} className="w-4 h-4 mr-2" />
                    Acheter sur une plateforme officielle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {game.websites
                    .map(website => {
                      const platform = getPurchasePlatform(website.url);
                      return platform ? { ...website, platform } : null;
                    })
                    .filter((website): website is Website & { platform: typeof purchasePlatforms[number] } => !!website)
                    .map(website => (
                      <Button
                        key={website.id}
                        variant="outline"
                        asChild
                        className="w-full justify-start border-border hover:border-primary/70 hover:bg-primary/5"
                      >
                        <Link href={website.url} target="_blank" rel="noopener noreferrer">
                          {website.platform.icon}
                          {website.platform.name}
                          <IconWrapper Icon={BsBoxArrowUpRight} className="w-3 h-3 ml-auto text-muted-foreground/70" />
                        </Link>
                      </Button>
                    ))}
                  {game.websites.filter(w => getPurchasePlatform(w.url)).length === 0 && (
                    <div className="text-xs text-muted-foreground">Aucun site d'achat officiel détecté.</div>
                  )}
                </CardContent>
              </Card>
            )}

            {game.stores && game.stores.length > 0 && (
              <Card className="shadow-lg border-border/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-primary flex items-center">
                    <IconWrapper Icon={MdOutlineShoppingCart} className="w-4 h-4 mr-2" />
                    Où acheter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {game.stores.map((s: StoreLinkProps) => {
                    const storeUrl = s.store.domain === 'store.steampowered.com' && s.url.includes('/app/')
                          ? s.url
                          : s.store.domain === 'store.steampowered.com'
                            ? `https://store.steampowered.com/app/${s.url.split('/').pop()}`
                            : s.url;
                    return (
                      <Button key={s.id} variant="outline" asChild className="w-full justify-start border-border hover:border-primary/70 hover:bg-primary/5">
                        <Link href={storeUrl || '#'} target="_blank" rel="noopener noreferrer" className={!storeUrl ? 'opacity-50 pointer-events-none' : ''}>
                          <IconWrapper Icon={BsShop} className="w-4 h-4 mr-2 text-muted-foreground" />
                          {s.store.name}
                          <IconWrapper Icon={BsBoxArrowUpRight} className="w-3 h-3 ml-auto text-muted-foreground/70" />
                        </Link>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Right Content Area */}
          <section className="lg:col-span-8 xl:col-span-9 space-y-6">
            {/* Carousel des Médias */}
            {(game.videos && game.videos.length > 0) || (game.screenshots && game.screenshots.length > 0) ? (
              <Card className="shadow-lg border-border/60">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary flex items-center">
                    <IconWrapper Icon={BsCameraVideo} className="w-5 h-5 mr-2" />
                    Médias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MediaCarousel 
                    videos={game.videos || []} 
                    screenshots={game.screenshots || []} 
                    gameName={game.name} 
                  />
                </CardContent>
              </Card>
            ) : null}
            
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-muted/60 border-border/60">
                <TabsTrigger value="about" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">À Propos</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Détails Techniques</TabsTrigger>
                <TabsTrigger value="additionnal" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Contenu Additionnel</TabsTrigger>
                <TabsTrigger value="franchise" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Franchise</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <Card className="shadow-lg border-border/60">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">À propos de {game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {game.storyline && (
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Scénario</h3>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{game.storyline}</p>
                        </div>
                    )}
                    {game.summary && !game.storyline && (
                         <div>
                            <h3 className="font-semibold text-lg mb-2">Résumé</h3>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{game.summary}</p>
                        </div>
                    )}
                    {game.game_modes && game.game_modes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <IconWrapper Icon={IoGameController} className="w-5 h-5 mr-2 text-primary" />
                          Modes de jeu
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {game.game_modes.map(mode => <Badge key={mode.id} variant="secondary">
                            <span>{translateGameMode(mode.name)}</span>
                          </Badge>)}
                        </div>
                      </div>
                    )}
                    {game.themes && game.themes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-md mb-2 flex items-center">
                          <IconWrapper Icon={BsTag} className="w-5 h-5 mr-2 text-primary" />
                          Thèmes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {game.themes.map(theme => <Badge key={theme.id} variant="secondary">
                            <span>{theme.name}</span>
                          </Badge>)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                  <div className="space-y-6">
                    {game.age_ratings && game.age_ratings.length > 0 && (
                        <Card className="shadow-lg border-border/60">
                            <CardHeader>
                              <CardTitle className="text-base font-semibold text-primary flex items-center">
                                <IconWrapper Icon={BsPeople} className="w-4 h-4 mr-2" />
                                Classification
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                                {game.age_ratings.map((rating, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 p-1.5 border border-border/50 rounded-md bg-muted/30">
                                        {rating.category === 1 && rating.rating && (
                                            <RatingImage src={`/images/pegi/pegi_${rating.rating}.svg`} alt={`PEGI ${rating.rating}`} width={24} height={24} className="h-6 w-auto" />
                                        )}
                                        {rating.category === 2 && rating.rating && (
                                            <RatingImage src={`/images/esrb/esrb_${rating.rating}.svg`} alt={`ESRB ${rating.rating}`} width={24} height={24} className="h-6 w-auto" />
                                        )}
                                        <span className="text-xs text-muted-foreground">
                                            {rating.category === 1 ? 'PEGI' : rating.category === 2 ? 'ESRB' : `Cat ${rating.category}`} {rating.rating || ''}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                    {game.language_supports && game.language_supports.length > 0 && (
                      <SupportedLanguages languageSupports={game.language_supports} />
                    )}
                    {game.alternative_names && game.alternative_names.length > 0 && (
                        <Card className="shadow-lg border-border/60">
                            <CardHeader>
                              <CardTitle className="text-base font-semibold text-primary flex items-center">
                                <IconWrapper Icon={BsList} className="w-4 h-4 mr-2" />
                                Noms Alternatifs
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {game.alternative_names.map(alt => <Badge key={alt.id} variant="outline" className="text-xs">
                                  <span>{alt.name}</span>
                                </Badge>)}
                            </CardContent>
                        </Card>
                    )}
                    {(game.version_title || game.version_parent || game.parent_game) && (
                         <Card className="shadow-lg border-border/60">
                            <CardHeader>
                              <CardTitle className="text-base font-semibold text-primary flex items-center">
                                <IconWrapper Icon={BsInfoCircle} className="w-4 h-4 mr-2" />
                                Informations de Version
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {game.version_title && <p><span className="font-medium">Titre de version:</span> <Badge variant="outline">
                                  <span>{game.version_title}</span>
                                </Badge></p>}
                                {game.version_parent && <p><span className="font-medium">Version parente:</span> <Link href={`/games/${game.version_parent.id}`} className="text-primary hover:underline">
                                  <Badge variant="secondary">
                                    <span>{game.version_parent.name}</span>
                                  </Badge>
                                </Link></p>}
                                {game.parent_game && (!game.version_parent || game.parent_game.id !== game.version_parent.id) && 
                                    <p><span className="font-medium">Basé sur/Port de:</span> <Link href={`/games/${game.parent_game.id}`} className="text-primary hover:underline">
                                      <Badge variant="secondary">
                                        <span>{game.parent_game.name}</span>
                                      </Badge>
                                    </Link></p>}
                            </CardContent>
                        </Card>
                    )}
                  </div>
              </TabsContent>

              <TabsContent value="additionnal" className="mt-6">
                {additionalContentList.length > 0 ? (
                  <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary flex items-center">
                      <IconWrapper Icon={BsDisplay} className="w-7 h-7 mr-3" />
                      Contenu Additionnel
                    </h2>
                    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-transparent">
                      {additionalContentList.map((contentItem) => {
                        const gameCardData: Game = {
                          id: contentItem.id,
                          name: contentItem.name,
                          slug: contentItem.slug || `item-${contentItem.id}`,
                          cover: contentItem.cover,
                          background_image: contentItem.cover?.url,
                          screenshots: [],
                          first_release_date: contentItem.first_release_date,
                          summary: contentItem.summary,
                          status: undefined,
                          release_dates: contentItem.first_release_date ? [{id:0, date: contentItem.first_release_date}] : [],
                          genres: [],
                          platforms: [],
                          rating: undefined,
                          aggregated_rating: undefined,
                          ratings_count: 0,
                          aggregated_rating_count: 0,
                        };
                        return (
                            <div key={contentItem.id} className="min-w-[280px] md:min-w-[300px]">
                                <GameCard game={gameCardData} contentType={contentItem.explicitType} />
                            </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <div className="text-muted-foreground">Aucun contenu additionnel.</div>
                )}
              </TabsContent>

              <TabsContent value="franchise" className="mt-6">
                {franchiseGames.results && franchiseGames.results.length > 0 ? (
                  <section>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary flex items-center">
                      <IconWrapper Icon={BsPeople} className="w-7 h-7 mr-3" />
                      Plus de la franchise {game.franchises?.[0]?.name || ''}
                    </h2>
                    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-transparent">
                      {franchiseGames.results.filter(fg => fg.id !== game.id).map((franchiseItem: Game) => (
                         <div key={franchiseItem.id} className="min-w-[280px] md:min-w-[300px]">
                            <GameCard game={franchiseItem} />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="text-muted-foreground">Aucun autre jeu dans la franchise.</div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>


        {/* Similar Games Section */}
        {game.similar_games && game.similar_games.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary flex items-center">
              <IconWrapper Icon={BsCopy} className="w-7 h-7 mr-3" />
              Jeux Similaires
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-transparent">
              {game.similar_games.filter(sg => sg.id !== game.id).map((similarGameItem: GameSummary) => {
                const gameCardData: Game = {
                  id: similarGameItem.id,
                  name: similarGameItem.name,
                  slug: similarGameItem.slug || `sim-${similarGameItem.id}`,
                  cover: similarGameItem.cover,
                  background_image: similarGameItem.cover?.url,
                  screenshots: [], 
                  first_release_date: similarGameItem.first_release_date,
                  summary: similarGameItem.summary,
                  status: undefined,
                  release_dates: similarGameItem.first_release_date ? [{id:0, date: similarGameItem.first_release_date}] : [],
                  genres: [],
                  platforms: [],
                  rating: undefined,
                  aggregated_rating: undefined,
                  ratings_count: 0,
                  aggregated_rating_count: 0,
                };
                return (
                  <div key={similarGameItem.id} className="min-w-[280px] md:min-w-[300px]">
                    <GameCard game={gameCardData} />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
} 