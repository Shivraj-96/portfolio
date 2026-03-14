import React from 'react';

const Hero = ({ profile }) => (
  <section id="home" className="hero">
    <h1>{profile?.name || 'Shivraj Shinde'}</h1>
    <h2>{profile?.title || 'Full Stack Developer'}</h2>
    <p>{profile?.bio || 'Passionate developer creating innovative solutions.'}</p>
    <div className="hero-buttons">
      <a href="#projects" className="btn">View Projects</a>
      <a href="#contact" className="btn">Contact Me</a>
    </div>
  </section>
);

export default Hero;