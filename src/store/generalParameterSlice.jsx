import { createSlice } from '@reduxjs/toolkit';

const generalParameterSlice = createSlice({
  name: 'generalParameterSlice',
  initialState: {
    data: null,
  },
  reducers: {
    setGeneralParameter: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setGeneralParameter } = generalParameterSlice.actions;
export default generalParameterSlice.reducer;
