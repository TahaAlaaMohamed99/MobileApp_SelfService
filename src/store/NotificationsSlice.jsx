import { createSlice } from "@reduxjs/toolkit";

const NotificationsSlice = createSlice({
  name: "Notifications",
  initialState: {
    notificationLength: 0,
  },
  reducers: {
    setNotificationLength: (state, action) => {
      state.notificationLength = action.payload;
    },
  },
});

export const { setNotificationLength } = NotificationsSlice.actions;
export default NotificationsSlice.reducer;
