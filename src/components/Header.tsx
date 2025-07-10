import { Phone, Upload, Users, FileText, LogOut, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "./UserAvatar";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin?: boolean;
}

const Header = ({ activeTab, setActiveTab, isAdmin = false }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOccTheme, setIsOccTheme] = useState(false);

  // Check for OCC themes (both basic and dark)
  useEffect(() => {
    const checkTheme = () => {
      const isOccBasic = document.body.classList.contains('occ-basic-theme');
      const isOccDark = document.body.classList.contains('occ-dark-theme');
      setIsOccTheme(isOccBasic || isOccDark);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleAdminClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  };

  const adminTabs = [
    { id: "upload", label: "Upload Contacts", icon: Upload },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "sms", label: "SMS Management", icon: MessageSquare },
    { id: "dialer", label: "Dialer", icon: Users },
  ];

  const getActiveTabLabel = () => {
    const activeTabInfo = adminTabs.find(tab => tab.id === activeTab);
    return activeTabInfo ? activeTabInfo.label : "Menu";
  };

  const isOccBasicTheme = document.body.classList.contains('occ-basic-theme');
  const isOccDarkTheme = document.body.classList.contains('occ-dark-theme');

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            {isOccTheme ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  src={isOccBasicTheme 
                    ? "/lovable-uploads/15661005-dc66-48a9-ac31-282232f7af2c.png"
                    : "/lovable-uploads/98a6a54a-36a7-4dd0-b3b9-011124cf273b.png"
                  }
                  alt="OCC Logo" 
                  className="w-full h-full object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 0 0 transparent)',
                    background: 'transparent'
                  }}
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold text-card-foreground">OCC Secure Dialer</h1>
              <p className="text-sm text-muted-foreground">Privacy-focused calling solution</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 system-status rounded-full"></div>
              <span className="text-sm text-muted-foreground">System Ready</span>
            </div>
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user.first_name || user.email}
              </span>
            )}
            {user?.role === 'admin' && !isAdmin && (
              <Button variant="outline" size="sm" onClick={handleAdminClick}>
                Admin
              </Button>
            )}
            <UserAvatar />
          </div>
        </div>
        
        <nav className="border-b border-border">
          {isAdmin ? (
            <>
              {/* Mobile dropdown */}
              {isMobile ? (
                <div className="py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        <span className="flex items-center space-x-2">
                          <Menu className="w-4 h-4" />
                          <span>{getActiveTabLabel()}</span>
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {adminTabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                          <DropdownMenuItem
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 ${
                              activeTab === tab.id ? "bg-green-50 text-green-600" : ""
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                /* Desktop tabs */
                <div className="flex space-x-0 overflow-x-auto">
                  {adminTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-green-500 text-green-600 bg-green-50"
                            : "border-transparent text-muted-foreground hover:text-card-foreground"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex space-x-0">
              <button
                onClick={() => setActiveTab("dialer")}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === "dialer"
                    ? "border-green-500 text-green-600 bg-green-50"
                    : "border-transparent text-muted-foreground hover:text-card-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Dialer</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
