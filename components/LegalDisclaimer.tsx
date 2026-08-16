import React from 'react';

const LegalDisclaimer: React.FC = () => {
  return (
    <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-md">
      <h3 className="text-lg font-bold text-red-800 mb-2">CRITICAL EXPERIMENTAL NOTICE & DISCLAIMER</h3>
      <div className="text-sm text-red-700 space-y-4">
        <p>
          <strong>EXPERIMENTAL USE ONLY:</strong> SynSyncPro is an experimental wellness platform. 
          The protocols and visual stimuli (including cymatics) provided are for research and personal 
          exploration purposes only.
        </p>
        <p>
          <strong>USE AT YOUR OWN RISK:</strong> By using this software, you acknowledge that you are 
          doing so at your own risk. The developers and contributors are NOT responsible for any 
          physical, psychological, or technical consequences resulting from the use of this application.
        </p>
        <p>
          <strong>MEDICAL WARNING:</strong> If you have a history of seizures, epilepsy, or photosensitivity, 
          do NOT use the visualizer modes. Consult a medical professional before engaging in brainwave 
          entrainment or biofeedback sessions.
        </p>
        <p>
          <strong>PRIVACY FOCUS:</strong> This is a client-side only application. No biometric or EEG 
          data is transmitted to external servers. Your data stays in your browser.
        </p>
        <p className="font-mono text-xs mt-4">
          LEGAL_STATUS: UNREGULATED_WELLNESS_DEVICE_PROTOTYPE
        </p>
      </div>
    </div>
  );
};

export default LegalDisclaimer;
