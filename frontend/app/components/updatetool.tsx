"use client";
import { useState } from "react";

type UpdateTool = {
    name?: string;
    price?: number;
    category?: string;
}

export default function UpdateTool(){
    const[product_id, setproduct_id] = useState("");
    const[name, setname] = useState("");
    const[price, setprice] = useState("");
    const[category, setcategory] = useState("");
    const [result, setresult] = useState<string | null>(null);
    const [error, seterror] = useState("");

    async function updatethetool(){
        seterror("");
        setresult("");
        
        
        try{
            const update: UpdateTool = {};
            if (name) update.name = name;
            if (price) update.price = Number(price);
            if (category) update.category = category;
            
            const res = await fetch(`http://127.0.0.1:8000/tools/${product_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(update),
            });
            if (!res.ok){
                throw new Error("Failed to update the tool");
            }
            const data = await res.json();
            setresult(data.message)

        } catch(err:any){
            seterror(err.message);
        }
    }
    return (
        <div className="w-100 mx-auto">
            <p>Update a Tool</p>
            <input type="text" placeholder="Enter Product ID" value={product_id} onChange={(e)=> setproduct_id(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <input type="text" placeholder="Enter Tool Name" value={name} onChange={(e)=> setname(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <input type="text" placeholder="Enter Tool Price" value={price} onChange={(e)=> setprice(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>
            <input type="text" placeholder="Enter Tool Category" value={category} onChange={(e)=> setcategory(e.target.value)} className="border-1 mr-2 rounded-md p-1"/>

            <button onClick={updatethetool} className="border-2 p-2 rounded-md">
                Update tool
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