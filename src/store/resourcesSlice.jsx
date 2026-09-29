import { createSlice } from '@reduxjs/toolkit';
import Resources from '../resources.json';

const resourcesSlice = createSlice({
  name: 'resourcesSlice',
  initialState: {
    ReduxResources: Resources,
  },
  reducers: {
    setResources: (state, action) => {
      state.ReduxResources = action.payload;
    },
  },
});

export const { setResources } = resourcesSlice.actions;
export default resourcesSlice.reducer;
