import { createSlice } from "@reduxjs/toolkit";

const storeSlice = createSlice({
  name: "store",
  initialState: {
    storeId: null,
  },
  reducers: {
    setStoreId: (state, action) => {
      state.storeId = action.payload;
    },
  },
});

export const { setStoreId } = storeSlice.actions;
export default storeSlice.reducer;
