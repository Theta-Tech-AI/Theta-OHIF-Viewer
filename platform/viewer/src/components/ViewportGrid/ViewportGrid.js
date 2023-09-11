import './ViewportGrid.css';
import cornerstoneTools from 'cornerstone-tools';
import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { utils } from '@ohif/core';
import { useSnackbarContext, useLogger } from '@ohif/ui';
//
import ViewportPane from './ViewportPane.js';
import DefaultViewport from './DefaultViewport.js';
import EmptyViewport from './EmptyViewport.js';
// import AppContext, {
//   useAppContext,
//   withAppContext,
// } from '../../context/AppContext';

import { _getFirstImageId } from '../../../../../extensions/xnat/src/components/XNATSegmentationPanel';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { BrainMode, radcadapi } from '../../utils/constants';
import { JobsContext } from '../../context/JobsContext';
import eventBus from '../../lib/eventBus';
import { useSyncedStorageState } from '../../utils/synced_storage';

const { loadAndCacheDerivedDisplaySets, studyMetadataManager } = utils;

export const RenderLoadingModal = () => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 7,
      }}
    >
      <div
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 26,
        }}
      >
        Loading...
      </div>
    </div>
  );
};

const ViewportGrid = function(props) {
  const {
    activeViewportIndex,
    availablePlugins,
    defaultPlugin: defaultPluginName,
    layout,
    numRows,
    numColumns,
    setViewportData,
    studies,
    viewportData,
    children,
    isStudyLoaded,
    currentMode,
  } = props;

  const rowSize = 100 / numRows;
  const colSize = 100 / numColumns;

  // http://grid.malven.co/
  if (!viewportData || !viewportData.length) {
    return null;
  }
  const location = useLocation();

  const snackbar = useSnackbarContext();
  const logger = useLogger();

  const ref = useRef(null);
  const firstImageIdRef = useRef(null);
  const imageDimensionsRef = useRef(null);
  const editedSegmentationRef = useRef({});
  const [isSegmentsLoadedSuccessfully, setSegmentloadingState] = useState(
    false
  );
  const [loadingState, setLoadingState] = useState(true);

  const [fetchedSegmentations, setFetchedSegmentations] = useState('idle');

  useEffect(() => {
    localStorage.setItem('fetchsegments', JSON.stringify(0));
    eventBus.on('completeLoadingState', data => {
      setLoadingState(false);
    });

    eventBus.on('handleThumbnailClick', data => {
      localStorage.setItem('fetchsegments', JSON.stringify(0));
    });

    return () => {
      eventBus.remove('handleThumbnailClick');
      eventBus.remove('completeLoadingState');
    };
  }, []);

  useEffect(() => {
    console.log({
      activeViewportIndex,
      availablePlugins,
      defaultPlugin: defaultPluginName,
      layout,
      numRows,
      numColumns,
      setViewportData,
      studies,
      viewportData,
      children,
      isStudyLoaded,
      // appContext,
      props,
    });
    const series_uid = props.viewportData[0].SeriesInstanceUID;

    localStorage.setItem('series_uid', JSON.stringify(series_uid));

    const targeDiv = ref.current;
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];

    props.studies.map(study => {
      const studyMetadata = studyMetadataManager.get(study.StudyInstanceUID);
      if (studyMetadata._displaySets.length == 0) {
        study.displaySets.map(displaySet =>
          studyMetadata.addDisplaySet(displaySet)
        );
      }
    });

    let firstImageId = _getFirstImageId(props.viewportData[0]);

    const imagePlaneModule =
      cornerstone.metaData.get('imagePlaneModule', firstImageId) || {};
    const { rows, columns } = imagePlaneModule;

    firstImageIdRef.current = firstImageId;
    imageDimensionsRef.current = {
      rows,
      columns,
    };
  }, [activeViewportIndex]);

  useEffect(() => {
    console.log({
      e: editedSegmentationRef.current,
    });
  }, [editedSegmentationRef.current]);

  useEffect(() => {
    if (isStudyLoaded) {
      // if (studies.length > 0) {
      viewportData.forEach(displaySet => {
        loadAndCacheDerivedDisplaySets(displaySet, studies, logger, snackbar);
      });
      if (
        location.pathname.includes('/edit') ||
        (location.pathname.includes('/selectmask') &&
          fetchedSegmentations === 'idle')
      ) {
        if (currentMode === BrainMode)
          setTimeout(() => {
            onImportButtonClick();
          }, 5000);
      }
      // }
    }
  }, [
    studies,
    viewportData,
    isStudyLoaded,
    snackbar,
    isSegmentsLoadedSuccessfully,
  ]);

  const getViewportPanes = () =>
    layout.viewports.map((layout, viewportIndex) => {
      const displaySet = viewportData[viewportIndex];

      if (!displaySet) {
        return null;
      }

      const data = {
        displaySet,
        studies,
      };

      // JAMES TODO:

      // Use whichever plugin is currently in use in the panel
      // unless nothing is specified. If nothing is specified
      // and the display set has a plugin specified, use that.
      //
      // TODO: Change this logic to:
      // - Plugins define how capable they are of displaying a SopClass
      // - When updating a panel, ensure that the currently enabled plugin
      // in the viewport is capable of rendering this display set. If not
      // then use the most capable available plugin

      const pluginName =
        !layout.plugin && displaySet && displaySet.plugin
          ? displaySet.plugin
          : layout.plugin;

      const ViewportComponent = _getViewportComponent(
        data, // Why do we pass this as `ViewportData`, when that's not really what it is?
        viewportIndex,
        children,
        availablePlugins,
        pluginName,
        defaultPluginName
      );

      return (
        <ViewportPane
          onDrop={setViewportData}
          viewportIndex={viewportIndex} // Needed by `setViewportData`
          className={classNames('viewport-container', {
            active: activeViewportIndex === viewportIndex,
          })}
          key={viewportIndex}
        >
          {ViewportComponent}
        </ViewportPane>
      );
    });

  const ViewportPanes = React.useMemo(getViewportPanes, [
    layout,
    viewportData,
    studies,
    children,
    availablePlugins,
    defaultPluginName,
    setViewportData,
    activeViewportIndex,
  ]);

  return (
    <div
      ref={ref}
      data-cy="viewprt-grid"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${numRows}, ${rowSize}%)`,
        gridTemplateColumns: `repeat(${numColumns}, ${colSize}%)`,
        height: '100%',
        position: 'relative',
        width: '100%',
      }}
    >
      {loadingState && <RenderLoadingModal />}
      {ViewportPanes}
    </div>
  );
};

ViewportGrid.propTypes = {
  viewportData: PropTypes.array.isRequired,
  supportsDrop: PropTypes.bool.isRequired,
  activeViewportIndex: PropTypes.number.isRequired,
  layout: PropTypes.object.isRequired,
  availablePlugins: PropTypes.object.isRequired,
  setViewportData: PropTypes.func.isRequired,
  studies: PropTypes.array,
  children: PropTypes.node,
  defaultPlugin: PropTypes.string,
  numRows: PropTypes.number.isRequired,
  numColumns: PropTypes.number.isRequired,
};

ViewportGrid.defaultProps = {
  viewportData: [],
  numRows: 1,
  numColumns: 1,
  layout: {
    viewports: [{}],
  },
  activeViewportIndex: 0,
  supportsDrop: true,
  availablePlugins: {
    DefaultViewport,
  },
  defaultPlugin: 'defaultViewportPlugin',
};

/**
 *
 *
 * @param {*} plugin
 * @param {*} viewportData
 * @param {*} viewportIndex
 * @param {*} children
 * @returns
 */
function _getViewportComponent(
  viewportData,
  viewportIndex,
  children,
  availablePlugins,
  pluginName,
  defaultPluginName
) {
  if (viewportData.displaySet) {
    pluginName = pluginName || defaultPluginName;
    const ViewportComponent = availablePlugins[pluginName];

    if (!ViewportComponent) {
      throw new Error(
        `No Viewport Component available for name ${pluginName}.
         Available plugins: ${JSON.stringify(availablePlugins)}`
      );
    }

    return (
      <ViewportComponent
        viewportData={viewportData}
        viewportIndex={viewportIndex}
        children={[children]}
      />
    );
  }

  return <EmptyViewport />;
}

// export default ViewportGrid;

const mapStateToProps = state => {
  return {
    user: state.oidc.user,
    viewport: state.viewports,
    currentMode: state.mode.active,
  };
};

const ConnectedViewportGrid = connect(
  mapStateToProps,
  null
)(ViewportGrid);

export default ConnectedViewportGrid;
