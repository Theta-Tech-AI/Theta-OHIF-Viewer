import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getItem } from '../lib/localStorageUtils';
import { lungMode } from '../utils/constants';

// ----------------------------------------------------------------------

const Summary = props => {
  const { similarityResultState, currentMode } = props;
  const [patientData, setPatientData] = useState({});
  // const [lungMode, setLungMode] = useState(false);

  useEffect(() => {
    setPatientData(getItem('selectedStudy'));
  }, []);

  const isInLungMode = currentMode === lungMode;

  console.log(isInLungMode);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: !isInLungMode ? '#e6e6e6' : 'black',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div
        style={{
          paddingBottom: '40px',
        }}
      >
        <h1
          style={{
            textAlign: 'left',
            margin: 0,
            color: !isInLungMode ? 'black' : 'white',
          }}
        >
          RadCard Report Summary
        </h1>
      </div>

      <div
        style={{
          height: '100%',
          flex: 1,
        }}
      >
        <div
          className=""
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Patient ID :{' '}
          </h2>
          <h2 style={{ color: !isInLungMode ? 'black' : 'white' }}>
            {' '}
            {patientData.PatientID}{' '}
          </h2>
        </div>

        <div
          className=""
          style={{
            display: 'flex',
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Patient Name :{' '}
          </h2>
          <h2 style={{ color: !isInLungMode ? 'black' : 'white' }}> {patientData.PatientName} </h2>
        </div>

        <div
          className=""
          style={{
            display: 'flex',
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Classifier :{' '}
          </h2>
          <h2 style={{ color: !isInLungMode ? 'black' : 'white' }}>Resnet-18 </h2>
        </div>

        {isInLungMode && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 12,
              justifyContent: 'flex-start',
            }}
          >
            <h2
              className="cad"
              style={{
                color: '#00c7ee',
              }}
            >
              Malignant Score :{' '}
            </h2>
            <h2>
              {similarityResultState.score
                ? similarityResultState.score
                : ' loading...'}
            </h2>
          </div>
        )}

        <div
          style={{
            marginTop: 12,
          }}
        >
          <button
            disabled={isInLungMode && !similarityResultState.score}
            onClick={props.triggerDownload}
            className="btn btn-primary btn-large"
          >
            Print To PDF
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
        }}
      ></div>
    </div>
  );
};

export default Summary;
