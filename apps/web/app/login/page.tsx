import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { LoginForm } from "@/components/auth/login-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";


export const metadata: Metadata = {
  title: "Connexion - Gam'Ex",
  description: "Connectez-vous à votre compte Gam'Ex",
};

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams.redirectTo as string | undefined;

  return (
    <>
      <Navbar />
      <main className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Bienvenue sur Gam'Ex</CardTitle>
            <CardDescription>
              {redirectTo 
                ? "Connectez-vous pour accéder à cette page"
                : "Connectez-vous pour accéder à votre tableau de bord"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm redirectTo={redirectTo} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm redirectTo={redirectTo} />
              </TabsContent>
            </Tabs>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <OAuthButtons redirectTo={redirectTo} />
          </CardContent>
        </Card>
      </main>
    </>
  );
} 