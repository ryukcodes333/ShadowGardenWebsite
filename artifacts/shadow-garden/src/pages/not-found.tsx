import { Link } from "wouter";
import ParticleBackground from "@/components/ParticleBackground";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 text-center px-4">
        <p className="text-9xl font-black text-red-600 glow-text mb-4">404</p>
        <h1 className="text-3xl font-bold text-white mb-3">Lost in the Shadow Garden</h1>
        <p className="text-white/45 mb-8">This page wandered off into the dark...</p>
        <Link href="/">
          <button className="btn-primary px-8 py-3 rounded-full font-bold text-white hover:opacity-90 transition-all">
            Return Home
          </button>
        </Link>
      </div>
    </div>
  );
}
