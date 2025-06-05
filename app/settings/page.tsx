"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/molecules/Navbar";
import { Footer } from "@/components/molecules/Footer";
import { 
  BsPerson, BsShield, BsDiscord, BsImage, 
  BsEnvelope, BsKey, BsEye, BsEyeSlash 
} from 'react-icons/bs';
import { useState, useRef, useEffect } from "react";
import { imageService } from "@/lib/services/imageService";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/hooks/useUser";
import { createClient } from '@/lib/supabase/client';
import { DescriptionEditor } from "@/components/profile/DescriptionEditor";

const supabase = createClient();

const IconWrapper = ({ icon: Icon, className }: { icon: any, className?: string }) => (
  <Icon className={className} />
);

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // États pour le profil
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    description: ''
  });

  // États pour les switches
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    onlineStatus: true,
    gameHistory: true
  });

  const [discordSettings, setDiscordSettings] = useState({
    showDiscord: true,
    showStatus: true,
    allowTeamFinding: true
  });

  // États pour les mots de passe
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadImages();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username, email, description')
      .eq('id', user.id)
      .single();

    if (profile) {
      setProfile({
        username: profile.username || '',
        email: profile.email || user.email || '',
        description: profile.description || ''
      });
    }
  };

  const loadImages = async () => {
    if (!user?.id) return;

    const avatar = await imageService.getImageUrl(user.id, 'avatar');
    const banner = await imageService.getImageUrl(user.id, 'banner');

    setAvatarUrl(avatar);
    setBannerUrl(banner);
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour uploader des images",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await imageService.uploadImage(file, user.id, type);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "L'image a été mise à jour avec succès"
        });
        await loadImages();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileChange = (field: keyof typeof profile) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          description: profile.description
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Si l'email a changé, envoyer une confirmation
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });

        if (emailError) throw emailError;

        toast({
          title: "Email mis à jour",
          description: "Un email de confirmation a été envoyé à votre nouvelle adresse"
        });
      }

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'avatar');
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, 'banner');
    }
  };

  // Gestionnaires d'événements
  const handlePrivacyChange = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDiscordChange = (setting: keyof typeof discordSettings) => {
    setDiscordSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordChange = (field: keyof typeof passwords) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordUpdate = () => {
    if (passwords.new !== passwords.confirm) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    // TODO: Implémenter la logique de mise à jour du mot de passe
    console.log("Mise à jour du mot de passe...");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <IconWrapper icon={BsPerson} className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <IconWrapper icon={BsKey} className="w-4 h-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <IconWrapper icon={BsShield} className="w-4 h-4" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="discord" className="flex items-center gap-2">
              <IconWrapper icon={BsDiscord} className="w-4 h-4" />
              Discord
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et votre apparence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="space-y-2">
                  <Label>Photo de profil</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!avatarUrl && (
                        <IconWrapper icon={BsImage} className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={handleAvatarClick}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Upload en cours...' : 'Changer la photo'}
                      </Button>
                      <input
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Bannière */}
                <div className="space-y-2">
                  <Label>Bannière</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-full h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!bannerUrl && (
                        <IconWrapper icon={BsImage} className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        onClick={handleBannerClick}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Upload en cours...' : 'Changer la bannière'}
                      </Button>
                      <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Informations de base */}
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input 
                      id="username" 
                      placeholder="Votre nom d'utilisateur"
                      value={profile.username}
                      onChange={handleProfileChange('username')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Votre email"
                      value={profile.email}
                      onChange={handleProfileChange('email')}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <DescriptionEditor initialValue={profile.description || ''} />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleProfileUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
                <CardDescription>
                  Modifiez votre mot de passe pour sécuriser votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPasswords.current ? "text" : "password"}
                      value={passwords.current}
                      onChange={handlePasswordChange('current')}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <IconWrapper icon={BsEyeSlash} className="w-4 h-4" />
                      ) : (
                        <IconWrapper icon={BsEye} className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showPasswords.new ? "text" : "password"}
                      value={passwords.new}
                      onChange={handlePasswordChange('new')}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <IconWrapper icon={BsEyeSlash} className="w-4 h-4" />
                      ) : (
                        <IconWrapper icon={BsEye} className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={handlePasswordChange('confirm')}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <IconWrapper icon={BsEyeSlash} className="w-4 h-4" />
                      ) : (
                        <IconWrapper icon={BsEye} className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button className="w-full" onClick={handlePasswordUpdate}>
                  Mettre à jour le mot de passe
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Confidentialité */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de confidentialité</CardTitle>
                <CardDescription>
                  Contrôlez qui peut voir votre profil et vos informations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profil public</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux autres utilisateurs de voir votre profil
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.publicProfile}
                    onCheckedChange={() => handlePrivacyChange('publicProfile')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Statut en ligne</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher votre statut en ligne aux autres utilisateurs
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.onlineStatus}
                    onCheckedChange={() => handlePrivacyChange('onlineStatus')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Historique de jeu</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux autres de voir vos jeux et statistiques
                    </p>
                  </div>
                  <Switch 
                    checked={privacySettings.gameHistory}
                    onCheckedChange={() => handlePrivacyChange('gameHistory')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Discord */}
          <TabsContent value="discord">
            <Card>
              <CardHeader>
                <CardTitle>Intégration Discord</CardTitle>
                <CardDescription>
                  Connectez votre compte Discord pour trouver des coéquipiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Affichage Discord</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher votre tag Discord sur votre profil
                    </p>
                  </div>
                  <Switch 
                    checked={discordSettings.showDiscord}
                    onCheckedChange={() => handleDiscordChange('showDiscord')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Statut Discord</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher votre statut Discord (en ligne, occupé, etc.)
                    </p>
                  </div>
                  <Switch 
                    checked={discordSettings.showStatus}
                    onCheckedChange={() => handleDiscordChange('showStatus')}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recherche de coéquipiers</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux autres de vous trouver via Discord
                    </p>
                  </div>
                  <Switch 
                    checked={discordSettings.allowTeamFinding}
                    onCheckedChange={() => handleDiscordChange('allowTeamFinding')}
                  />
                </div>

                <Button className="w-full flex items-center justify-center gap-2">
                  <IconWrapper icon={BsDiscord} className="w-5 h-5" />
                  Connecter Discord
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
} 