import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRunning,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import './progress.css';
import { min } from 'lodash';
const ProgressBar = ({
  progress,
  indeterminate,
  helperText,
  bgColor,
  status,
}) => {
  const containerStyles = {
    height: 10,
    width: '100%',
    backgroundColor: 'black',
    minWidth: '400px',
    opacity: '0.5',
    borderRadius: 50,
    marginTop: 24,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  };

  const baseFillerStyles = {
    height: '100%',
    borderRadius: 'inherit',
    textAlign: 'right',
    animationDuration: '2s',
    animationFillMode: 'forwards',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
  };

  const determineFillerStyles = () => {
    let backgroundColor = bgColor || '#878787';
    if (status === 'success') {
      backgroundColor = '#9ccef9';
    } else if (status === 'error') {
      backgroundColor = 'red';
    }

    if (indeterminate) {
      return {
        ...baseFillerStyles,
        width: '50%',
        backgroundColor,
        animationName: 'slide',
      };
    } else {
      return {
        ...baseFillerStyles,
        width: `${progress}%`,
        backgroundColor,
      };
    }
  };

  

  const icon = () => {
    switch (status) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} />;
      default:
        return <FontAwesomeIcon icon={faRunning} />;
    }
  };

  const labelStyles = {
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    fontWeight: 'bold',
  };

  const helperContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <div>
      <div style={containerStyles}>
        <div style={determineFillerStyles()}>
          {/* <span style={labelStyles}>{`${progress}%`}</span> */}
        </div>
      </div>
      <div style={helperContainerStyles}>
        <span>{helperText}</span>
        <div>{icon()}</div>
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  progress: PropTypes.number,
  indeterminate: PropTypes.bool,
  helperText: PropTypes.string,
  status: PropTypes.oneOf(['active', 'success', 'error']),
};

export default ProgressBar;
