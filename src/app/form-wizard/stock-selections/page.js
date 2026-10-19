// app/stock/page.jsx
import React from "react";

import { STOCK_PRODUCT_DETAIL } from "@/components/commonPages/StockSelections/constant";
import StockSelections from "@/components/commonPages/StockSelections";

// The wizard shell already provides the page padding and the step screens
// render their own <PageHeader>, so this route must not add its own padding
// or a duplicate title.
const Page = () => {
  return <StockSelections product={STOCK_PRODUCT_DETAIL} />;
};

export default Page;
