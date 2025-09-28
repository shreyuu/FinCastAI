/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // Replace with your desired hex color (e.g., blue-500)
      },
    },
  },
  plugins: [],
};
