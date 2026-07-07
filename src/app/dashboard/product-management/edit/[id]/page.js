import React from "react";
import ProductForm from "@/components/commonPages/ProductManagement/ProductForm";

const page = async ({ params }) => {
  const { id } = await params;
  return <ProductForm id={id} />;
};

export default page;
