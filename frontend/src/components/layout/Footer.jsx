import React from 'react';
import { Cpu, Github, Linkedin, Mail, MapPin, Phone, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                ACES<span className="text-blue-500">.</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Association of Computer Engineering Students (ACES) is dedicated to fostering innovation, technical mastery, and professional leadership.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:aces@engg.edu" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#about" className="hover:text-blue-400 transition-colors">About ACES</a></li>
              <li><a href="/#leadership" className="hover:text-blue-400 transition-colors">Executive Committee</a></li>
              <li><a href="/#teams" className="hover:text-blue-400 transition-colors">Club Teams</a></li>
              <li><a href="/#events" className="hover:text-blue-400 transition-colors">Events & Workshops</a></li>
              <li><a href="/#gallery" className="hover:text-blue-400 transition-colors">Photo Gallery</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide">Club Portal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Member Login</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">Executive Portal</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors">QR Attendance System</a></li>
              <li><a href="/#contact" className="hover:text-blue-400 transition-colors">Join ACES</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wide">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-1" />
                <span>Department of Computer Engineering, Campus Main Building</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>contact@aces-portal.org</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 ACES Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Computer Engineering Students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
