import React from "react";
import ProductDetailView from "@/components/commonPages/ProductManagement/ProductDetailView";

const page = async ({ params }) => {
  const { id } = await params;
  return <ProductDetailView id={id} />;
};

export default page;
