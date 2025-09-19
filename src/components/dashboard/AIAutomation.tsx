"use client";

import { useState } from "react";

const steps = [
  { id: 1, title: "Choose Automation Type", content: "Select chatbot, recommendations, or workflow." },
  { id: 2, title: "Configure Settings", content: "Set up parameters and integrations." },
  { id: 3, title: "Test and Deploy", content: "Test the automation and go live." },
];

const AIAutomation = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="ai-automation">
      <h2>AI Automation Wizard</h2>
      <div className="progress mb-4">
        <div
          className="progress-bar"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        ></div>
      </div>
      <div className="step-content">
        <h4>{steps[currentStep - 1].title}</h4>
        <p>{steps[currentStep - 1].content}</p>
        <select className="form-select mb-3">
          <option>Chatbot</option>
          <option>Product Recommendations</option>
          <option>Workflow Automation</option>
        </select>
      </div>
      <div className="step-navigation">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </button>
        <button className="btn btn-primary ms-2" onClick={nextStep}>
          {currentStep === steps.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default AIAutomation;