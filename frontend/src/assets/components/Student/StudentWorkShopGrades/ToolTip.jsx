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
                    <div className="absolute -top-8 right-full p-2 bg-zinc-400 text-white rounded text-sm w-96 transform translate-x-52 -translate-y-1/2">
                        {text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tooltip;
