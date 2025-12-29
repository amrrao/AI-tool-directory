"use client";
import Image from "next/image";
import Form from 'next/form'
import { useState} from "react";
import FetchByProductId from "./components/fetchbyproductid";
import FetchByCategory from "./components/fetchbycategory";
import CreateTool from "./components/createtool";
import UpdateTool from "./components/updatetool";

export default function Home() {
  return (
    <div className="bg-white text-black h-screen text-center p-8">
      <h1 className="text-2xl">
        The Best AI Tool Directory for Content Creators
      </h1>
      <p className="mt-4">
        Discover the best AI tools to build your brand and go viral
      </p>
      <div className="mt-8">
        <FetchByProductId />
      </div>
      <div className="mt-8">
        <FetchByCategory />
      </div>
      <div className="mt-8">
        <CreateTool />
      </div>
      <div className="mt-8">
        <UpdateTool />
      </div>
    </div>
  );
}
