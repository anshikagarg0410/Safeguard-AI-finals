import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, HeartPulse, BellRing, PhoneCall, Users, ShieldCheck } from 'lucide-react';
import heroImg from '@/assets/hero-image.jpg';

export default function Welcome() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-600/20 via-emerald-500/10 to-cyan-600/20">
      {/* Top nav */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-emerald-400 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold">SafeGuard AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth?mode=login" className="text-sm">Login</Link>
          <Button asChild>
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-10 pb-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            AI-Powered Home Safety & Wellness
          </h1>
          <p className="mt-5 text-muted-foreground text-lg">
            Monitor your loved ones with intelligent activity recognition, instant alerts,
            and comprehensive wellness tracking. Peace of mind, powered by AI.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link to="/auth?mode=signup">Start Monitoring</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app">View Wellness</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5">
          <img src={heroImg} alt="Home monitoring" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Complete Care Solution</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Advanced AI technology working around the clock to keep your family safe and healthy
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard icon={<HeartPulse className="w-6 h-6 text-sky-500" />} title="Live Activity Monitoring" desc="Real-time activity recognition and behavioral pattern analysis for immediate insights" />
          <FeatureCard icon={<HeartPulse className="w-6 h-6 text-emerald-500" />} title="Wellness Tracking" desc="Comprehensive health monitoring with daily check-ins and medication reminders" />
          <FeatureCard icon={<BellRing className="w-6 h-6 text-rose-500" />} title="Instant Alerts" desc="Immediate notifications for unusual activity, emergencies, or health concerns" />
          <FeatureCard icon={<PhoneCall className="w-6 h-6 text-indigo-500" />} title="Emergency Response" desc="24/7 emergency support with one-touch SOS and automatic alert systems" />
          <FeatureCard icon={<Users className="w-6 h-6 text-teal-500" />} title="Family Connect" desc="Keep all family members informed with shared updates and communication tools" />
          <FeatureCard icon={<ShieldCheck className="w-6 h-6 text-blue-500" />} title="Privacy First" desc="End-to-end encryption and secure data handling with complete privacy protection" />
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-gradient-to-r from-sky-500 to-emerald-400 py-14">
        <div className="max-w-5xl mx-auto px-6 text-center text-white">
          <h3 className="text-3xl font-extrabold">Start Protecting Your Loved Ones Today</h3>
          <p className="mt-3 opacity-90">Join thousands of families who trust SafeGuard AI to keep their loved ones safe and healthy.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/auth?mode=signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4" /> <span className="font-medium">SafeGuard AI</span>
        </div>
        <div>© 2024 SafeGuard AI. All rights reserved.</div>
        <div className="opacity-80">Protecting families with advanced AI technology.</div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur p-6 shadow-sm ring-1 ring-black/5">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow mb-3">
        {icon}
      </div>
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}


