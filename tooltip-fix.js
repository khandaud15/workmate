// This is a temporary file to help debug the tooltip issue
// Copy and paste the relevant parts into your page.tsx file

// Inside your component:
const [activeTooltip, setActiveTooltip] = useState(null);

// Event handlers for menu items
const handleMenuHover = (itemName) => {
  if (isSidebarCollapsed) {
    setActiveTooltip(itemName);
  }
};

const handleMenuLeave = () => {
  if (isSidebarCollapsed) {
    setActiveTooltip(null);
  }
};

// In your JSX for each menu item:
onMouseEnter={() => handleMenuHover('Home')}
onMouseLeave={handleMenuLeave}

// At the end of your component, right before the closing </>:
{isSidebarCollapsed && activeTooltip && (
  <div 
    className="fixed z-50 bg-[#181b23] text-white px-6 py-3 rounded-lg shadow-lg"
    style={{
      left: '84px', // 80px sidebar width + 4px gap
      top: activeTooltip === 'Home' ? '340px' : 
           activeTooltip === 'Resume' ? '390px' :
           activeTooltip === 'Cover Letter' ? '440px' :
           activeTooltip === 'Job Tracker' ? '490px' :
           activeTooltip === 'Copilot' ? '540px' : '590px',
      opacity: 1,
      transition: 'opacity 0.2s',
    }}
  >
    <span className="absolute -left-2 top-1/2 -mt-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-[#181b23]"></span>
    {activeTooltip}
  </div>
)}
