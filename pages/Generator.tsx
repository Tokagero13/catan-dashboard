import React from 'react';

const Generator: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-gray-100">
      <iframe 
        src="https://www.generatecatanboard.com/" 
        title="Catan Map Generator"
        className="w-full h-full border-none"
        allowFullScreen
      />
    </div>
  );
};

export default Generator;