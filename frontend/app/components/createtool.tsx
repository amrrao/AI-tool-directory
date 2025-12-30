"use client";
import { useState } from "react";

type Tool = {
    name: string;
    price: number;
    category: string;
}

export default function CreateTool(){
    const[tool, settool] = useState<Tool | null>(null);
    const[name, setname] = useState("");
    const[price, setprice] = useState("");
    const[category, setcategory] = useState("");
    const [result, setresult] = useState<string | null>(null);
    const [error, seterror] = useState("");

    async function createthetool(){
        seterror("");
        setresult("");
        
        
        try{
            const tool: Tool = {
                name: name,
                price: Number(price),
                category: category,
            };
            settool(tool)
            
            const res = await fetch("/api/tools", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(tool),
              });
            if (!res.ok){
                throw new Error("Failed to create the tool");
            }
            const data = await res.json();
            setresult(`Created tool: ${data.name}`);


        } catch(err:any){
            seterror(err.message);
        }
    }
    return (
        <div className="w-100 mx-auto">
            <p>Create a New Tool</p>
            <input type="text" placeholder="Enter Tool Name" value={name} onChange={(e)=> setname(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <input type="text" placeholder="Enter Tool Price" value={price} onChange={(e)=> setprice(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <input type="text" placeholder="Enter Tool Category" value={category} onChange={(e)=> setcategory(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>

            <button onClick={createthetool} className="border-2 p-2 rounded-md">
                Create new tool
            </button>
            {error && 
                <p>
                    Error: {error}
                </p>
                }
            {result!=null && (
                <div className="text-left mt-4">
                    {result}
                </div>
                )}

        </div>
    )
}