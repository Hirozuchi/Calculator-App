import React from 'react';

const Keys = ({ label, keyClass, onClick }) => {
  const equalClass = 'col-[span_2] bg-[#7289da] text-[#FFFFFF] font-semibold hover:bg-[#5b73c7]';
  const baseClass = 'bg-[#25252a] text-white flex cursor-pointer items-center justify-center p-4 rounded-[5px] hover:bg-[#7289da] transition-colors duration-150 border-none outline-none select-none';

  return (
    <button 
      onClick={onClick} 
      className={`${baseClass} ${keyClass === 'equals' ? equalClass : ''}`}
    >
      {label}
    </button>
  );
};

export default Keys;