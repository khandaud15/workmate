"use client";
import { useSession, signOut } from 'next-auth/react';

export default function AccountSettings({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Account</h1>
          <p className="text-gray-400 text-sm">Manage billing and account settings</p>
        </div>

      </div>

      <div className="bg-[#1f1e22] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={session?.user?.image || 'https://randomuser.me/api/portraits/men/75.jpg'} 
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-white font-medium text-sm">{session?.user?.name || 'User'}</h3>
              <p className="text-gray-400 text-xs">{session?.user?.email || 'No email provided'}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-[#1f1e22] rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#2a2830] rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Manage Billing Information</h3>
              <p className="text-gray-400 text-xs">Manage, upgrade or cancel your plan</p>
            </div>
          </div>
          <button className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Manage
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Current Plan</h2>
        <p className="text-gray-400 mb-6">Free Plan</p>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trial Access Card */}
          <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)]">
            <div className="text-lg font-semibold mb-1">Trial Access</div>
            <div className="text-2xl font-bold mb-2">$2.95</div>
            <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Try it risk-free • Money-back guarantee • Cancel anytime</div>
          </div>

          {/* 3 Month Full Access Card */}
          <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)] focus-within:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)]">
            <div className="text-lg font-semibold mb-1 flex items-center">3 Month Full Access <span className="ml-2 bg-[#2ecc71] text-black text-[11px] px-2 py-0.5 rounded-full">RECOMMENDED</span></div>
            <div className="text-2xl font-bold mb-2">$13.95<span className="text-base font-normal">/mo</span></div>
            <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">$41.85 up front • Cancel anytime</div>
          </div>

          {/* 6 Month Full Access Card */}
          <div className="bg-[#1f1e22] rounded-[14px] p-6 border-2 border-transparent transition duration-300 hover:border-[#6f60e2] hover:shadow-[0_0_16px_2px_rgba(111,96,226,0.3)]">
            <div className="text-lg font-semibold mb-1">6 Month Full Access</div>
            <div className="text-2xl font-bold mb-2">$10.95<span className="text-base font-normal">/mo</span></div>
            <div className="text-sm text-gray-300 mt-3 mb-2 space-y-1">
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>AI-powered job search</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Auto-fill your applications</div>
              <div><span className="text-[#2ecc71] mr-2">&#10003;</span>Full access with unlimited applications</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">$65.70 up front • Save 63% • Cancel anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
