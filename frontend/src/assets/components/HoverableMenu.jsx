import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const HoverableMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const menuItems = [
        { id: 1, label: 'Home', href: '/' },
        { id: 2, label: 'About', href: '/about' },
        { id: 3, label: 'Services', href: '/services' },
        { id: 4, label: 'Contact', href: '/contact' },
    ];

    return (
        <div className="w-screen flex justify-center items-center">
            <div className="relative group">
                <button
                    onClick={toggleMenu}
                    className="relative w-32 h-10 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md transition duration-300 ease-in-out group-hover:bg-gray-700"
                >
                    Menu
                </button>
                {isMenuOpen && (
                    <ul
                        className={`absolute z-10 origin-top-right bg-white border border-gray-300 rounded-md shadow-lg ${isMenuOpen ? 'w-32 mt-1' : 'w-0 mt-0'
                            } transition-all duration-300 ease-in-out overflow-hidden`}
                    >
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={item.href}
                                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition duration-300 ease-in-out"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
{/*In this updated example, we use the group and group-hover classes to apply hover effects to the "Menu" button and its submenu. 
The group class allows us to define styles for both the default and hover states, while the group-hover class is used to change styles 
when hovering over the group element.
 */}
export default HoverableMenu;
