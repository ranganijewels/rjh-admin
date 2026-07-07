"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/store";
import { Toaster } from "sonner";
import { PersistGate } from "redux-persist/integration/react";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Toaster position="top-right" richColors />
        {children}
      </PersistGate>
    </Provider>
  );
}
