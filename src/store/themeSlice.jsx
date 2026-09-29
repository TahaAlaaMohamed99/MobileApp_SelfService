import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'themeSlice',
  initialState: {
    currentLanguage: 'en',
    theme: 'auto',
  },
  reducers: {
    setCurrentLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setCurrentLanguage, toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
