export default function FeatureCards() {
  // Custom styles to ensure text visibility
  const titleStyle = {
    color: '#000000',
    textShadow: 'none',
    fontWeight: 700,
    opacity: 1
  };
  
  const descriptionStyle = {
    color: '#000000',
    textShadow: 'none',
    fontWeight: 500,
    opacity: 1
  };
  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M13 20L20 13M20 13H4M20 13L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Automate your job search",
      description: "We continuously scan millions of openings to find your top matches."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M16 18L18 20L22 16M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Wake up to your best matches",
      description: "Start each day with a list of new roles matched to your skills and preferences."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "10x your job applications",
      description: "Submit 10x as many applications with less effort than one manual application."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Reclaim valuable hours every week",
      description: "Reclaim your time by letting our AI handle the grunt work of job searching."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none">
          <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Mock interview preparation",
      description: "Practice with AI-powered mock interviews tailored to your target roles."
    }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          We don't stop until you're hired
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-[#0e3a68] to-[#1a4f85] p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-700 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Removed overlay that was causing visibility issues */}
              <div className="flex flex-col items-center text-center relative">
                <div className="mb-4 sm:mb-6 transform transition-transform duration-300 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-100 text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
