from fastapi import FastAPI, Path
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins="http://localhost:3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AITools = {
    1: {"name": "Veo3", "price": 20, "category": "video generation"},
    2: {"name": "ChatGPT", "price": 30, "category": "text generation"},
    3: {"name": "Midjourney", "price": 25, "category": "image generation"},
}

class Tool(BaseModel):
    name: str
    price: int
    category: str
class UpdateTool(BaseModel):
    name: str | None=None
    price: int | None=None
    category: str | None=None

@app.get("/")
def read_root():
    return AITools.values()

@app.get("/fetchbyproductid/{product_id}")
def read_student(product_id: int = Path(..., gt=0)):
    return AITools[product_id]

@app.get("/fetchbycategory/")
def get_students(major: str | None=None):
    returning = []
    for student in AITools.values():
        if student["major"]==major:
            returning.append(student)
    return returning


@app.post("/tools")
def create_student(student: Tool):
    product_id = max(AITools.keys()) + 1
    AITools[product_id] = student.dict()
    return {"message": "tool created successfully"}

@app.put("/tools/{product_id}")
def update_student(product_id: int, tool: UpdateTool):
    if product_id not in AITools:
        return {"error": "tool does not exist"}
    if tool.name!=None:
        AITools[product_id]["name"] = tool.name
    if tool.price!=None:
        AITools[product_id]["price"] = tool.price
    if tool.category!=None:
        AITools[product_id]["category"] = tool.category
    return {"message": "tool updated successfully"}


    



