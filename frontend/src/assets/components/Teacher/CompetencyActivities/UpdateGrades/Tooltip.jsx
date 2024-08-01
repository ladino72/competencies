import React, { useState } from 'react';

const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  const showTooltip = () => {
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block cursor-pointer relative"
      >
        {children}
        {isVisible && (
          <div className="absolute -top-8 right-full p-2 bg-gray-800 text-white rounded text-sm w-48 transform translate-x-2 -translate-y-1/2">
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;
