import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appsReducer from './slices/appsSlice';
import adminReducer from './slices/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  apps: appsReducer,
  admin: adminReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
