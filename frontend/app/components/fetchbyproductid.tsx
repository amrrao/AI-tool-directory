"use client";
import { useState } from "react";

type Tool = {
    name: string;
    price: number;
    category: string;
}

export default function FetchByProductID(){
    const[toolid, settoolid] = useState("");
    const [result, setresult] = useState<Tool | null>(null);
    const [error, seterror] = useState("");

    async function fetchthetool(){
        seterror("");
        setresult(null);
        try{
            const res = await fetch(`/api/tools/${toolid}`);

            if (!res.ok){
                throw new Error("Failed to fetch the tool");
            }
            const data: Tool = await res.json();
            setresult(data);

        } catch(err:any){
            seterror(err.message);
        }
    }
    return (
        <div className="w-100 mx-auto">
            <p>Fetch Tool by Product ID</p>
            <input type="text" placeholder="Enter Tool ID" value={toolid} onChange={(e)=> settoolid(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <button onClick={fetchthetool} className="border-2 p-2 rounded-md">
                Search by tool ID
            </button>
            {error && 
                <p>
                    Error: {error}
                </p>
                }
            {result && (
                <div className="text-left mt-4">
                <p>{result.name}</p>
                <p>${result.price}</p>
                <p>{result.category}</p>
                </div>
            )}

        </div>
    )
}