from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ast
import operator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def safe_eval(node):
    if isinstance(node, ast.Constant):
        if isinstance(node.value, (int, float)):
            return node.value
        raise TypeError("Invalid data type detected")
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
        raise ValueError("Invalid expression syntax")

@app.post("/calculate")
async def calculate_expression(request: CalculationRequest):
    try:
        cleaned_expression = request.expression.replace('X', '*').replace(',', '.')
        parsed_ast = ast.parse(cleaned_expression, mode='eval').body
        numeric_result = safe_eval(parsed_ast)
        if isinstance(numeric_result, float) and numeric_result.is_integer():
            numeric_result = int(numeric_result)
        final_string = str(numeric_result).replace('.', ',')
        return {"success": True, "result": final_string}
        
    except ZeroDivisionError:
        raise HTTPException(status_code=400, detail="Cannot divide by zero")
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed Expression")