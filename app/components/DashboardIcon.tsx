import Link from 'next/link';
import { FaTachometerAlt } from 'react-icons/fa';

export default function DashboardIcon({ className = '' }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 text-[#0e3a68] hover:text-[#0c3156] transition-colors ${className}`} title="Go to Dashboard">
      <FaTachometerAlt className="text-2xl" />
      <span className="hidden md:inline text-[15px] font-medium">Dashboard</span>
    </Link>
  );
}
