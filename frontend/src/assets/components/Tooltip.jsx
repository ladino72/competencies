import React, { useState, useEffect } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => {
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const timeoutId = setTimeout(hideTooltip, 3000); // Hide after 3 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block cursor-pointer relative"
      >
        {children}
        {isVisible && (
          <div
            className="absolute left-full top-1/2 transform -translate-x-2 -translate-y-1/2 p-2 bg-red-400 text-white rounded text-sm w-72 font-semibold font-roboto"
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
