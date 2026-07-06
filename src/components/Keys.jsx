import React from 'react'

const Keys = ({label, keyClass}) => {
  const equalClass = 'col-[span_2] bg-[#7289da] text-[#FFFFFFfF] font-semibold hover:bg-[#7289da]';

  return (
    <div className={`bg-[#25252a] flex cursor-pointer items-center justify-center p-4 rounded-[5px] hover:bg-[#7289da]
      ${keyClass && equalClass}`}>{label}</div>
  )
}

export default Keys