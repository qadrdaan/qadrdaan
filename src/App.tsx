import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import UploadBook from "./pages/UploadBook";
import Poets from "./pages/Poets";
import PoetProfile from "./pages/PoetProfile";
import Mushairas from "./pages/Mushairas";
import MushairaDetail from "./pages/MushairaDetail";
import CreateMushaira from "./pages/CreateMushaira";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import UploadVideo from "./pages/UploadVideo";
import NotFound from "./pages/NotFound";
import Competitions from "./pages/Competitions";
import CompetitionDetail from "./pages/CompetitionDetail";
import CreateCompetition from "./pages/CreateCompetition";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/books" element={<Books />} />
            <Route path="/book/:id" element={<BookDetail />} />
            <Route path="/upload-book" element={<UploadBook />} />
            <Route path="/poets" element={<Poets />} />
            <Route path="/poet/:userId" element={<PoetProfile />} />
            <Route path="/mushairas" element={<Mushairas />} />
            <Route path="/mushaira/:id" element={<MushairaDetail />} />
            <Route path="/create-mushaira" element={<CreateMushaira />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/competition/:id" element={<CompetitionDetail />} />
            <Route path="/create-competition" element={<CreateCompetition />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/video/:id" element={<VideoDetail />} />
            <Route path="/upload-video" element={<UploadVideo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
