import axios from 'axios';
import { useEffect, useState } from 'react';
import Keys from './Keys';

const Calculator = () => {
  const keys = [
    "AC", 'C', '%', '/',
    '7', '8', '9', 'X',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    ',', '0', 'EQUALS'
  ];

  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  const operationClass = 'text-[1.2rem] tracking-[2px] flex gap-[5px] items-center text-[#FFFFFF7F] justify-end';
  const resultClass = 'text-[1.7rem] text-white font-semibold transition-all';

  const handleCalculate = async (currentExpression) => {
    if (!currentExpression) return;
    try {
      const response = await axios.post('http://127.0.0.1:8000/calculate', {
        expression: currentExpression
      });
      if (response.data.success) {
        setResult(response.data.result);
        setShowResult(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error';
      setResult(errorMsg);
      setShowResult(true);
    }
  };
  const handleKeyClick = (label) => {
    if (label === 'AC') {
      setExpression('');
      setResult('');
      setShowResult(false);
    } else if (label === 'C') {
      if (showResult) {
        setExpression('');
        setResult('');
        setShowResult(false);
      } else {
        setExpression(prev => prev.slice(0, -1));
      }
    } else if (label === 'EQUALS') {
      handleCalculate(expression);
    } else {
      if (showResult) {
        setExpression(label);
        setResult('');
        setShowResult(false);
      } else {
        setExpression(prev => prev + label);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (key >= '0' && key <= '9') {
        handleKeyClick(key);
      } else if (key === '+' || key === '-' || key === '%' || key === '/') {
        handleKeyClick(key);
      } else if (key === '*' || key.toLowerCase() === 'x') {
        handleKeyClick('X');
      } else if (key === ',' || key === '.') {
        handleKeyClick(',');
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault(); 
        handleKeyClick('EQUALS');
      } else if (key === 'Backspace') {
        handleKeyClick('C');
      } else if (key === 'Escape') {
        handleKeyClick('AC');
      }
    };


    window.addEventListener('keydown', handleKeyDown);


    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [expression, showResult]); 

  return (
    <div className='min-w-[320px] bg-[#1c1d22] flex flex-col gap-4 p-4 rounded-2xl shadow-xl'>
      <div className='overflow-x-auto bg-[#25252a] min-h-22.5 flex items-end justify-end flex-col p-4 rounded-[10px] select-none'>
        <div className={operationClass}>{expression || '0'}</div>
        {showResult && (
          <div className={resultClass}>= {result}</div>
        )}
      </div>
      
      <div className='grid grid-cols-[repeat(4,1fr)] gap-[0.3rem]'>
        {keys.map((item, index) => (
          <Keys 
            label={item} 
            key={index} 
            keyClass={item === 'EQUALS' ? 'equals' : ''} 
            onClick={() => handleKeyClick(item)} 
          />
        ))}
      </div>
    </div>
  );
};

export default Calculator;