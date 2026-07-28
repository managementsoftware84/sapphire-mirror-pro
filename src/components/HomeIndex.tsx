import {
  Play, Heart, ShoppingCart, Search, Bell,
  Star, Award, CheckCircle,
  Clock, Briefcase,
  Shield, Lock,
  Eye, Megaphone, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import softwareValaLogo from "@/assets/software-vala-logo.jpg";
import HeroCarousel from "@/components/marketplace/HeroCarousel";
import FestiveBanner from "@/components/marketplace/FestiveBanner";
import CategorySlider from "@/components/marketplace/CategorySlider";
import {
  IndustryGrid, AIZone, SuccessStories, AwardsRow, LiveActivity,
  ValaTV, Academy as ValaAcademy, PartnerEcosystem, FaqSection, EnterpriseCTA,
} from "@/components/marketplace/RefSections";
import { catalogPublicQuery } from "@/lib/catalog/catalogQueries";
import { toViewDemo } from "@/lib/catalog/productIcons";

interface Demo {
  id: string;
  name: string;
  category: string;
  masterCategory: string;
  description: string;
  url: string;
  icon: any;
  status: "ACTIVE" | "COMING_SOON";
  features: string[];
  frontend: string[];
  backend: string[];
  color: string;
  price: string;
  discountPrice: string;
}


const Index = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredDemos = allDemos.filter(demo => {
    const matchesCategory = activeCategory === "All" || demo.masterCategory === activeCategory;
    const matchesSearch = demo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          demo.masterCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Count demos per master category
  const getCategoryCount = (category: string) => {
    if (category === "All") return allDemos.length;
    return allDemos.filter(d => d.masterCategory === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0d1e36] to-[#0a1628]">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 py-4 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src={softwareValaLogo} alt="Software Vala" className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-lg" />
              <div>
                <h1 className="text-white font-bold text-2xl">Software Vala</h1>
                <p className="text-white/90 text-sm">- The Name of Trust</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {/* Career Portal Buttons */}
              <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1 text-xs">
                <a href="/careers?type=developer">
                  <Code2 className="h-3 w-3" />
                  Join as Developer
                </a>
              </Button>
              <Button asChild size="sm" className="bg-pink-600 hover:bg-pink-700 text-white gap-1 text-xs">
                <a href="/careers?type=influencer">
                  <Megaphone className="h-3 w-3" />
                  Become Influencer
                </a>
              </Button>
              <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1 text-xs">
                <a href="/careers?type=job">
                  <Briefcase className="h-3 w-3" />
                  Apply for Job
                </a>
              </Button>
              {/* Pricing Badge */}
              <Badge className="bg-white text-green-600 font-bold text-sm px-3 py-1.5 animate-pulse">
                💰 $249 Lifetime
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-xs px-3 py-1.5">
                🎉 40% OFF
              </Badge>
              {/* Login Button - For regular users */}
              <Button asChild className="bg-white text-orange-600 hover:bg-white/90 font-bold gap-2">
                <a href="/auth">
                  <Lock className="h-4 w-4" />
                  Login
                </a>
              </Button>
              {/* Temporary Boss Portal Access - Remove after 2-3 days */}
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold gap-2 shadow-lg shadow-purple-500/30"
              >
                <a href="/boss/login">
                  <Shield className="h-4 w-4" />
                  Boss Portal
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Festive Banner */}
      <FestiveBanner />

      {/* Auto-sliding Hero Carousel (merged: featured products + catalog/lifetime/delivery/AI slides) */}
      <HeroCarousel />

      {/* Industry Grid */}
      <div className="max-w-7xl mx-auto"><IndustryGrid /></div>


      {/* Category Slider (auto-scroll) */}
      <CategorySlider />

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#0d1e36] to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
              <Star className="h-3 w-3 mr-1" /> 55 Master Categories • {allDemos.length} Software Solutions • 20 Live Demos
            </Badge>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" /> Full Source Code
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <CheckCircle className="h-5 w-5" /> 1 Year Free Support
              </div>
              <div className="flex items-center gap-2 text-orange-400">
                <CheckCircle className="h-5 w-5" /> Free Installation
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <CheckCircle className="h-5 w-5" /> Lifetime Updates
              </div>
            </div>
          </motion.div>
        </div>
      </section>




      {/* Category Filter - Master Categories */}
      <div className="bg-[#0d1e36]/80 backdrop-blur-sm border-b border-cyan-500/20 py-4 px-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search software..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a2d4a] border-cyan-500/30 text-white placeholder:text-gray-400"
              />
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {filteredDemos.length} Products
            </Badge>
          </div>
        </div>
      </div>

      {/* Demo Cards Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Group by Master Category when "All" is selected */}
          {activeCategory === "All" ? (
            masterCategories.slice(1).map(masterCat => {
              const categoryDemos = filteredDemos.filter(d => d.masterCategory === masterCat);
              if (categoryDemos.length === 0) return null;
              
              return (
                <div key={masterCat} id={masterCat} className="mb-12 scroll-mt-32">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-2xl font-bold text-white">{masterCat}</h3>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {categoryDemos.length} Products
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryDemos.map((demo, index) => (
                      <DemoCard 
                        key={demo.id} 
                        demo={demo} 
                        index={index}
                        isFavorite={favorites.includes(demo.id)}
                        onToggleFavorite={() => toggleFavorite(demo.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDemos.map((demo, index) => (
                <DemoCard 
                  key={demo.id} 
                  demo={demo} 
                  index={index}
                  isFavorite={favorites.includes(demo.id)}
                  onToggleFavorite={() => toggleFavorite(demo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reference marketplace sections (added below product grid, keeping design intact) */}
      <div className="max-w-7xl mx-auto">
        <AIZone />
        <SuccessStories />
        <AwardsRow />
        <LiveActivity />
        <ValaTV />
        <ValaAcademy />
        <PartnerEcosystem />
        <FaqSection />
        <EnterpriseCTA />
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1628] border-t border-cyan-500/20 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2024 Software Vala - The Name of Trust. All rights reserved.</p>
          <p className="text-cyan-400 mt-2">55 Master Categories • {allDemos.length} Software Solutions • 20 Live Demos Ready</p>
        </div>
      </footer>
    </div>
  );
};

// Demo Card Component - Enhanced with interactions
const DemoCard = ({ demo, index, isFavorite, onToggleFavorite }: { 
  demo: Demo; 
  index: number; 
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const Icon = demo.icon;
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'tech'>('features');
  const [showQuickView, setShowQuickView] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <Card className={`bg-gradient-to-br from-[#1a2d4a] to-[#0d1e36] border-cyan-500/20 transition-all duration-500 overflow-hidden group h-full ${isHovered ? 'border-cyan-400/60 shadow-2xl shadow-cyan-500/20 scale-[1.02]' : ''}`}>
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${demo.color} p-4 relative overflow-hidden`}>
            {/* Animated background pattern */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isHovered ? 'opacity-40' : ''}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-4 translate-y-4" />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <motion.div 
                className="bg-white/20 p-3 rounded-xl backdrop-blur-sm"
                animate={{ rotate: isHovered ? [0, -5, 5, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-8 w-8 text-white" />
              </motion.div>
              <div className="flex gap-2 items-center">
                {demo.status === "COMING_SOON" && (
                  <Badge className="bg-yellow-500/90 text-black font-bold text-xs animate-pulse">
                    COMING SOON
                  </Badge>
                )}
                {demo.status === "ACTIVE" && (
                  <Badge className="bg-emerald-500/90 text-white font-bold text-xs flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE DEMO
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Quick action buttons on hover */}
            <motion.div 
              className="absolute bottom-2 right-2 flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                  toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!');
                }}
                className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickView(!showQuickView);
                }}
                className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <Eye className="h-4 w-4 text-white" />
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-white leading-tight">{demo.name}</h3>
              {demo.status === "ACTIVE" && (
                <Badge className="bg-cyan-500/20 text-cyan-300 text-[10px] shrink-0 ml-2">
                  #{index + 1}
                </Badge>
              )}
            </div>
            <p className="text-cyan-400 text-xs mb-2 flex items-center gap-1">
              <Award className="h-3 w-3" /> {demo.category}
            </p>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{demo.description}</p>

            {/* Interactive Tabs */}
            <div className="mb-3">
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setActiveTab('features')}
                  className={`text-xs px-2 py-1 rounded transition-all ${activeTab === 'features' ? 'bg-cyan-500/30 text-cyan-300' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Features
                </button>
                <button
                  onClick={() => setActiveTab('tech')}
                  className={`text-xs px-2 py-1 rounded transition-all ${activeTab === 'tech' ? 'bg-purple-500/30 text-purple-300' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Tech Stack
                </button>
              </div>
              
              <motion.div 
                className="min-h-[52px]"
                initial={false}
                animate={{ opacity: 1 }}
                key={activeTab}
              >
                {activeTab === 'features' ? (
                  <div className="flex flex-wrap gap-1">
                    {demo.features.map((feature, i) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 cursor-default transition-colors">
                          {feature}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {[...demo.frontend, ...demo.backend].map((tech, i) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 cursor-default transition-colors">
                          {tech}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Price with animation */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-500 line-through text-sm">{demo.price}</span>
              <motion.span 
                className="text-emerald-400 font-bold text-xl"
                animate={{ scale: isHovered ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {demo.discountPrice}
              </motion.span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">
                40% OFF
              </Badge>
            </div>

            {/* Enhanced Actions */}
            <div className="flex gap-2 mt-auto">
              {demo.status === "ACTIVE" ? (
                <>
                  <a href={demo.url} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
                      <Play className="h-4 w-4 mr-2" /> Live Demo
                    </Button>
                  </a>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                    onClick={() => toast.success("🎉 Redirecting to purchase...", { description: `${demo.name} - ${demo.discountPrice}` })}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" /> Buy Now
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="flex-1 bg-gray-600/50 cursor-not-allowed text-gray-400 border border-gray-500/30"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-2" /> Coming Soon
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all"
                    onClick={() => toast.info("📧 We'll notify you when this is available!", { description: demo.name })}
                  >
                    <Bell className="h-4 w-4 mr-2" /> Notify Me
                  </Button>
                </>
              )}
            </div>
            
            {/* Quick Stats on hover */}
            <motion.div 
              className="mt-3 pt-3 border-t border-cyan-500/10 grid grid-cols-3 gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <p className="text-cyan-400 text-lg font-bold">{Math.floor(Math.random() * 50 + 50)}+</p>
                <p className="text-gray-500 text-[10px]">Clients</p>
              </div>
              <div className="text-center">
                <p className="text-emerald-400 text-lg font-bold">4.{Math.floor(Math.random() * 3 + 7)}</p>
                <p className="text-gray-500 text-[10px]">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 text-lg font-bold">{Math.floor(Math.random() * 10 + 5)}h</p>
                <p className="text-gray-500 text-[10px]">Delivery</p>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Index;
