import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiRequest from '../../services/ApiRequest';

// ── Types ────────────────────────────────────────────────────────────────────

export interface DripStepPayload {
  id: string; // local UI id (string date / uuid)
  dayDelay: number;
  time: string; // "HH:MM"
  title: string;
  body: string;
}

export interface DripCampaignState {
  id: number | null;
  name: string;
  is_active: boolean;
  steps: DripStepPayload[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DripCampaignState = {
  id: null,
  name: 'My Drip Campaign',
  is_active: false,
  steps: [],
  loading: false,
  saving: false,
  error: null,
};

// ── Thunks ───────────────────────────────────────────────────────────────────

/** Fetch the active drip campaign for an app (by public_app_id) */
export const fetchDripCampaign = createAsyncThunk<
  DripCampaignState | null,
  string, // publicAppId
  { rejectValue: string }
>('drip/fetchDripCampaign', async (publicAppId, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/apps/${publicAppId}/drip-campaign`, 'get');
    const data = response.data; // null when no campaign exists yet
    if (!data) return null;

    // Map DB drip_steps -> DripStepPayload
    const steps: DripStepPayload[] = (data.steps ?? []).map((s: any, idx: number) => {
      let payload: { title?: string; body?: string } = {};
      try {
        payload = JSON.parse(s.notification_payload_json);
      } catch {
        //error
      }
      return {
        id: String(s.id ?? idx),
        dayDelay: s.delay_days ?? 0,
        time: (s.scheduled_at_local_time ?? '09:00').substring(0, 5),
        title: payload.title ?? '',
        body: payload.body ?? '',
      };
    });

    return {
      id: data.id,
      name: data.name,
      is_active: data.is_active,
      steps,
      loading: false,
      saving: false,
      error: null,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch drip campaign');
  }
});

/** Save (create/replace) the drip campaign for an app */
export const saveDripCampaign = createAsyncThunk<
  DripCampaignState,
  { publicAppId: string; isActive: boolean; steps: DripStepPayload[] },
  { rejectValue: string }
>('drip/saveDripCampaign', async ({ publicAppId, isActive, steps }, { rejectWithValue }) => {
  try {
    const response = await ApiRequest(`/apps/${publicAppId}/drip-campaign`, 'post', {
      name: 'Drip Campaign',
      is_active: isActive,
      steps: steps.map((s) => ({
        dayDelay: s.dayDelay,
        time: s.time,
        title: s.title,
        body: s.body,
      })),
    });

    const data = response.data;
    const mappedSteps: DripStepPayload[] = (data.steps ?? []).map((s: any, idx: number) => {
      let payload: { title?: string; body?: string } = {};
      try {
        payload = JSON.parse(s.notification_payload_json);
      } catch {}
      return {
        id: String(s.id ?? idx),
        dayDelay: s.delay_days ?? 0,
        time: (s.scheduled_at_local_time ?? '09:00').substring(0, 5),
        title: payload.title ?? '',
        body: payload.body ?? '',
      };
    });

    return {
      id: data.id,
      name: data.name,
      is_active: data.is_active,
      steps: mappedSteps,
      loading: false,
      saving: false,
      error: null,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to save drip campaign');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const dripSlice = createSlice({
  name: 'drip',
  initialState,
  reducers: {
    clearDrip: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchDripCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDripCampaign.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.id = action.payload.id;
          state.name = action.payload.name;
          state.is_active = action.payload.is_active;
          state.steps = action.payload.steps;
        }
        // null payload just means no campaign yet — keep defaults
      })
      .addCase(fetchDripCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch drip campaign';
      });

    // Save
    builder
      .addCase(saveDripCampaign.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveDripCampaign.fulfilled, (state, action) => {
        state.saving = false;
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.is_active = action.payload.is_active;
        state.steps = action.payload.steps;
      })
      .addCase(saveDripCampaign.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to save drip campaign';
      });
  },
});

export const { clearDrip } = dripSlice.actions;
export default dripSlice.reducer;
