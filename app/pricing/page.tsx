import Pricing from '../components/Pricing';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100 pointer-events-none" />
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start automating your job search today
            </p>
          </div>
          <Pricing />
        </div>
      </section>
    </main>
  );
}
