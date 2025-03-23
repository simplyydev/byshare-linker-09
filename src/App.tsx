
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import FileView from "./pages/FileView";
import UserHistory from "./pages/UserHistory";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Initialize config
import config from "./lib/config";

const queryClient = new QueryClient();

// Initialize default settings if they are not already set
if (!localStorage.getItem('byshare_config')) {
  // Default values are already set in config.js
  // but we can ensure they're saved to localStorage
  config.set('upload.maxSizeMB', config.get('upload.maxSizeMB'));
  config.set('upload.acceptedFileTypes', config.get('upload.acceptedFileTypes'));
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/files/:id" element={<FileView />} />
            <Route path="/history" element={<UserHistory />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
