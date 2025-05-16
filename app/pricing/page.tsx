import Pricing from '../components/Pricing';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 pointer-events-none" />
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
            {/* Header is now in the Pricing component */}
          </div>
          <Pricing />
        </div>
      </section>
    </main>
  );
}
