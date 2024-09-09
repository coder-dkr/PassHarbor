import React, { useState, useEffect } from 'react';

const NotFoundTorch = (props) => {
  const [mousePosition, setMousePosition] = useState({ x: -150, y: -150 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Ensure the torch is centered around the mouse and doesn't clip on the right side of the page.
      setMousePosition({ x: e.clientX - 100, y: e.clientY - 100 });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-no-repeat overflow-hidden" style={{ backgroundImage: `url('https://wallpapercave.com/wp/6SLzBEY.jpg')` }}>
      <div className="text-center">
        <h1 className="text-[15em] font-bold text-[#02282a] -mt-[200px] font-mono relative z-10" style={{ textShadow: '-5px 5px 0 rgba(0,0,0,0.7), -10px 10px 0 rgba(0,0,0,0.4), -15px 15px 0 rgba(0,0,0,0.2)' }}>
          {props.txt}
        </h1>
        <h2 className="text-[5em] font-bold text-black -mt-[150px] font-mono relative z-10" style={{ textShadow: '-5px 5px 0 rgba(0,0,0,0.7)' }}>
          Uh, Ohh
        </h2>
        <h3 className="text-[2em] font-bold text-black mt-[-40px] ml-[30px] font-mono relative z-10" style={{ textShadow: '0 5px 0 rgba(0,0,0,0.7)' }}>
          Sorry we can't find what you are looking for 'cuz it's so dark in here
        </h3>
      </div>
      <div
        className="fixed rounded-full bg-[rgba(0,0,0,0.3)] w-[200px] h-[200px] shadow-[0_0_0_9999em_#000000f7] opacity-100 pointer-events-none"
        style={{
          top: `${mousePosition.y}px`,
          left: `${mousePosition.x}px`,
        }}
      >
        <div className="w-full h-full rounded-full shadow-[inset_0_0_40px_2px_#000,0_0_20px_4px_rgba(13,13,10,0.2)]"></div>
      </div>
    </div>
  );
};

export default NotFoundTorch;
