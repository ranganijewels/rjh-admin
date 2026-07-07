// app/stock/page.jsx
import React from "react";

import { STOCK_PRODUCT_DETAIL } from "@/components/commonPages/StockSelections/constant";
import StockSelections from "@/components/commonPages/StockSelections";

const Page = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4 text-center">Stock Selection</h1>
      <StockSelections product={STOCK_PRODUCT_DETAIL} />
    </div>
  );
};

export default Page;
