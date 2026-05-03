import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import appsReducer from './slices/appsSlice';
import adminReducer from './slices/adminSlice';
import dripReducer from './slices/dripSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  apps: appsReducer,
  admin: adminReducer,
  drip: dripReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
