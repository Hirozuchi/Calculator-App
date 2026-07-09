from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=('*'),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class CalcuRequest(BaseModel):
    expression: str

def cal_expression(expression: str) -> float:
    fix_expression = expression.replace('X', '*').replace(',', '.')
    try:
        result = eval(fix_expression)
        return float(result)
    except:
        raise ValueError('Sintax Invalida')
    
@app.post("/calculate")
def handle_calcu(payload: CalcuRequest):
    try:
        result = cal_expression(payload.expression)
        return {'success':True, 'result': result}
    except ValueError as e :
        raise HTTPException(status_code=400, detail=str(e))