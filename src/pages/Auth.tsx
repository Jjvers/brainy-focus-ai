import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, TrendingUp, Camera, Star, Sparkles } from "lucide-react";
import FaceLogin from "@/components/FaceLogin";
import FaceRegistration from "@/components/FaceRegistration";
import logoImage from "@/assets/logo.png";
import cloudsImage from "@/assets/clouds-decoration.png";
import starsImage from "@/assets/stars-pattern.png";

type AuthMode = "email" | "face-login" | "face-register";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("email");
  const [pendingUser, setPendingUser] = useState<{ email: string; password: string; nama: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const nama = formData.get("nama") as string;

    setPendingUser({ email, password, nama });
    setAuthMode("face-register");
    setLoading(false);
  };

  const handleFaceRegistrationComplete = async (descriptors: Float32Array[]) => {
    if (!pendingUser) return;
    
    setLoading(true);
    
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: pendingUser.email,
        password: pendingUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            nama: pendingUser.nama,
          },
        },
      });

      if (signUpError) {
        toast({
          title: "Error",
          description: signUpError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (authData.user) {
        const descriptorRecords = descriptors.map((descriptor) => ({
          user_id: authData.user!.id,
          descriptor: Array.from(descriptor),
          label: pendingUser.nama,
        }));

        const { error: descriptorError } = await supabase
          .from("face_descriptors")
          .insert(descriptorRecords);

        if (descriptorError) {
          console.error("Error saving face descriptors:", descriptorError);
          toast({
            title: "Warning",
            description: "Account created but face data could not be saved.",
            variant: "destructive",
          });
        } else {
        toast({
          title: "Success! 🎉",
          description: "Akun kamu udah jadi! Sekarang bisa login pake wajah!",
        });
        }
      }

      setPendingUser(null);
      setAuthMode("email");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Pendaftaran gagal. Coba lagi ya!",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleFaceRegistrationCancel = () => {
    setPendingUser(null);
    setAuthMode("email");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleFaceLoginSuccess = async (email: string, userId: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("face-auth", {
        body: { email, user_id: userId },
      });

      if (error || !data?.success) {
        console.error("Face auth error:", error || data?.error);
        toast({
          title: "Authentication Failed",
          description: data?.error || "Login gagal. Coba lagi!",
          variant: "destructive",
        });
        setAuthMode("email");
        setLoading(false);
        return;
      }

      toast({
        title: "Wajah Terverifikasi! ✨",
        description: "Lagi login...",
      });

      window.location.href = data.action_link;
    } catch (err) {
      console.error("Face login error:", err);
      toast({
        title: "Error",
        description: "Ada masalah. Coba lagi ya!",
        variant: "destructive",
      });
      setAuthMode("email");
      setLoading(false);
    }
  };

  if (authMode === "face-login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sky p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${starsImage})`, backgroundSize: '600px', backgroundRepeat: 'repeat' }}
        />
        <FaceLogin 
          onSuccess={handleFaceLoginSuccess}
          onCancel={() => setAuthMode("email")}
        />
      </div>
    );
  }

  if (authMode === "face-register") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-sky p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${starsImage})`, backgroundSize: '600px', backgroundRepeat: 'repeat' }}
        />
        <FaceRegistration
          onComplete={handleFaceRegistrationComplete}
          onCancel={handleFaceRegistrationCancel}
          requiredCaptures={5}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-sky p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${cloudsImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none animate-pulse-glow"
        style={{ backgroundImage: `url(${starsImage})`, backgroundSize: '600px', backgroundRepeat: 'repeat' }}
      />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding */}
        <div className="hidden md:block space-y-8">
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="StudyBuddy" className="w-32 h-32 drop-shadow-glow animate-bounce-in" />
          </div>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-accent/80 rounded-full border-2 border-accent">
              <Sparkles className="w-5 h-5 text-accent-foreground" />
              <span className="font-bold text-accent-foreground">✨ Belajar Jadi Seru! ✨</span>
            </div>
            <h1 className="text-5xl font-black text-foreground leading-tight">
              Yuk Gabung
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">StudyBuddy!</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed font-semibold">
              Pantau fokus belajar kamu dengan AI yang lucu dan ramah! 🚀
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-4 bg-card/70 backdrop-blur-sm p-4 rounded-2xl border-2 border-primary/20">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">👀 Deteksi Live</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pantau fokus belajar kamu secara real-time!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card/70 backdrop-blur-sm p-4 rounded-2xl border-2 border-secondary/20">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">📊 Analitik Keren</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lihat progres belajar dengan grafik yang colorful!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-card/70 backdrop-blur-sm p-4 rounded-2xl border-2 border-accent/20">
              <div className="p-3 bg-accent/30 rounded-xl">
                <Camera className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">📸 Login Wajah</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Login super cepat pake face recognition!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <Card className="shadow-magic border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center pt-8">
            <div className="flex justify-center md:hidden mb-4">
              <img src={logoImage} alt="StudyBuddy" className="w-20 h-20 drop-shadow-glow" />
            </div>
            <CardTitle className="text-3xl font-black">Halo! 👋</CardTitle>
            <CardDescription className="text-base text-muted-foreground font-semibold">
              Masuk atau daftar untuk mulai belajar!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => setAuthMode("face-login")}
              variant="outline"
              className="w-full gap-3 border-2 border-primary/40 hover:border-primary hover:bg-primary/10 h-12 font-bold"
            >
              <Camera className="w-5 h-5 text-primary" />
              Login Pake Wajah 📸
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-bold">
                  Atau pake email
                </span>
              </div>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="font-bold">Masuk</TabsTrigger>
                <TabsTrigger value="register" className="font-bold">Daftar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-bold">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="email@kamu.com"
                      required
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-bold">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="border-2"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 font-bold shadow-glow" disabled={loading}>
                    {loading ? "Loading..." : "Masuk Yuk! 🚀"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nama" className="font-bold">Nama Lengkap</Label>
                    <Input
                      id="register-nama"
                      name="nama"
                      type="text"
                      placeholder="Nama Kamu"
                      required
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="font-bold">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="email@kamu.com"
                      required
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="font-bold">Password</Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="border-2"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2 h-11 font-bold shadow-glow" disabled={loading}>
                    <Star className="w-4 h-4" />
                    {loading ? "Loading..." : "Lanjut ke Setup Wajah 📸"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground font-semibold">
                    Kamu bakal foto wajah buat login nanti ya! ✨
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
