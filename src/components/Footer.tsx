import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Pattern 1: Linear Single-Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Logo + links */}
          <div className="flex items-center gap-8 flex-wrap justify-center md:justify-start">
            <AppLogo
              size={22}
              text="Screen"
              iconName="CpuChipIcon"
              className="text-ui-muted"
            />
            <div className="flex items-center gap-6">
              {[
                { label: 'Product', href: '#parsing' },
                { label: 'Integrations', href: '#integrations' },
                { label: 'Compliance', href: '#bias-guard' },
                { label: 'Docs', href: '#integrations' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[14px] font-medium text-ui-muted hover:text-ui-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: social + legal */}
          <div className="flex items-center gap-6">
            {/* Social icons */}
            <div className="flex items-center gap-4">
              {[
                { label: 'LinkedIn', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                )},
                { label: 'Twitter/X', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )},
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="text-ui-faint hover:text-cyan-DEFAULT transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <span className="text-[13px] text-ui-faint">
              © 2026 Screen · <a href="#" className="hover:text-ui-muted transition-colors">Privacy</a> · <a href="#" className="hover:text-ui-muted transition-colors">Terms</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;