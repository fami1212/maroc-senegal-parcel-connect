import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const AuthPage = () => {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "client" as "client" | "transporteur"
  });
  
  // Sign in form state
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (signUpData.password !== signUpData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (signUpData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
            role: signUpData.role
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        setError("Cette adresse email est déjà utilisée");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      });
      
      if (error) throw error;
      
      navigate("/");
    } catch (error: any) {
      if (error.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showMobileNav={false}>
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-foreground">GoColis</span>
            </div>
          </div>

          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bienvenue</CardTitle>
              <CardDescription>
                Connectez-vous ou créez votre compte pour commencer
              </CardDescription>
            </CardHeader>
          
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin" className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Choisissez votre type de compte</Label>
                    <RadioGroup
                      value={signUpData.role}
                      onValueChange={(value: "client" | "transporteur") => 
                        setSignUpData(prev => ({ ...prev, role: value }))
                      }
                      className="grid grid-cols-1 gap-4"
                    >
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                          <RadioGroupItem value="client" id="client" />
                          <Label htmlFor="client" className="flex items-center space-x-2 cursor-pointer flex-1">
                            <Package className="h-5 w-5 text-secondary" />
                            <div>
                              <div className="font-medium">Client</div>
                              <div className="text-sm text-muted-foreground">J'envoie des colis</div>
                            </div>
                          </Label>
                        </div>
                      
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent transition-colors">
                          <RadioGroupItem value="transporteur" id="transporteur" />
                          <Label htmlFor="transporteur" className="flex items-center space-x-2 cursor-pointer flex-1">
                            <Truck className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium">Transporteur</div>
                              <div className="text-sm text-muted-foreground">Je transporte des colis</div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuthPage;