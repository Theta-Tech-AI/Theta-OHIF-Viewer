import './ImportIdc.styl';

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { servicesManager } from '../App.js';

<div style="position: relative; padding-bottom: 67.16417910447761%; height: 0;">
  <iframe
    src="https://www.loom.com/embed/95080d7337224057bd2ec472ae913f1e?sid=701f089c-f1f9-4814-a38a-b8c277d57542"
    frameborder="0"
    webkitallowfullscreen
    mozallowfullscreen
    allowfullscreen
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
  ></iframe>
</div>;

const steps = [
  {
    title: 'Department Selection ',
    description:
      'Select your designated department to view patient study in that department',
    videoLink:
      'https://www.loom.com/embed/d85e16498c1840198df2df45ea22d944?sid=b4082e09-3e9c-482f-bb9c-f5a5500a2ba4',
  },
  {
    title: 'Select Patient Study',
    description:
      'Learn how to efficiently navigate through the OHIF Viewer interface, browse the database, and select a specific patient’s study for a detailed review.',
    videoLink:
      'https://www.loom.com/embed/1b6d1b488a5249c7b3dfb839a4f6dd75?sid=5f9d6d01-5fc5-4625-a6fc-a566c4fd2f24',
  },
  {
    title: 'CT Scan Modification and Visualization',
    description:
      'Delve into the nuances of CT scan visualization. Master the use of essential tools such as zoom, pan, and window level adjustments to optimize image clarity and detail, ensuring precise analysis.',
    videoLink:
      'https://www.loom.com/embed/8d0b5c737e3b4fb892d22bb2e2a8d7d6?sid=52693cf9-f750-48b9-8af9-a67d8185b594',
  },
  {
    title: 'Draw Rectangle Region of Interest',
    description:
      'Get hands-on with the rectangle tool, learning how to draw and adjust regions of interest on the scan, focusing on areas that need special attention.',
    videoLink:
      'https://www.loom.com/embed/7be364b85b354a4b9eee2d28a670d068?sid=da16fd6b-0b75-41c6-a3e9-8568ab34d95a',
  },
  {
    title: 'Interact with Similar Looking Scans',
    description:
      'Understand the process of comparing and contrasting scans with similar attributes, leveraging the OHIF Viewer’s interactive features to make accurate diagnoses.',
    videoLink:
      'https://www.loom.com/embed/1ad5b070da934585a36bb5648316d2fd?sid=03ebe2a0-2868-4f0e-a73b-a124fc7b3314',
  },
  {
    title: 'Collage Feature',
    description:
      'Explore the collage functionality, enabling you to view multiple scans simultaneously for a holistic patient study, aiding in diagnosis and treatment planning.',
    videoLink:
      'https://www.loom.com/embed/1ad5b070da934585a36bb5648316d2fd?sid=03ebe2a0-2868-4f0e-a73b-a124fc7b3314',
  },
];



function Walkthrough(props) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const currentStep = steps[activeStep];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h2 style={{ marginBottom: '10px' }}>{currentStep.title}</h2>
      <p
        style={{ marginBottom: '20px', textAlign: 'center', maxWidth: '600px' }}
      >
        {currentStep.description}
      </p>
      <div
        style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}
      >
        <iframe
          src={currentStep.videoLink}
          frameborder="0"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
          title="Loom video"
        ></iframe>
      </div>
      <div className="btn-group" style={{ marginTop: '20px' }}>
        <button
          className="btn btn-danger"
          onClick={handleBack}
          disabled={activeStep === 0}
          style={{ marginRight: '10px' }}
        >
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={activeStep === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function WalkthroughModal({ isOpen = false, onClose, onSuccess, t }) {
  const { UIModalService, UINotificationService } = servicesManager.services;

  const ShowModal = () => {
    if (!UIModalService) {
      return;
    }

    const handleOnSuccess = () => {
      UINotificationService.show({
        title: 'How to use ',
        message: '',
        type: 'info',
      });
      UIModalService.hide();
      // Force auto close
      onSuccess(UIModalService);
    };

    UIModalService.show({
      title: t('How To Use Ohif'),
      content: Walkthrough,
      contentProps: {
        handleOnSuccess,
      },
      onClose,
    });
  };

  return <React.Fragment>{isOpen && ShowModal()}</React.Fragment>;
}

WalkthroughModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default withTranslation('Common')(WalkthroughModal);
