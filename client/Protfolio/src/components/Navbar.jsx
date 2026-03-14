import React from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ profile }) => (
  <nav className="navbar">
    <div className="nav-brand">{(profile && profile.name) || 'Shivraj Shinde'}</div>
    <ul className="nav-links">
      <li><a href="#home">Home</a></li>
      <li><a href="#skills">Skills</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
    <ThemeToggle />
  </nav>
);

export default Navbar;
