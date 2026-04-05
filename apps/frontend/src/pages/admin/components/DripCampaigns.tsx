import React, { useState, useEffect } from "react";
import { RiAddLine, RiTimeLine, RiDeleteBinLine, RiSave3Line, RiLoaderLine } from "@remixicon/react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchDripCampaign,
  saveDripCampaign,
  DripStepPayload,
} from "../../../store/slices/dripSlice";

interface DripCampaignsProps {
  appId: string; // public_app_id
}

export const DripCampaigns: React.FC<DripCampaignsProps> = ({ appId }) => {
  const dispatch = useAppDispatch();
  const { steps: reduxSteps, name: reduxName, loading, saving, error } = useAppSelector(
    (state) => state.drip
  );

  // Local editable copies of steps and campaign name
  const [steps, setSteps] = useState<DripStepPayload[]>([]);
  const [campaignName, setCampaignName] = useState("My Drip Campaign");

  // Fetch from API when component mounts (or appId changes)
  useEffect(() => {
    dispatch(fetchDripCampaign(appId));
  }, [appId, dispatch]);

  // Sync local state when redux state loads
  useEffect(() => {
    if (reduxSteps.length > 0) {
      setSteps(reduxSteps);
    } else if (!loading) {
      // No campaign yet — set friendly defaults
      setSteps([
        { id: "1", dayDelay: 1, time: "09:00", title: "Welcome to Vibe!", body: "Thanks for joining us." },
        { id: "2", dayDelay: 3, time: "10:00", title: "Check out this feature", body: "Did you know you can do X?" },
      ]);
    }
    setCampaignName(reduxName || "My Drip Campaign");
  }, [reduxSteps, reduxName, loading]);

  const addStep = () => {
    const newStep: DripStepPayload = {
      id: Date.now().toString(),
      dayDelay: steps.length > 0 ? steps[steps.length - 1].dayDelay + 2 : 1,
      time: "09:00",
      title: "",
      body: "",
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id: string, field: keyof DripStepPayload, value: string | number) => {
    setSteps(steps.map(step => step.id === id ? { ...step, [field]: value } : step));
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleSave = async () => {
    const result = await dispatch(saveDripCampaign({ publicAppId: appId, name: campaignName, steps }));
    if (saveDripCampaign.fulfilled.match(result)) {
      toast.success("Drip campaign saved successfully!");
    } else {
      toast.error((result.payload as string) || "Failed to save drip campaign");
    }
  };

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-12">
        <RiLoaderLine size={32} className="animate-spin text-theme-primary-500" />
        <span className="ml-3 text-theme-text-secondary">Loading drip campaign...</span>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 mr-4">
          <h2 className="text-xl font-semibold text-theme-text-primary">
            Drip Campaigns
          </h2>
          <p className="text-sm text-theme-text-secondary mt-1">
            Automated sequence of messages sent to new subscribers based on their signup date.
          </p>
          {/* Campaign name editable field */}
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Campaign name"
            className="mt-3 w-full md:w-72 p-2 text-sm border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:ring-1 focus:ring-theme-primary-500 outline-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-4 py-2 disabled:opacity-50"
        >
          {saving ? (
            <RiLoaderLine size={18} className="animate-spin" />
          ) : (
            <RiSave3Line size={18} />
          )}
          {saving ? "Saving..." : "Save Campaign"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Timeline of steps */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-theme-border before:to-transparent">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-theme-bg-primary bg-theme-primary-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              {index + 1}
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-theme-border bg-theme-bg-secondary shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-theme-text-secondary mb-1">Delay (Days)</label>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">Day</span>
                      <input
                        type="number"
                        min="0"
                        value={step.dayDelay}
                        onChange={(e) => updateStep(step.id, "dayDelay", parseInt(e.target.value) || 0)}
                        className="w-16 p-1 text-sm border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:ring-1 focus:ring-theme-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-theme-text-secondary mb-1 flex items-center gap-1">
                      <RiTimeLine size={12} /> Local Time
                    </label>
                    <input
                      type="time"
                      value={step.time}
                      onChange={(e) => updateStep(step.id, "time", e.target.value)}
                      className="p-1 text-sm border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:ring-1 focus:ring-theme-primary-500 outline-none"
                    />
                  </div>
                </div>
                <button onClick={() => removeStep(step.id)} className="text-red-400 hover:text-red-600 p-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <RiDeleteBinLine size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Notification Title"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, "title", e.target.value)}
                  className="w-full font-medium p-2 border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary outline-none focus:border-theme-primary-400"
                />
                <textarea
                  placeholder="Notification Body"
                  value={step.body}
                  onChange={(e) => updateStep(step.id, "body", e.target.value)}
                  rows={2}
                  className="w-full text-sm p-2 border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary outline-none focus:border-theme-primary-400 resize-none"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Step button */}
        <div className="relative flex items-center justify-center pt-4">
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-theme-primary-500 text-theme-primary-600 hover:bg-theme-primary-50 dark:hover:bg-theme-primary-900/20 transition-colors bg-theme-bg-primary z-10"
          >
            <RiAddLine size={18} />
            Add Step
          </button>
        </div>
      </div>
    </div>
  );
};
