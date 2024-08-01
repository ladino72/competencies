/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    
  ],
  theme: {
    screens:{
      sm:"480px",
      md:"768px",
      lg:"976px",
      xl:"1440px"
    },
    fontFamily: {
      'nunito': ['nunito', 'sans-serif'],
      'MyFont': ['"My Font"', 'serif'],
      "bai":["Bai Jamjuree"],
      "poppins":["Poppins"],
      "montserrat":"Montserrat",
      "roboto":"Roboto"
    },
        
    extend: {
      colors: {
        primary:"#0C9EEA",
        strongCyan:"hsl(171,66%,44%)"
    },
    container: {
      center: true, // Center the container horizontally by default
      padding: {
        DEFAULT: "1rem", // Set default padding for all screen sizes
        sm: "2rem", // Adjust padding for small screens
        md: "4rem", // Adjust padding for medium screens
      },
    },

    },
  },
 
  plugins: [
    require("@tailwindcss/forms")({
      strategy: 'base', // only generate global styles

    }),
  ],
  
}

