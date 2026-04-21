import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, NavLink } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import HRAgentPage from "./pages/HRAgentPage.tsx";
import { Bot, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

function AppNav() {
  return (
    <nav className="flex items-center gap-1 h-full">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors",
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )
        }
      >
        <Workflow className="h-3.5 w-3.5" />
        Workflow Editor
      </NavLink>
      <NavLink
        to="/agent"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-colors",
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )
        }
      >
        <Bot className="h-3.5 w-3.5" />
        HR Assistant
      </NavLink>
    </nav>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Top bar nav */}
        <div className="fixed top-0 left-0 right-0 z-50 h-10 bg-card border-b border-border flex items-center px-3 gap-4">
          <span className="text-sm font-bold text-foreground mr-2">FlowBuilder</span>
          <AppNav />
        </div>

        {/* Page content pushed below nav */}
        <div className="pt-10 h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agent" element={<HRAgentPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;