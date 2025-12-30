"use client";
import { useState } from "react";

type Tool = {
    name: string;
    price: number;
    category: string;
}

export default function FetchByCategory(){
    const[category, setcategory] = useState("");
    const [result, setresult] = useState<Tool[] | null>(null);
    const [error, seterror] = useState("");

    async function fetchthetool(){
        seterror("");
        setresult(null);
        try{
            const res = await fetch(`/api/tools/by-category?category=${category}`);

            if (!res.ok){
                throw new Error("Failed to fetch the tool");
            }
            const data: Tool[] = await res.json();
            setresult(data)

        } catch(err:any){
            seterror(err.message);
        }
    }
    return (
        <div className="w-100 mx-auto">
            <p>Fetch Tools by Category</p>
            <input type="text" placeholder="Enter Tool Category" value={category} onChange={(e)=> setcategory(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <button onClick={fetchthetool} className="border-2 p-2 rounded-md">
                Search by category
            </button>
            {error && 
                <p>
                    Error: {error}
                </p>
                }
            {result!=null && (
                <div className="text-left mt-4">
                    {result.map((tool, index) => (
                    <div key={index}>
                        <p>{tool.name}</p>
                        <p>${tool.price}</p>
                        <p>{tool.category}</p>
                    </div>
                    ))}
                </div>
                )}

        </div>
    )
}