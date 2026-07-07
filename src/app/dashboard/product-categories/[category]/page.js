import React from "react";
import CategoryProductsPage from "@/components/commonPages/ProductManagement/ProductCategories/CategoryProductsPage";

const page = ({ params }) => {
  const { category } = params;
  return (
    <div>
      <CategoryProductsPage category={category} />
    </div>
  );
};

export default page;
