import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Eye, TrendingUp, ArrowRight, BarChart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-block px-6 py-2 bg-accent/50 backdrop-blur-sm rounded-full text-sm text-accent-foreground border border-accent">
            Intelligent Focus Analytics
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Your Personal
            <br />
            Study Sanctuary
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your learning experience with gentle guidance, mindful tracking, and insights that help you reach your potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-elegant hover:shadow-glow transition-all gap-2">
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-500">
            <CardContent className="pt-8 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Mindful Monitoring</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gentle, real-time awareness of your focus state through advanced eye tracking and attention analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-500">
            <CardContent className="pt-8 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-accent/40 to-accent/20 rounded-2xl flex items-center justify-center">
                <BarChart className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Insightful Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover your study rhythms through beautiful visualizations and thoughtful progress tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-500">
            <CardContent className="pt-8 space-y-4">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary/30 to-secondary/15 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Thoughtful Guidance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Personalized recommendations that adapt to your learning style and help you grow steadily.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">How It Works</h2>
        <div className="space-y-10">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Register Securely</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your account and register your face for secure, passwordless authentication.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Begin Your Session</h3>
              <p className="text-muted-foreground leading-relaxed">
                Select your study material and let the system gently monitor your focus.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Track Mindfully</h3>
              <p className="text-muted-foreground leading-relaxed">
                The system observes your attention patterns in real-time, providing subtle feedback.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">Reflect & Grow</h3>
              <p className="text-muted-foreground leading-relaxed">
                Review detailed insights and receive thoughtful recommendations for continuous improvement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-3xl mx-auto shadow-elegant bg-gradient-to-br from-primary/90 to-primary-glow/80 text-primary-foreground border-0">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Transform Your Study Habits?</h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Join students who are learning with greater awareness and intention.
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="gap-2 mt-4">
              Begin Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        <p>Built with care for mindful learning</p>
      </footer>
    </div>
  );
};

export default Index;
