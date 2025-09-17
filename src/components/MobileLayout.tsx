import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Brain } from 'lucide-react';
import { HogarIcon, FormacionIcon } from '@/components/icons/MobileNavIcons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import IABadge from '@/components/IABadge';

import { useCapacitor } from '@/hooks/useCapacitor';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/Header';
interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  hideHeader?: boolean;
}
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  hideHeader
}) => {
  const {
    user
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isCapacitor
  } = useCapacitor();
  const isMobile = useIsMobile();
  const isActivePath = (path: string) => location.pathname === path;
  const navigationItems = [{
    path: '/dashboard',
    icon: HogarIcon,
    label: 'Hogar'
  }, {
    path: '/ai',
    icon: Brain,
    label: 'IA'
  }, {
    path: '/education',
    icon: FormacionIcon,
    label: 'Formacion'
  }];

  const leftItem = navigationItems[0];
  const middleItem = navigationItems[1];
  const rightItem = navigationItems[2];
  const LeftIcon = leftItem.icon;
  const RightIcon = rightItem.icon;

  // Show mobile layout for authenticated users on mobile/tablet devices or in Capacitor
  const [isTabletOrMobile, setIsTabletOrMobile] = React.useState(false);
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth <= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const shouldUseMobileLayout = user && (isMobile || isCapacitor || isTabletOrMobile);

  // If user is not authenticated or not on mobile/capacitor, use regular layout
  if (!shouldUseMobileLayout) {
    return <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>;
  }
  return <div className="mobile-safe-area bg-background">
      {/* Mobile Header */}
      {!hideHeader && <header className="mobile-header">
          <div className="container-padding">
            <div className="flex items-center justify-between h-14">
              <h1 className="text-responsive-lg font-bold text-foreground">
                {title || 'Pixel Ed-Tech'}
              </h1>
              <div className="flex items-center gap-2">
                
              </div>
            </div>
          </div>
        </header>}

      {/* Main Content */}
      <main className={`mobile-scroll mobile-main-padding ${hideHeader ? 'min-h-[calc(100vh-0rem)]' : 'min-h-[calc(100vh-3.5rem)]'}`}>
        {children}
      </main>

      <nav className="mobile-bottom-nav" role="navigation" aria-label="Primary">
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none">
         <div className="translate-y-[-18px]">
          <IABadge
            label={middleItem.label}
            active={isActivePath(middleItem.path)}
            onClick={() => navigate(middleItem.path)}
            className="pointer-events-auto"
          />
        </div>
      </div>

          {/* Side nav buttons positioned at anchor lines */}
          <div className="relative h-24 px-0 pt-8 pb-4">
            {/* Left: Home at ~22% (matches left red line) */}
            <div className="absolute bottom-4 left-[20%] -translate-x-1/2">
              <Button
                key={leftItem.path}
                aria-label={leftItem.label}
                aria-current={isActivePath(leftItem.path) ? 'page' : undefined}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 touch-target px-4 py-2 rounded-xl font-montserrat text-foreground hover:bg-transparent ${isActivePath(leftItem.path) ? 'opacity-100' : 'opacity-80'}`}
                onClick={() => navigate(leftItem.path)}
              >
                <LeftIcon className="!h-11 !w-11 text-[hsl(var(--primary-foreground))]" />
               <span className="mobile-nav-label text-base font-bold text-[hsl(var(--primary-foreground))]">
                {leftItem.label}
               </span>

              </Button>
            </div>

            {/* Right: Education at ~78% (matches right red line) */}
            <div className="absolute bottom-4 left-[80%] -translate-x-1/2">
              <Button
                key={rightItem.path}
                aria-label={rightItem.label}
                aria-current={isActivePath(rightItem.path) ? 'page' : undefined}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 touch-target px-4 py-2 rounded-xl font-montserrat text-foreground hover:bg-transparent ${isActivePath(rightItem.path) ? 'opacity-100' : 'opacity-80'}`}
                onClick={() => navigate(rightItem.path)}
              >
                <RightIcon className="!h-11 !w-11 text-[hsl(var(--primary-foreground))]" />
              <span className="mobile-nav-label text-base font-bold text-[hsl(var(--primary-foreground))]">
               {rightItem.label}
              </span>
                
              </Button>
            </div>
          </div>

          {/* Bottom color strip */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3" aria-hidden="true">
            <div
              className="w-full h-full"
              style={{
                background:
                  'linear-gradient(to right, hsl(var(--ui-blue)) 0%, hsl(var(--ui-blue)) var(--bottom-strip-blue-pct), hsl(var(--ui-green)) var(--bottom-strip-blue-pct), hsl(var(--ui-green)) 100%)',
              }}
            />
          </div>
      </nav>
    </div>;
};