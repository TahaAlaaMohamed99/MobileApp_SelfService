import { createSlice } from '@reduxjs/toolkit';

const errorSheetSlice = createSlice({
  name: 'errorSheetSlice',
  initialState: {
    isOpen: false,
    errors: null,
    ResourcePage: null,
    headerTitle: null,
  },
  reducers: {
    showErrorSheet: (state, action) => {
      state.isOpen = true;
      state.errors = action.payload?.errors ?? null;
      state.ResourcePage = action.payload?.ResourcePage ?? null;
      state.headerTitle = action.payload?.headerTitle ?? null;
    },
    hideErrorSheet: (state) => {
      state.isOpen = false;
    },
  },
});

export const { showErrorSheet, hideErrorSheet } = errorSheetSlice.actions;
export default errorSheetSlice.reducer;
