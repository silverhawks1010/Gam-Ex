"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IoLogoDiscord } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";

interface OAuthButtonsProps {
  redirectTo?: string;
}

export function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuthSignIn = async (provider: "google" | "discord" | "steam") => {
    setError(null);
    setIsLoading(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            redirectTo ? `?redirectTo=${redirectTo}` : ""
          }`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthSignIn("google")}
        disabled={!!isLoading}
      >
        {isLoading === "google" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-4 w-4" />
        )}
        Continuer avec Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthSignIn("discord")}
        disabled={!!isLoading}
      >
        {isLoading === "discord" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IoLogoDiscord className="mr-2 h-4 w-4" />
        )}
        Continuer avec Discord
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 