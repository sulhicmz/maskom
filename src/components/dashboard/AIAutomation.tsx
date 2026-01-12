"use client";

import { useState } from "react";
import { AIStep } from "@/types/data";

interface AIAutomationProps {
  steps: AIStep[];
}

const AIAutomation = ({ steps }: AIAutomationProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progressPercentage = Math.round((currentStep / steps.length) * 100);

  return (
    <div className="ai-automation">
      <h2>AI Automation Wizard</h2>
      <div className="progress mb-4" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Wizard progress">
        <div
          className="progress-bar"
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
      <div className="step-content" role="region" aria-live="polite" aria-label="Wizard step content">
        <h4 id="step-title">{steps[currentStep - 1].title}</h4>
        <p id="step-description">{steps[currentStep - 1].content}</p>
        <label htmlFor="automation-type" className="visually-hidden">Pilih jenis otomatisasi</label>
        <select id="automation-type" className="form-select mb-3" aria-label="Pilih jenis otomatisasi AI">
          <option>Chatbot</option>
          <option>Product Recommendations</option>
          <option>Workflow Automation</option>
        </select>
      </div>
      <div className="step-navigation" role="navigation" aria-label="Wizard navigation">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
          aria-label="Langkah sebelumnya"
        >
          Previous
        </button>
        <button className="btn btn-primary ms-2" onClick={nextStep} aria-label={currentStep === steps.length ? "Selesaikan wizard" : "Langkah berikutnya"}>
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default AIAutomation;