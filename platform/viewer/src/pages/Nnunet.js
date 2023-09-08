import React, { useEffect, useRef, useState } from 'react';
import Page from '../components/Page';
import { withRouter, useLocation, useHistory } from 'react-router-dom';
import { Icon } from '../../../ui/src/elements/Icon';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { servicesManager } from '../App';
import { CSSTransition } from 'react-transition-group';
import { radcadapi } from '../utils/constants';
import { ProgressBar } from '../components/LoadingBar';
import { getItem } from '../lib/localStorageUtils';

const { UIDialogService, UINotificationService } = servicesManager.services;

const transitionDuration = 500;
const transitionClassName = 'labelling';
const transitionOnAppear = true;

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export const getExistingSegmentations = async (series_uid, userEmail) => {
  try {
    const response = await fetch(
      `${radcadapi}/segmentations?series=${series_uid}&email=${userEmail}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting existing segmentations: ', error);
    return [];
  }
};

// startNnunetProcess function
export const startNnunetProcess = async (
  studyInstanceUID,
  seriesInstanceUID,
  user
) => {
  try {
    UIDialogService.dismiss({ id: 'ForceRerun' });
    const parameters = getItem('parameters');

    const url = radcadapi + '/nnunet_brain';
    const body = JSON.stringify({
      study_uid: studyInstanceUID,
      series_uid: seriesInstanceUID,
      email: user.profile.email,
      parameters,
    });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access_token}`,
      },
      body: body,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error starting nnUNet process: ', error);
  }
};

export const checkJobStatus = async user => {
  const maxAttempts = 1;
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const url =
        radcadapi +
        `/nnunet/job-status?user_email=${user.profile.email}&job_type=NNUNET_BRAIN`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
      });
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error checking nnUNet job status: ', error);
      attempts++;
      if (attempts === maxAttempts) {
        return 'ERROR';
      }
    }
  }
};

const ForceRerun = props => {
  return (
    <CSSTransition
      // in={this.props.displayComponent}
      appear={transitionOnAppear}
      timeout={transitionDuration}
      classNames={transitionClassName}
      // onExited={this.props.onTransitionExit}
    >
      <div
        className="importModalContainer"
        style={{
          position: 'relative',
          padding: '1em',
          zIndex: '999',
          transition: 'all 200ms linear',
          maxHeight: '500px',
          background: 'var(--ui-gray-darkest)',
        }}
      >
        <div className="seriesTitle">{props.message}</div>
        <div className="footer" style={{ justifyContent: 'flex-end' }}>
          <div>
            <button
              onClick={props.onClose}
              data-cy="cancel-btn"
              className="btn btn-default"
            >
              Cancel
            </button>
            <button
              onClick={props.onConfirm}
              className="btn btn-primary"
              data-cy="ok-btn"
            >
              Run
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

function NnunetPage({ studyInstanceUIDs, seriesInstanceUIDs }) {
  const [processStarted, setProcessStarted] = useState(false);
  const user = useSelector(state => state.oidc.user);
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('active');
  const [helperText, setHelperText] = useState('Processing nnunet job...');

  const handleOnSuccess = () => {
    const direction = localStorage.getItem('direction');
    const pathname =
      direction && direction === 'back'
        ? location.pathname.replace('nnunet', 'view')
        : location.pathname.replace('nnunet', 'edit');

    history.push(pathname);
  };

  const handleOnExist = () => {
    let direction = localStorage.getItem('direction');
    let pathname;
    if (direction && direction == 'back')
      pathname = location.pathname.replace('nnunet', 'view');
    else pathname = location.pathname.replace('nnunet', 'edit');
    UIDialogService.dismiss({ id: 'ForceRerun' });
    history.push(pathname);
  };

  const showLoadSegmentationDialog = message => {
    if (!UIDialogService) {
      console.warn('Unable to show dialog; no UI Dialog Service available.');
      return;
    }

    UIDialogService.create({
      id: 'ForceRerun',
      isDraggable: false,
      showOverlay: true,
      centralize: true,
      content: ForceRerun,
      contentProps: {
        message,
        onConfirm: async () => {
          await startNnunetProcess(
            studyInstanceUIDs[0],
            JSON.parse(localStorage.getItem('series_uid')),
            user
          );
          setProcessStarted(true);
        },
        onClose: () => handleOnExist(),
      },
    });
  };

  useInterval(async () => {
    if (processStarted) {
      const status = await checkJobStatus(user);

      if (status === 'DONE') {
        handleOnSuccess();
        setStatus('success');
        setHelperText('Done!');
      } else if (status === 'RUNNING') {
        setStatus('active');
        setHelperText('nnunet job is running...');
      } else {
        handleOnSuccess();
      }
      // } else if (status === 'ERROR') {
      //   setStatus('error');
      //   setHelperText('An error occurred!');
      // }
    }
  }, 16000);

  useEffect(async () => {
    const series_uid = JSON.parse(localStorage.getItem('series_uid') || '');
    setStatus('active');
    setHelperText('Checking if segmentations exist...');
    const segmentationsList = await getExistingSegmentations(
      series_uid,
      user.profile.email
    );
    setHelperText('starting nnunet process...');
    if (isEmpty(segmentationsList)) {
      await startNnunetProcess(
        studyInstanceUIDs[0],
        JSON.parse(localStorage.getItem('series_uid')),
        user
      );
      setProcessStarted(true);
    } else {
      let has_nnunet = false;
      const segmentationsList2 = Object.keys(segmentationsList) || [];
      for (const segment_label_name of segmentationsList2) {
        if (segment_label_name.includes('nnunet')) {
          has_nnunet = true;
          break;
        }
      }
      showLoadSegmentationDialog(
        has_nnunet
          ? 'Nnunet segmentations exist, do you re-run nnunet segmentation?'
          : 'Non-nnunet segmentations exist, do you run nnunet segmentation?'
      );
    }
  }, []);

  return (
    <Page>
      <div
        style={{
          width: '100%',
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading && (
          <>
            <div className="nnunet-page__header">
              <h1 className="nnunet-page__title">
                Loading nnU-Net Segmentation
              </h1>
              <ProgressBar
                indeterminate
                status={status}
                helperText={helperText}
              />

              {/* <ProgressBar
                indeterminate
                status="success"
                helperText="42/256 items"
              />
              <ProgressBar
                progress={progress}
                helperText="Fetching assets..."
                status="active"
              />
              <ProgressBar
                progress={75}
                helperText="42/256 items"
                status="success"
              />
              <ProgressBar
                progress={100}
                helperText="Failed to load items"
                status="error"
              /> */}
            </div>
          </>
        )}
      </div>
    </Page>
  );
}
export default withRouter(NnunetPage);
