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

students = {
    1: {"name": "Alice", "age": 20, "major": "Computer Science"},
}

class Student(BaseModel):
    name: str
    age: int
    major: str
class UpdateStudent(BaseModel):
    name: str | None=None
    age: int | None=None
    major: str | None=None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/students/{student_id}")
def read_student(student_id: int = Path(..., gt=0)):
    return students[student_id]

@app.get("/students/")
def get_students(major: str | None=None):
    returning = []
    for student in students.values():
        if student["major"]==major:
            returning.append(student)
    return returning


@app.post("/students")
def create_student(student: Student):
    student_id = max(students.keys()) + 1
    students[student_id] = student.dict()
    return {"message": "student created successfully"}

@app.put("/students/{student_id}")
def update_student(student_id: int, student: UpdateStudent):
    if student_id not in students:
        return {"error": "Student does not exist"}
    if student.name!=None:
        students[student_id]["name"] = student.name
    if student.age!=None:
        students[student_id]["age"] = student.age
    if student.major!=None:
        students[student_id]["major"] = student.major
    return {"message": "student updated successfully"}


    



