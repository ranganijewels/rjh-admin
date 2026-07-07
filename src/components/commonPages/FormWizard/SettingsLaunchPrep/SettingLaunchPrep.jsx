// "use client";

// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardTitle,
// } from "@/components/common/ui/cards/card";
// import { Input } from "@/components/common/ui/input";
// import { Label } from "@/components/common/ui/label";
// import { Switch } from "@/components/common/ui/switch";
// import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/common/ui/select";
// import Link from "next/link";
// import { Button } from "@/components/common/ui/button";
// import { useCrudApi } from "@/hooks/useCrudApi";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/common/ui/form";
// import { useForm } from "react-hook-form";

// const defaultValues = {
//   store_id: 1, // fixed or fetched dynamically
//   contact_email: "",
//   whatsapp_support_number: "",
//   support_phone_number: "",
//   enable_order_notes: true,
//   enable_gift_packaging: false,
//   has_payment_gateway: "yes", // map to boolean later
//   gateway_name: "",
//   merchant_id: "",
//   account_holder_name: "",
//   bank_name: "",
//   account_number: "",
//   ifsc_code: "",
//   payout_account_type: "savings", // map to 0 or 1 later
//   gst_number: "",
//   enable_international_orders: true,
//   default_currency: "CAD",
//   default_language: "en",
//   international_account_type: "savings",
// };

// export const SettingLaunchPrep = () => {
//   const [diamondTier, setDiamondTier] = useState("intermediate");
//   const [accounttype, setAccountType] = useState("savings");
//   const { create } = useCrudApi("/api/store-setting");
//   const form = useForm({
//     // resolver: zodResolver(formSchema),
//     defaultValues,
//     mode: "onChange",
//   });

//   const {
//     control,
//     setValue,
//     formState: { isSubmitting },
//   } = form;

//   const RadioGroupField = ({ label, value, onChange, options }) => (
//     <div className="flex flex-col gap-2">
//       <Label className="text-sm">{label}</Label>
//       <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
//         {options.map((opt, i) => (
//           <div key={i} className="flex items-center space-x-2">
//             <RadioGroupItem
//               value={opt.label.toLowerCase()}
//               id={`${label}-${opt.label}`.toLowerCase().replace(/\s/g, "-")}
//             />
//             <Label
//               htmlFor={`${label}-${opt.label}`
//                 .toLowerCase()
//                 .replace(/\s/g, "-")}
//               className="text-sm font-normal"
//             >
//               {opt.label}
//             </Label>
//           </div>
//         ))}
//       </RadioGroup>
//     </div>
//   );

//   const handleSubmit = async (values) => {
//     // Map values to the API payload structure
//     const payload = {
//       store_id: values.store_id || 1, // or get dynamically
//       contact_email: values.contact_email,
//       whatsapp_support_number: values.whatsapp_support_number,
//       support_phone_number: values.support_phone_number,
//       enable_order_notes: values.enable_order_notes, // boolean from Switch component
//       enable_gift_packaging: values["gift-packaging"], // fix name to "enable_gift_packaging" or map here
//       has_payment_gateway: values.has_payment_gateway === "yes", // from RadioGroup yes/no
//       gateway_name: values.gateway_name,
//       merchant_id: values.merchant_id,
//       account_holder_name: values.account_holder_name,
//       bank_name: values.bank_name,
//       account_number: values.account_number,
//       ifsc_code: values.ifsc_code,
//       payout_account_type: values.payout_account_type === "savings" ? 0 : 1,
//       gst_number: values.gst_number,
//       enable_international_orders: values.enable_international_orders,
//       default_currency: values.default_currency,
//       default_language: values.default_language,
//       international_account_type:
//         values.international_account_type === "savings" ? 0 : 1,
//     };

//     try {
//       await create(payload);
//       alert("Settings saved successfully");
//     } catch (error) {
//       console.error("Failed to save settings:", error);
//       alert("Error saving settings");
//     }
//   };

//   return (
//     <Card className="flex justify-center px-4 py-10">
//       <div className="w-full max-w-8xl">
//         <div className="pb-2 text-center">
//           <CardTitle className="text-2xl">
//             Store Settings & Launch Prep
//           </CardTitle>
//         </div>

//         <CardContent className="max-w-[55%] mx-auto">
//           {/* Contact Info */}
//           <div className="grid gap-6">
//             <CardTitle className="text-base">Store Contact Info:</CardTitle>

//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(handleSubmit)}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <FormField
//                     control={control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel className="font-[400]">
//                           Contact Email
//                         </FormLabel>
//                         <FormControl>
//                           <Input placeholder="Contact Email" {...field} />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={control}
//                     name="whatsApp_number"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel className="font-[400]">
//                           WhatsApp Support Number:
//                         </FormLabel>
//                         <FormControl>
//                           <Input
//                             placeholder=  "WhatsApp Support Number:"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <FormField
//                   control={control}
//                   name="phone_number"
//                   render={({ field }) => (
//                     <FormItem className="mb-4">
//                       <FormLabel className="font-[400]">
//                         Support Phone Number:
//                       </FormLabel>
//                       <FormControl>
//                         <Input placeholder="Support Phone Number:" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={control}
//                   name="order_notes"
//                   render={({ field }) => (
//                     <FormItem className="mb-4 flex flex-row justify-between">
//                       <FormLabel className="font-[400]">
//                         {" "}
//                         Enable Order Notes (gift message, custom instructions)
//                       </FormLabel>
//                       <FormControl>
//                         <Switch id="order-notes" defaultChecked size="sm" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={control}
//                   name="gift-packaging"
//                   render={({ field }) => (
//                     <FormItem className="mb-4 flex flex-row justify-between">
//                       <FormLabel className="font-[400]">
//                         Enable Gift Packaging
//                       </FormLabel>
//                       <FormControl>
//                         <Switch id="gift-packaging" defaultChecked size="sm" />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {/* Payment Gateway */}
//                 <div className="grid gap-6 mt-5">
//                   <CardTitle className="text-base">
//                     Payment Gateway Setup
//                   </CardTitle>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={control}
//                       name="has_payment_gateway"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Do You have a Payment Gateway
//                           </FormLabel>
//                           <FormControl>
//                             <RadioGroupField
//                               value={field.value}
//                               onChange={field.onChange}
//                               options={[{ label: "Yes" }, { label: "No" }]}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={control}
//                       name="gateway_name"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Gateway Name:
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="Gateway Name" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={control}
//                       name="merchant_id"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Merchant ID / API Key:
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="Merchant ID / API Key" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                 </div>

//                 {/* Payout & Bank Details */}
//                 <div className="grid gap-6 mt-5">
//                   <CardTitle className="text-base">
//                     Payout & Bank Details
//                   </CardTitle>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={control}
//                       name="account_holder_name"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Account Holder Name:
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="Account Holder Name" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={control}
//                       name="bank_name"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Bank Name
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="Bank Name" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <FormField
//                       control={control}
//                       name="account_number"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Account Number:
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="Account Number" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={control}
//                       name="ifsc_code"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             IFSC Code:
//                           </FormLabel>
//                           <FormControl>
//                             <Input placeholder="IFSC Code" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>
//                   <FormField
//                     control={control}
//                     name="account_type"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel className="font-[400]">
//                           Account Type:
//                         </FormLabel>
//                         <FormControl>
//                           <RadioGroupField
//                             value={accounttype}
//                             onChange={setAccountType}
//                             options={[
//                               { label: "Savings" },
//                               { label: "Current" },
//                             ]}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={control}
//                     name="bank_name"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel className="font-[400]">
//                           PAN/GST Number (optional):
//                         </FormLabel>
//                         <FormControl>
//                           <Input placeholder="PAN/GST Number (optional)" />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 {/* International & Localisation */}
//                 <div className="grid gap-6 mt-5">
//                   <CardTitle className="text-base">
//                     International & Localisation
//                   </CardTitle>

//                   <FormField
//                     control={control}
//                     name="international_orders"
//                     render={({ field }) => (
//                       <FormItem className="mb-4 flex flex-row justify-between">
//                         <FormLabel className="font-[400]">
//                           {" "}
//                           Enable International Orders
//                         </FormLabel>
//                         <FormControl>
//                           <Switch
//                             id="internationalorders"
//                             defaultChecked
//                             size="sm"
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <FormField
//                       control={control}
//                       name="default_currency"
//                       render={({ field }) => (
//                         <FormItem className="mb-4">
//                           <FormLabel className="font-[400]">
//                             Default Currency
//                           </FormLabel>
//                           <FormControl>
//                             <Select defaultValue="1">
//                               <SelectTrigger>
//                                 <SelectValue placeholder="Select currency" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 <SelectItem value="1">$ / $ / €</SelectItem>
//                                 <SelectItem value="2">$ / $ / €</SelectItem>
//                                 <SelectItem value="3">$ / $ / €</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <FormField
//                     control={control}
//                     name="language"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <FormLabel className="font-[400]">
//                           Default Language
//                         </FormLabel>
//                         <FormControl>
//                           <Select defaultValue="1">
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select language" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="1">English</SelectItem>
//                               <SelectItem value="2">Hindi</SelectItem>
//                               <SelectItem value="3">
//                                 English, Hindi etc
//                               </SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Account Type:</Label>
//                     <RadioGroupField
//                       value={accounttype}
//                       onChange={setAccountType}
//                       options={[{ label: "Savings" }, { label: "Current" }]}
//                     />
//                   </div>
//                 </div>
//               </form>
//             </Form>
//           </div>
//         </CardContent>

//         <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-5 mr-3">
//           <Link href="#" className="w-full sm:w-auto">
//             <Button variant="outline" className="w-full sm:w-auto">
//               Save Draft
//             </Button>
//           </Link>
//           <Link href="#" className="w-full sm:w-auto">
//             <Button variant="outline" className="w-full sm:w-auto bg-[#F1F1F2]">
//               Previous
//             </Button>
//           </Link>
//           <Link href="#" className="w-full sm:w-auto">
//             <Button className="w-full sm:w-auto bg-primary text-white">
//               Next
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </Card>
//   );
// };

// export default SettingLaunchPrep;

"use client";

import React, { useEffect } from "react";

import { Card, CardContent } from "@/components/common/ui/cards/card";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import { Switch } from "@/components/common/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/common/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/common/ui/select";
import { Button } from "@/components/common/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/common/ui/form";
import { useForm, useWatch } from "react-hook-form";

import { useCrudApi } from "@/hooks/useCrudApi";
import Link from "next/link";

const defaultValues = {
  store_id: 1,
  contact_email: "",
  whatsapp_support_number: "",
  support_phone_number: "",
  enable_order_notes: true,
  enable_gift_packaging: false,
  has_payment_gateway: "yes",
  gateway_name: "",
  merchant_id: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  ifsc_code: "",
  payout_account_type: "savings",
  gst_number: "",
  enable_international_orders: true,
  default_currency: "CAD",
  default_language: "en",
  international_account_type: "savings",
};

const RadioGroupField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <Label className="text-sm">{label}</Label>
    <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center space-x-2">
          <RadioGroupItem value={opt.value} id={`${label}-${opt.value}`} />
          <Label
            htmlFor={`${label}-${opt.value}`}
            className="text-sm font-normal"
          >
            {opt.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  </div>
);

export const SettingLaunchPrep = () => {
  const { create, read } = useCrudApi("/api/store-setting");

  const form = useForm({
    defaultValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await read();
        if (res) reset(res);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    fetchData();
  }, [read, reset]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      has_payment_gateway: values.has_payment_gateway === "yes",
      payout_account_type: values.payout_account_type === "savings" ? 0 : 1,
      international_account_type:
        values.international_account_type === "savings" ? 0 : 1,
    };

    try {
      await create(payload);
      alert("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings");
    }
  };

  return (
    <Card className="flex justify-center px-4 py-10">
      <div className="w-full max-w-8xl">
        {/* Page Title */}
        <div className="pb-2 text-center">
          <h1 className="text-2xl font-bold">Store Settings & Launch Prep</h1>
        </div>

        <CardContent className="max-w-[55%] mx-auto">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <h2 className="text-base font-semibold">Store Contact Info:</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact Email" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="whatsapp_support_number"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>WhatsApp Support Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="WhatsApp Support Number"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="support_phone_number"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Support Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Support Phone Number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="enable_order_notes"
                  render={({ field }) => (
                    <FormItem className="mb-4 flex flex-row justify-between">
                      <FormLabel>Enable Order Notes</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="enable_gift_packaging"
                  render={({ field }) => (
                    <FormItem className="mb-4 flex flex-row justify-between">
                      <FormLabel>Enable Gift Packaging</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 mt-5">
                <h2 className="text-base font-semibold">
                  Payment Gateway Setup
                </h2>

                <FormField
                  control={control}
                  name="has_payment_gateway"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Do you have a Payment Gateway?</FormLabel>
                      <FormControl>
                        <RadioGroupField
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                          ]}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {useWatch({ control, name: "has_payment_gateway" }) ===
                  "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="gateway_name"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Gateway Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Gateway Name" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="merchant_id"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Merchant ID / API Key</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Merchant ID / API Key"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-6 mt-5">
                <h2 className="text-base font-semibold">
                  Payout & Bank Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="account_holder_name"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Account Holder Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bank Name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Account Number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="ifsc_code"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="IFSC Code" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="payout_account_type"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <RadioGroupField
                          value={field.value}
                          onChange={field.onChange}
                          options={[
                            { label: "Savings", value: "savings" },
                            { label: "Current", value: "current" },
                          ]}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="gst_number"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>PAN/GST Number (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="PAN/GST Number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 mt-5">
                <h2 className="text-base font-semibold">
                  International & Localisation
                </h2>

                <FormField
                  control={control}
                  name="enable_international_orders"
                  render={({ field }) => (
                    <FormItem className="mb-4 flex flex-row justify-between">
                      <FormLabel>Enable International Orders</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="default_currency"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Default Currency</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CAD">CAD</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="default_language"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Default Language</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-5 mr-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
                <Button>
                  <Link href="#">Previous</Link>
                </Button>
                <Button>
                  <Link href="/final-review">Next</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </div>
    </Card>
  );
};

export default SettingLaunchPrep;
