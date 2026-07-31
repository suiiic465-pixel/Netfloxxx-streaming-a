import React from 'react';
import { ApertureLogo } from './ApertureLogo';
import { Globe, Github, Twitter, Youtube, Instagram, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#07080C] pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Row: Logo & Mission Statement */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-3">
            <ApertureLogo size="md" />
            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-sans">
              Watch py is a next-generation streaming experience featuring ultra-high definition originals, spatial audio, and cinematic aperture technology.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { icon: Twitter, label: 'Twitter' },
              { icon: Youtube, label: 'YouTube' },
              { icon: Instagram, label: 'Instagram' },
              { icon: Github, label: 'GitHub' },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <a
                  key={idx}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#FFB238] hover:text-[#0A0B0F] border border-white/10 transition-colors text-slate-300"
                  aria-label={s.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 font-sans">
          <div className="space-y-3">
            <h4 className="font-mono-meta text-xs uppercase font-bold text-white tracking-wider">
              Browse
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Original Series</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Blockbuster Movies</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">4K Ultra HD</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Trending Now</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Coming Soon</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono-meta text-xs uppercase font-bold text-white tracking-wider">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Manage Profiles</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Redeem Gift Card</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Stream Quality Settings</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Device Connections</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Billing & Plans</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono-meta text-xs uppercase font-bold text-white tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Supported Devices</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Speed Test</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Parental Controls</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-mono-meta text-xs uppercase font-bold text-white tracking-wider">
              Legal & Tech
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Cookie Preferences</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Aperture Architecture</a></li>
              <li><a href="#" className="hover:text-[#FFB238] transition-colors">Corporate Info</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Language */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-meta">
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-[#2AC9B0]" />
            <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-[#FFB238]">
              <option value="en" className="bg-[#0A0B0F]">English (US)</option>
              <option value="es" className="bg-[#0A0B0F]">Español</option>
              <option value="ja" className="bg-[#0A0B0F]">日本語</option>
              <option value="fr" className="bg-[#0A0B0F]">Français</option>
            </select>
          </div>

          <p className="text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} Watch py, Inc. All rights reserved. Cinematic UI preview layout.
          </p>
        </div>
      </div>
    </footer>
  );
};
