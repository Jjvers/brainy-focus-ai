import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Eye, TrendingUp, ArrowRight, BarChart, Sparkles, BookOpen, Star } from "lucide-react";
import logoImage from "@/assets/logo.png";
import cloudsImage from "@/assets/clouds-decoration.png";
import booksImage from "@/assets/books-illustration.png";
import starsImage from "@/assets/stars-pattern.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-sky relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${cloudsImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none animate-pulse-glow"
        style={{ backgroundImage: `url(${starsImage})`, backgroundSize: '600px', backgroundRepeat: 'repeat' }}
      />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-bounce-in">
            <img src={logoImage} alt="StudyBuddy Logo" className="w-32 h-32 drop-shadow-glow" />
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 bg-accent/80 backdrop-blur-sm rounded-full text-accent-foreground border-2 border-accent shadow-magic animate-wiggle">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold text-lg">✨ Belajar Jadi Lebih Seru! ✨</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-foreground leading-tight tracking-tight">
            Yuk Belajar Bareng
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">StudyBuddy!</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold">
            Pantau fokus belajar kamu dengan AI yang lucu dan ramah! 🚀📚
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="shadow-glow hover:shadow-magic transition-all gap-3 text-lg h-14 animate-bounce-in"
            >
              <Star className="w-6 h-6" />
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Books Illustration */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-center">
          <img src={booksImage} alt="Books" className="w-80 h-80 object-contain drop-shadow-glow animate-float" />
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-12 text-foreground">
          Kenapa StudyBuddy Keren? 🌟
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 border-primary/30 bg-card/90 backdrop-blur-sm hover:shadow-glow transition-all hover:scale-105 duration-300">
            <CardContent className="pt-8 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow animate-bounce-in">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">👀 Deteksi Langsung</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                AI pintar yang bisa tau kamu lagi fokus atau enggak secara real-time!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/30 bg-card/90 backdrop-blur-sm hover:shadow-magic transition-all hover:scale-105 duration-300">
            <CardContent className="pt-8 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-secondary rounded-3xl flex items-center justify-center shadow-magic animate-bounce-in animation-delay-100">
                <BarChart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">📊 Analisis Keren</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Lihat progres belajar kamu dengan grafik dan chart yang colorful!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/50 bg-card/90 backdrop-blur-sm hover:shadow-glow transition-all hover:scale-105 duration-300">
            <CardContent className="pt-8 space-y-4 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-accent rounded-3xl flex items-center justify-center shadow-glow animate-bounce-in animation-delay-200">
                <Brain className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">💡 Tips Pintar</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Dapet rekomendasi personal buat belajar lebih efektif!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20 max-w-4xl relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-foreground">
          Cara Pakainya Gampang Banget! 🎯
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6 items-start bg-card/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-primary/20 shadow-card hover:shadow-glow transition-all">
            <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-black text-2xl shadow-glow flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">📸 Daftar Pake Wajah</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Bikin akun dan scan wajah kamu buat login yang super cepat dan aman!
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start bg-card/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-secondary/20 shadow-card hover:shadow-magic transition-all">
            <div className="w-14 h-14 rounded-full bg-gradient-secondary flex items-center justify-center text-white font-black text-2xl shadow-magic flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">📚 Pilih Materi</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Tentuin mau belajar apa, trus mulai deh sesi belajar kamu!
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start bg-card/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-info/20 shadow-card hover:shadow-glow transition-all">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-info to-primary flex items-center justify-center text-white font-black text-2xl shadow-glow flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">🎯 AI Pantau Fokus</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                AI kita bakal ngawasin fokus kamu tiap detik, jadi tau kapan kamu lagi konsen atau enggak!
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start bg-card/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-success/20 shadow-card hover:shadow-glow transition-all">
            <div className="w-14 h-14 rounded-full bg-gradient-success flex items-center justify-center text-white font-black text-2xl shadow-glow flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">📈 Lihat Hasil</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Dapetin laporan lengkap dan tips buat belajar makin mantap!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <Card className="max-w-3xl mx-auto shadow-magic bg-gradient-magic text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute top-10 left-10">
              <Star className="w-12 h-12 text-accent animate-pulse" />
            </div>
            <div className="absolute bottom-10 right-10">
              <BookOpen className="w-16 h-16 text-accent animate-bounce" />
            </div>
            <div className="absolute top-1/2 left-1/4">
              <Sparkles className="w-8 h-8 text-accent animate-wiggle" />
            </div>
          </div>
          <CardContent className="p-12 text-center space-y-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black">Siap Jadi Pelajar Hebat? 🌟</h2>
            <p className="text-xl text-white/90 max-w-xl mx-auto font-semibold">
              Gabung bareng ribuan pelajar yang udah belajar lebih pintar pake StudyBuddy!
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate("/auth")} 
              className="gap-3 mt-4 text-xl h-16 px-8 shadow-glow hover:scale-110 transition-all"
            >
              <Star className="w-6 h-6" />
              Yuk Mulai Gratis!
              <ArrowRight className="w-6 h-6" />
            </Button>
            <p className="text-white/70 text-sm font-semibold">
              ✨ Gratis • Gampang • Seru Banget ✨
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground relative z-10">
        <p className="text-lg font-semibold">💙 Dibuat dengan cinta buat kamu yang semangat belajar 📚</p>
      </footer>
    </div>
  );
};

export default Index;
