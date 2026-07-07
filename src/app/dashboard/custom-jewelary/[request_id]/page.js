// import RequestDetailsView from "@/components/commonPages/CustomJewelry/RequestDetailsView";
// import Communication from "@/components/commonPages/CustomJewelry/RequestDetailsView/Communication";
// import CustomerSubmission from "@/components/commonPages/CustomJewelry/RequestDetailsView/CustomerSubmission";
// import StorePricingConfig from "@/components/commonPages/CustomJewelry/RequestDetailsView/StorePricingConfig";
// import Timeline from "@/components/commonPages/CustomJewelry/RequestDetailsView/Timeline";
// import React from "react";

// const CustomRequestPage = () => {
//   return (
//     <>
//       <RequestDetailsView />
//       <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 p-6">
//         <div className="md:col-span-2 lg:col-span-2 space-y-6">
//           <CustomerSubmission />
//           <StorePricingConfig />
//         </div>

//         <div className="space-y-6">
//           <Timeline />
//           <Communication />
//         </div>
//       </div>
//     </>
//   );
// };

// export default CustomRequestPage;

import RequestDetailsView from "@/components/commonPages/CustomJewelry/RequestDetailsView";
import Communication from "@/components/commonPages/CustomJewelry/RequestDetailsView/Communication";
import CustomerSubmission from "@/components/commonPages/CustomJewelry/RequestDetailsView/CustomerSubmission";
import StorePricingConfig from "@/components/commonPages/CustomJewelry/RequestDetailsView/StorePricingConfig";
import Timeline from "@/components/commonPages/CustomJewelry/RequestDetailsView/Timeline";
import React from "react";

const CustomRequestPage = ({ params }) => {
  const { request_id } = params;

  return (
    <>
      <RequestDetailsView requestId={request_id} />
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        <div className="md:col-span-2 lg:col-span-2 space-y-6">
          <CustomerSubmission requestId={request_id} />
          <StorePricingConfig requestId={request_id} />
        </div>

        <div className="space-y-6">
          <Timeline requestId={request_id} />
          <Communication requestId={request_id} />
        </div>
      </div>
    </>
  );
};

export default CustomRequestPage;
