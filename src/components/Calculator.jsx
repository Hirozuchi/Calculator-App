import React, { useState } from 'react'
import Keys from './Keys'
const calculator = () => {
  const keys = [
    "AC",'C','%','/',
    '7','8','9','X',
    '4','5','6','-',
    '1','2','3','+',
    ',','0','EQUALS'
  ]
  const [showResult, setShowResult] = useState(false);

  const operationClass = 'text-[1.2rem] tracking-[2px]  flex gap-[5px] items-center text -[#FFFFFF7F] justify-end'
  const resultClass = 'text-[1.7rem] '


  return (
    <div className='min-w-[320px] bg-[#1c1d22] flex flex-col
    gap-4 p-4 rounded-2xl'>
      <div className='overflow-x-auto bg-[#25252a] min-h-25
      flex items-end justify-end flex-col p-4 rounded-[10px]'>
        <div className={`${showResult ?resultClass : operationClass}`}>RESULT</div>
      </div>
      <div className='grid  grid-cols-[repeat(4,1fr)] gap-[0.3rem]'>
        {keys.map((item, index) =>(<Keys label={item} key={index} keyClass={item === 'EQUALS' && 'equals'} />))}
      </div>
      </div>
  )
}

export default calculator