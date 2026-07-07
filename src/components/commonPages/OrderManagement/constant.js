export const ORDERS_LIST_DATA = [
  {
    orderId: "A1234567",
    image: "/images/brand-logo/disqus.png",
    productName: "Ring",
    storeName: "Niora",
    orderDate: "October 1, 2023",
    quantity: 1,
    totalValue: "$85,000",
    paymentStatus: "paid",
    fulfilmentStatus: "July 20, 2023",
    orderChannel: "Website",
  },
];

export const RETURN_REPAIR_DATA = [
  {
    orderId: "A1234567",
    image: "/images/products/product-ring.png",
    fullName: "John Doe",
    phoneNumber: "+1 234 567 890",
    email: "admin@therjhouse.com",
    jewelryType: "Ring",
    productCondition: "New",
    returnStatus: {
      label: "Approved",
      variant: "success",
    },
  },
];

export const ORDER_DATA = {
  Locations: [
    { address: "1234 Industrial Way, Dallas, TX 75201", time: "10:00 AM" },
    {
      address: "8458 Sunset Blvd #209, Los Angeles, CA 90069",
      time: "11:30 AM",
    },
  ],

  ShippingLog: [
    {
      orderStatus: "Order Placed",
      date: "28 Jul, 2025 10:02",
      description: "Shipment information received by seller",
      address: "Silicon Valley, CA",
    },
    {
      orderStatus: "Order Placed",
      date: "28 Jul, 2025 10:02",
      address: "",
    },
  ],

  Statuses: [
    { label: "Picking", value: 100, active: true },
    { label: "Packing", value: 100, active: true },
    { label: "Shipping", value: 55, active: false },
    { label: "Delivered", value: 0, active: false },
  ],

  ShippingInfo: [
    { label: "Total Time", value: "19 days, 7 hours" },
    { label: "Dep. Time", value: "01 Aug, 2025 09:17" },
    { label: "Exp. Arrival", value: "17 Apr, 2025 12:00" },
    { label: "Tracking No.", value: "1Z999AA10123456784" },
  ],

  OrderInfo: {
    id: "SHP-3827462",
    status: "Shipped",
    placedDate: "28 Jul, 2025",
    orderId: "SO-AMS-4620",
  },

  OrderedProducts: [
    {
      image: "/images/products/1.png",
      title: "Cloud Shift Lightweight Runner Pro Edition",
      label: "$120.00",
      sku: "BT-A1-YLW-8",
      metal: "14K Yellow Gold",
      dimondCaret: "2.5 CT",
      Style: "Solitaire",
    },
    {
      image: "/images/products/1.png",
      title: "Titan Edge High Impact Stability Lightweight..",
      label: "$99.00",
      sku: "SNK-888-RED-42",
    },
    {
      image: "/images/products/1.png",
      title: "Cloud Shift Lightweight Runner Pro Edition",
      label: "$120.00",
      sku: "SD-999-TAN-38",
    },
    {
      image: "/images/products/1.png",
      title: "Cloud Shift Lightweight Runner Pro Edition",
      total: "$179.00",
      label: "$149.00",
      badge: true,
      sku: "SD-Z9-BRN-39",
      metal: "14K Yellow Gold",
      dimondCaret: "2.5 CT",
      Style: "Solitaire",
    },
  ],
};
