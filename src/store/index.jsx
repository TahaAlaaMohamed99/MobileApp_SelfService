import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import resourcesReducer from './resourcesSlice';
import generalParameterReducer from './generalParameterSlice';
import errorSheetReducer from './errorSheetSlice';
import notificationsReducer from './NotificationsSlice';

export const store = configureStore({
  reducer: {
    themeSlice: themeReducer,
    resourcesSlice: resourcesReducer,
    generalParameterSlice: generalParameterReducer,
    errorSheetSlice: errorSheetReducer,
    notificationsSlice: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
