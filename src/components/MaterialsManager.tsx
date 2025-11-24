import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, BookOpen, Target, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Material {
  id: string;
  name: string;
  category: string;
  total_sessions: number;
  total_duration: number;
  total_focus_score: number;
  progress_percentage: number;
  target_hours: number;
  notes: string | null;
}

export const MaterialsManager = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    category: "Mathematics",
    target_hours: 10,
    notes: "",
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive",
      });
      return;
    }

    setMaterials(data || []);
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name.trim()) {
      toast({
        title: "Material Name Required",
        description: "Please enter a material name",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("study_materials").insert({
      user_id: user.id,
      name: newMaterial.name,
      category: newMaterial.category,
      target_hours: newMaterial.target_hours,
      notes: newMaterial.notes,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Material Added",
      description: "Your study material has been added successfully",
    });

    setNewMaterial({ name: "", category: "Mathematics", target_hours: 10, notes: "" });
    setIsAdding(false);
    loadMaterials();
  };

  const handleDeleteMaterial = async (id: string) => {
    const { error } = await supabase.from("study_materials").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Material Deleted",
      description: "Study material has been removed",
    });

    loadMaterials();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Study Materials Tracker
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track progress for all your study materials
          </p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="shadow-glow bg-gradient-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>

      {isAdding && (
        <Card className="shadow-colorful border-2 border-primary/30 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              New Study Material
            </CardTitle>
            <CardDescription>Add a new material to track your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="materialName">Material Name</Label>
              <Input
                id="materialName"
                placeholder="e.g., Calculus, Python Programming, English Literature..."
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newMaterial.category}
                  onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Language">Language</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetHours">Target Hours</Label>
                <Input
                  id="targetHours"
                  type="number"
                  min="1"
                  value={newMaterial.target_hours}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, target_hours: parseInt(e.target.value) || 10 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this material..."
                value={newMaterial.notes}
                onChange={(e) => setNewMaterial({ ...newMaterial, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMaterial} className="flex-1">Add Material</Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material, index) => {
          const completedHours = material.total_duration / 3600;
          const progressPercent = Math.min(100, (completedHours / material.target_hours) * 100);
          const avgFocus = material.total_sessions > 0
            ? (material.total_focus_score / material.total_sessions).toFixed(0)
            : 0;

          return (
            <Card
              key={material.id}
              className="shadow-card hover:shadow-colorful transition-all duration-300 border-2 border-transparent hover:border-primary/30 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <BookOpen className="w-3 h-3" />
                      {material.category}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Progress
                    </span>
                    <span className="font-bold">
                      {completedHours.toFixed(1)}h / {material.target_hours}h
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-info/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Sessions
                    </p>
                    <p className="text-xl font-bold text-primary">{material.total_sessions}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-success/10 to-secondary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Avg Focus
                    </p>
                    <p className="text-xl font-bold text-success">{avgFocus}%</p>
                  </div>
                </div>

                {material.notes && (
                  <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    {material.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {materials.length === 0 && !isAdding && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Materials Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first study material to track
            </p>
            <Button onClick={() => setIsAdding(true)} className="shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Material
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};