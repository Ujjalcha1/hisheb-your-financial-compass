import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import BottomNav from '@/components/BottomNav';
import { User, Lock, Tag, DollarSign, Moon, Download, Trash2, LogOut, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setAuthenticated } = useStore();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    setAuthenticated(false);
    navigate('/login');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile' },
        { icon: Lock, label: 'Change Password' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Tag, label: 'Manage Categories' },
        { icon: DollarSign, label: 'Currency' },
        { icon: Moon, label: 'Dark Mode', toggle: true },
      ],
    },
    {
      title: 'Data',
      items: [
        { icon: Download, label: 'Export Data' },
        { icon: Trash2, label: 'Delete Account', danger: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold mb-4">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="px-5 mb-6">
        <div className="glass-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
            {user?.name?.[0] ?? 'U'}
          </div>
          <div>
            <p className="font-semibold">{user?.name ?? 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs text-muted-foreground font-medium mb-2">{section.title}</p>
            <div className="glass-card divide-y divide-border/30 p-0 overflow-hidden">
              {section.items.map(({ icon: Icon, label, toggle, danger }) => (
                <button key={label} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${danger ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <span className={`text-sm ${danger ? 'text-destructive' : ''}`}>{label}</span>
                  </div>
                  {toggle ? (
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 mt-6">
        <button onClick={handleLogout} className="w-full glass-card flex items-center justify-center gap-2 py-3.5 text-destructive font-medium hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4.5 h-4.5" />
          <span>Log Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
