import Navbar from "@/components/Navbar";
import { MaterialsManager } from "@/components/MaterialsManager";

const Materials = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-hero p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <MaterialsManager />
        </div>
      </div>
    </>
  );
};

export default Materials;