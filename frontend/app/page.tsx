"use client";
import Image from "next/image";
import Form from 'next/form'
import { useState} from "react";
import FetchByProductId from "./components/fetchbyproductid";
import FetchByCategory from "./components/fetchbycategory";
import CreateTool from "./components/createtool";
import UpdateTool from "./components/updatetool";
import Deletebyproductid from "./components/deletebyid";
import AuthButton from "./components/authbutton";
import CheckoutButton from "./components/checkout-button";

export default function Home() {
  return (
    <div className="bg-white text-black text-center p-8">
      <h1 className="text-2xl text-semibold">
        The Best AI Tool Directory for Content Creators
      </h1>
      <p className="mt-4">
        Discover the best AI tools to build your brand and go viral
      </p>
      <div className="mt-4">
        <AuthButton />
      </div>
      <div className="mt-8">
        <CheckoutButton priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || ""}>
          Buy Now
        </CheckoutButton>
      </div>
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
      <div className="mt-8">
        <Deletebyproductid />
      </div>
    </div>
  );
}
