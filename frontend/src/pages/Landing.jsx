
import React from 'react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navbar */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">BrandName</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Welcome to Our Awesome Product!</h2>
          <p className="text-lg mb-6">We help businesses grow with our unique and powerful solutions. Let's get started today!</p>
          <a href="#contact" className="bg-yellow-500 text-blue-800 px-6 py-3 rounded-lg font-semibold">Get Started</a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-semibold mb-6">Our Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h4 className="text-2xl font-semibold mb-4">Feature One</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h4 className="text-2xl font-semibold mb-4">Feature Two</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
            <div className="bg-white shadow-lg p-6 rounded-lg">
              <h4 className="text-2xl font-semibold mb-4">Feature Three</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; 2025 BrandName. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
