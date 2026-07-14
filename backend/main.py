from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ast
import operator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CalculationRequest(BaseModel):
    expression: str

ALLOWED_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.USub: operator.neg, 
}

def safe_eval(node):
    if isinstance(node, ast.Constant):  
        if isinstance(node.value, (int, float)):
            return node.value
        raise TypeError("Only numbers are allowed")
    elif isinstance(node, ast.Num):     
        return node.n
    elif isinstance(node, ast.BinOp):   
        left = safe_eval(node.left)
        right = safe_eval(node.right)
        op_type = type(node.op)
        if op_type in ALLOWED_OPERATORS:
            return ALLOWED_OPERATORS[op_type](left, right)
        raise ValueError(f"Unsupported operator: {op_type}")
    elif isinstance(node, ast.UnaryOp): 
        operand = safe_eval(node.operand)
        op_type = type(node.op)
        if op_type in ALLOWED_OPERATORS:
            return ALLOWED_OPERATORS[op_type](operand)
        raise ValueError(f"Unsupported unary operator: {op_type}")
    else:
        raise ValueError("Invalid mathematical expression")

@app.post("/calculate")
async def calculate_expression(request: CalculationRequest):
    try:
        clean_expr = request.expression.replace('×', '*').replace('÷', '/')
        parsed_ast = ast.parse(clean_expr, mode='eval').body
        result = safe_eval(parsed_ast)
        return {"result": str(result)}
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Cannot divide by zero")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid mathematical expression")