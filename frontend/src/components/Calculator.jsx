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
  const OPERATORS = ['+', '-', 'X', '/'];
  
  const formatNumber = (num) => {
    if (Number.isInteger(num)) return String(num);
    const rounded = Math.round(num * 1e10) / 1e10;
    return String(rounded).replace('.', ',');
  };

  const toFloat = (str) => parseFloat(str.replace(',', '.'));
  const findLastOperatorIndex = (str) => {
    for (let i = str.length - 1; i >= 1; i--) {
      if (OPERATORS.includes(str[i])) return i;
    }
    return -1;
  };

  const applyPercent = (expr) => {
    const opIndex = findLastOperatorIndex(expr);
    if (opIndex === -1) {
      // Standalone number: just divide by 100
      const value = toFloat(expr);
      if (Number.isNaN(value)) return expr;
      return formatNumber(value / 100);
    }
    const operator = expr[opIndex];
    const before = expr.slice(0, opIndex);
    const bStr = expr.slice(opIndex + 1);
    const b = toFloat(bStr);
    if (Number.isNaN(b)) return expr;

    let percentValue;
    if (operator === '+' || operator === '-') {
      const baseOpIndex = findLastOperatorIndex(before);
      const aStr = baseOpIndex === -1 ? before : before.slice(baseOpIndex + 1);
      const a = toFloat(aStr);
      percentValue = Number.isNaN(a) ? b / 100 : (a * b) / 100;
    } else {
      percentValue = b / 100;
    }
    return before + operator + formatNumber(percentValue);
  };

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
    } else if (label === '%') {
      if (showResult) {
        setExpression(applyPercent(result));
        setResult('');
        setShowResult(false);
      } else if (expression) {
        setExpression(prev => applyPercent(prev));
      }
    } else if (OPERATORS.includes(label)) {
      if (showResult) {
        setExpression(result + label);
        setResult('');
        setShowResult(false);
      } else {
        setExpression(prev => {
          if (prev === '') {
            return label === '-' ? label : prev;
          }
          const lastChar = prev[prev.length - 1];
          if (OPERATORS.includes(lastChar)) {
            return prev.slice(0, -1) + label;
          }
          return prev + label;
        });
      }
    } else if (label === ',') {
      if (showResult) {
        setExpression('0,');
        setResult('');
        setShowResult(false);
      } else {
        setExpression(prev => {
          const segments = prev.split(/[+\-X/]/);
          const currentSegment = segments[segments.length - 1];
          if (currentSegment.includes(',')) {
            return prev;
          }
          return prev === '' ? '0,' : prev + label;
        });
      }
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
    <div className='w-[320px] shrink-0 bg-[#1c1d22] flex flex-col gap-4 p-4 rounded-2xl shadow-xl'>
      <div className='w-full min-w-0 overflow-x-auto bg-[#25252a] min-h-22.5 flex items-end justify-end flex-col p-4 rounded-[10px] select-none'>
        <div className={`${operationClass} w-full whitespace-nowrap`}>{expression || '0'}</div>
        {showResult && (
          <div className={`${resultClass} w-full text-right whitespace-nowrap`}>= {result}</div>
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