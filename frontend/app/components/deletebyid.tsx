"use client";
import { useState } from "react";

type Tool = {
    name: string;
    price: number;
    category: string;
}

export default function Deletebyproductid(){
    const[toolid, settoolid] = useState("");
    const [result, setresult] = useState<Tool | null>(null);
    const [error, seterror] = useState("");

    async function deletethetool(){
        seterror("");
        setresult(null);
        try{
            const res = await fetch(`http://127.0.0.1:8000/deletebyproductid/${toolid}`);
            if (!res.ok){
                throw new Error("Failed to delete the tool");
            }
            const data: Tool = await res.json();
            setresult(data);

        } catch(err:any){
            seterror(err.message);
        }
    }
    return (
        <div className="w-100 mx-auto">
            <p>Delete Tool by Product ID</p>
            <input type="text" placeholder="Enter Tool ID" value={toolid} onChange={(e)=> settoolid(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <button onClick={deletethetool} className="border-2 p-2 rounded-md">
                Delete
            </button>
            {error && 
                <p>
                    Error: {error}
                </p>
                }
            {result && (
                <div className="text-left mt-4">
                <p>deleted:</p>
                <p>{result.name}</p>
                <p>${result.price}</p>
                <p>{result.category}</p>
                </div>
            )}

        </div>
    )
}