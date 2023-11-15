import React from 'react';
import cornerstoneTools from 'cornerstone-tools';
import { getEnabledElement } from '../../../../cornerstone/src/state';
import { Icon } from '@ohif/ui';
import '../XNATRoiPanel.styl';
import { generateSegmentationMetadata } from '../../peppermint-tools';
import { triggerEvent } from 'cornerstone-core';
import refreshViewports from '../../../../dicom-segmentation/src/utils/refreshViewports';
import { connect } from 'react-redux';
import {
  getUpdatedSegments,
  uncompress,
} from '@ohif/viewer/src/appExtensions/LungModuleSimilarityPanel/utils';
import List, {
  ListItem,
} from '@ohif/viewer/src/appExtensions/LungModuleSimilarityPanel/components/list';
import { radcadapi } from '@ohif/viewer/src/utils/constants';
import { getItem } from '@ohif/viewer/src/lib/localStorageUtils';
import Worker from './segments.worker';

// import t1payload from './t1paylod.json';
// import t2payload from './t2paylod.json';
// import flairpaylod from './flairpaylod.json';
// import ct1payload from './ct1payload.json';
import ProgressBar from '@ohif/viewer/src/components/LoadingBar/progress';

const modalityToPayloadMapping = {
  FLAIR: 'https://share-ohif.s3.amazonaws.com/flairpaylod.json',
  T1: 'https://share-ohif.s3.amazonaws.com/t1paylod.json',
  T2: 'https://share-ohif.s3.amazonaws.com/t2paylod.json',
  T1CE: 'https://share-ohif.s3.amazonaws.com/ct1payload.json',
  // Add more mappings as needed
};

// const modalityToPayloadMapping2 = {
//   T1: t1payload,
//   T2: t2payload,
//   FLAIR: flairpaylod,
//   T1CE: ct1payload,
//   // Add more mappings as needed
// };

const segmentationModule = cornerstoneTools.getModule('segmentation');

function getStoredRecommendedDisplayCIELabValueByLabel(label) {
  return getItem(`segmentColor_${label}`);
}

class XNATSegmentationImportMenu extends React.Component {
  worker = new Worker();

  currentSegmentationIndex = 0;
  segmentations = {}; // Assuming this is your segmentations data structure

  constructor(props = {}) {
    super(props);

    this.state = {
      importListReady: false,
      importing: false,
      serviceWorkerDone: false,
      progressText: '',
      importProgress: 0,
      segmentations: {},
      selectedSegmentation: '',
    };

    this.labelmap2DRef = React.createRef();
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  componentDidMount() {
    console.log('import onmount');
    //  this.fetchSegmentationsFromLocalStorage();
    this.onImportButtonClick();
    this.worker.onmessage = this.handleWorkerResponse;

    // this.worker.onmessage = event => {
    //   const { status, data, progress, message } = event.data;

    //   if (status === 'success') {
    //     // Call the method to add these segmentations to the canvas

    //     const view_ports = cornerstone.getEnabledElements();
    //     const viewports = view_ports[0];
    //     const element = getEnabledElement(view_ports.indexOf(viewports));

    //     this.setState({
    //       serviceWorkerDone: true,
    //     });
    //     this.addToCanvas({ processedSegmentations: data });

    //     refreshViewports();
    //     triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
    //   } else if (status === 'error') {
    //     console.error('Error from segmentation worker:', message);
    //     this.props.onImportCancel();
    //     // Handle the error in your UI or logic here
    //     // For example:
    //     // this.setState({
    //     //   error: true,
    //     //   errorMessage: message,
    //     // });
    //   } else if (status === 'progress') {
    //     // Update the state with the new progress
    //     this.setState({
    //       importProgress: progress,
    //     });
    //   }
    // };
  }

  getSegmentationName(key) {
    return key.split('-').join(' ');
  }

  onCloseButtonClick() {
    this.props.onImportCancel();
  }

  // New function to post messages to the worker
  postSegmentationToWorker(labelmap3D) {
    const segmentationKeys = Object.keys(this.segmentations);
    if (this.currentSegmentationIndex >= segmentationKeys.length) {
      return; // All segmentations processed
    }

    const item = segmentationKeys[this.currentSegmentationIndex];
    const segDetails = this.segmentations[item];
    const segmentIndex = labelmap3D.activeSegmentIndex;

    this.worker.postMessage({
      segDetails,
      segmentIndex,
      labelmap3D,
      label: item,
    });
  }

  // postSegmentationToWorker(segmentations, labelmap3D) {
  //   Object.keys(segmentations).forEach(item => {
  //     const segDetails = segmentations[item];
  //     const segmentIndex = labelmap3D.activeSegmentIndex;

  //     this.worker.postMessage({
  //       segDetails,
  //       segmentIndex,
  //       labelmap3D,
  //       label: item,
  //     });
  //   });
  // }

  // New function to handle worker responses
  handleWorkerResponse = event => {
    const {
      label,
      updated2dMaps,
      newSegmentIndex,
      metadataExists,
    } = event.data.data;

    const item = label;
    // Process each worker response
    this.processAndAddSegmentationToCanvas(
      item,
      updated2dMaps,
      newSegmentIndex,
      metadataExists
    );

    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));

    const segmentationKeys = Object.keys(this.segmentations);
    const currentSegmentationIndex = this.currentSegmentationIndex;
    if (currentSegmentationIndex >= 2) {
      refreshViewports();
      triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
    } else {
      this.currentSegmentationIndex++;
      const labelmap2D = this.labelmap2DRef.current;
      const { labelmap3D } = labelmap2D;
      // const labelmap2DRef = segmentationModule.getters.labelmap2D(element);
      this.postSegmentationToWorker(labelmap3D);
    }
  };

  // Modified addToCanvas function to use postSegmentationToWorker
  addToCanvas({ segmentations }) {
    this.segmentations = segmentations;
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));
    this.labelmap2DRef.current = segmentationModule.getters.labelmap2D(element);

    const labelmap2D = this.labelmap2DRef.current;
    const { labelmap3D } = labelmap2D;
    // this.postSegmentationToWorker(segmentations, labelmap3D);

    this.postSegmentationToWorker(labelmap3D);
  }

  // New function to process and add each segmentation to canvas
  processAndAddSegmentationToCanvas(
    item,
    updated2dMaps,
    newSegmentIndex,
    metadataExists
  ) {
    const labelmap2D = this.labelmap2DRef.current;
    const { labelmap3D } = labelmap2D;
    let metadata = metadataExists ? labelmap3D.metadata[newSegmentIndex] : null;
    const segmentIndex = newSegmentIndex;
    const segmentationKeys = Object.keys(this.segmentations);
    const total = segmentationKeys.length;
    const progress = Math.round(((newSegmentIndex + 1) / total) * 100);

    if (!metadata) {
      metadata = generateSegmentationMetadata(item);

      labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
      if (segmentIndex === 1) {
        const mDataInit = Array(1);
        mDataInit[1] = metadata;
        labelmap2D.labelmap3D.metadata = mDataInit;
      } else {
        labelmap2D.labelmap3D.metadata[segmentIndex] = metadata;
      }
      labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

      segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
    } else {
      labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
      labelmap2D.labelmap3D.metadata[
        segmentIndex
      ] = generateSegmentationMetadata(item);
      labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

      segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
    }
    this.setState({
      importProgress: progress,
    });
  }

  // processSegmentations({ segmentations, labelmap3D }) {
  //   const processedSegmentations = [];

  //   Object.keys(segmentations).forEach((item, index) => {
  //     const segDetails = segmentations[item];
  //     const uncompressed = uncompress({
  //       segmentation: segDetails.segmentation,
  //       shape:
  //         typeof segDetails.shape === 'string'
  //           ? JSON.parse(segDetails.shape)
  //           : segDetails.shape,
  //     });
  //     const segmentIndex = index + 1;

  //     const updated2dMaps = getUpdatedSegments({
  //       segmentation: uncompressed,
  //       currPixelData: labelmap3D.labelmaps2D,
  //       segmentIndex,
  //     });

  //     processedSegmentations.push({
  //       label: item,
  //       uncompressed,
  //       updated2dMaps,
  //     });
  //   });

  //   return processedSegmentations;
  // }

  // processSegmentation(segDetails, segmentIndex, labelmap3D) {
  //   const segmentation = uncompress({
  //     segmentation: segDetails.segmentation,
  //     shape:
  //       typeof segDetails.shape === 'string'
  //         ? JSON.parse(segDetails.shape)
  //         : segDetails.shape,
  //   });

  //   let updated2dMaps;
  //   let newSegmentIndex = segmentIndex;
  //   let metadataExists = !!labelmap3D.metadata[segmentIndex];

  //   if (!metadataExists) {
  //     updated2dMaps = getUpdatedSegments({
  //       segmentation,
  //       segmentIndex,
  //       currPixelData: labelmap3D.labelmaps2D,
  //     });
  //   } else {
  //     newSegmentIndex = labelmap3D.metadata.length;
  //     updated2dMaps = getUpdatedSegments({
  //       segmentation,
  //       segmentIndex: newSegmentIndex,
  //       currPixelData: labelmap3D.labelmaps2D,
  //     });
  //   }

  //   return { updated2dMaps, newSegmentIndex, metadataExists };
  // }

  // addToCanvas({ segmentations }) {
  //   const view_ports = cornerstone.getEnabledElements();
  //   const viewports = view_ports[0];
  //   const element = getEnabledElement(view_ports.indexOf(viewports));
  //   this.labelmap2DRef.current = segmentationModule.getters.labelmap2D(element);

  //   const labelmap2D = this.labelmap2DRef.current;
  //   const { labelmap3D } = labelmap2D;

  //   let segmentIndex = labelmap3D.activeSegmentIndex;
  //   let metadata = labelmap3D.metadata[segmentIndex];

  //   Object.keys(segmentations).forEach((item, index) => {
  //     ////////////////////////////

  //     const segDetails = segmentations[item];

  //     const {
  //       updated2dMaps,
  //       newSegmentIndex,
  //       metadataExists,
  //     } = this.processSegmentation(segDetails, segmentIndex, labelmap3D);

  //     segmentIndex = newSegmentIndex;
  //     metadata = metadataExists ? labelmap3D.metadata[segmentIndex] : null;

  //     ////////////////////////////

  //     if (!metadata) {
  //       metadata = generateSegmentationMetadata(item);

  //       labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
  //       if (segmentIndex === 1) {
  //         const mDataInit = Array(1);
  //         mDataInit[1] = metadata;
  //         labelmap2D.labelmap3D.metadata = mDataInit;
  //       } else {
  //         labelmap2D.labelmap3D.metadata[segmentIndex] = metadata;
  //       }
  //       labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

  //       segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
  //     } else {
  //       labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
  //       labelmap2D.labelmap3D.metadata[
  //         segmentIndex
  //       ] = generateSegmentationMetadata(item);
  //       labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

  //       segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
  //     }
  //   });
  // }

  processAndAddSegmentations({ segmentations }) {
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));

    // const { labelmap3D } = segmentationModule.getters.labelmap2D(element);
    // this.worker.postMessage({ segmentations, labelmap3D });

    // const processedSegmentations = this.processSegmentations({
    //   segmentations,
    //   labelmap3D,
    // });

    if (Object.keys(segmentations).length === 0) {
      refreshViewports();
      triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
    } else this.addToCanvas({ segmentations });
    // this.addToCanvas({ processedSegmentations, element });

    // refreshViewports();
    // triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
  }

  fetchSegmentations() {
    return new Promise(async (res, rej) => {
      try {
        console.log('fetch segmentation', this.props);
        const series_uid = this.props.viewportData.SeriesInstanceUID;
        // const email = 'nick.fragakis%40thetatech.ai';
        const email = this.props.user.profile.email;

        console.log({ series_uid });

        var requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        };

        await fetch(
          `${radcadapi}/segmentations?series=${series_uid}&email=${email}`,
          requestOptions
        )
          .then(r => r.json().then(data => ({ status: r.status, data: data })))
          .then(async response => {
            console.log({ response });
            res(response.data);
          })
          .catch(error => {
            console.log(error);
          });
      } catch (error) {
        console.log({ error });
        rej(error);
      }
    });
  }

  // getLocalsegmentsForSeries2(modality) {
  //   return new Promise((resolve, reject) => {
  //     const payload = modalityToPayloadMapping2[modality];

  //     if (payload) {
  //       resolve(payload);
  //     } else {
  //       console.error(`No payload found for modality: ${modality}`);
  //       reject('err');
  //     }
  //   });
  // }

  getLocalsegmentsForSeries(modality) {
    return new Promise((resolve, reject) => {
      const url = modalityToPayloadMapping[modality];

      if (url) {
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => resolve(data))
          .catch(error => {
            console.error(
              `Error fetching data for modality: ${modality}`,
              error
            );
            reject(error);
          });
      } else {
        const error = `No URL found for modality: ${modality}`;
        console.error(error);
        reject(new Error(error));
      }
    });
  }
  async onImportButtonClick() {
    setTimeout(async () => {
      const modality = this.props.viewport.viewportSpecificData[0].Modality;

      let segmentations = {};
      try {
        console.log('modality :-------------------', modality);
        segmentations = await this.getLocalsegmentsForSeries(modality);
        console.log('segmentations :-------------------', segmentations);
      } catch (error) {}

      console.log({ segmentations });
      this.processAndAddSegmentations({
        segmentations,
      });
    }, 500); // 500ms delay
    return;
  }

  render() {
    const { importing, serviceWorkerDone, importProgress } = this.state;

    return (
      <div className="xnatPanel">
        <div className="panelHeader">
          <h3>Import mask-based ROI collections</h3>
          {importing ? null : (
            <button className="small" onClick={this.onCloseButtonClick}>
              <Icon name="xnat-cancel" />.
            </button>
          )}
        </div>
        <div className="roiCollectionBody limitHeight">
          {this.state.importListReady ? (
            JSON.stringify(this.state.segmentations) !== '{}' ? (
              <div>
                {Object.keys(this.state.segmentations).map((item, index) => {
                  const title = this.getSegmentationName(item);

                  return (
                    <ListItem
                      key={item}
                      index={index}
                      title={`${title}`}
                      isSelected={this.state.selectedSegmentation === item}
                      onClick={() =>
                        this.setState({
                          selectedSegmentation:
                            this.state.selectedSegmentation === item
                              ? ''
                              : item,
                        })
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <p>No Segmentations</p>
            )
          ) : (
            <>
              <p>Importing Segmentations. Please wait...</p>
              {/* {serviceWorkerDone ? (
                <ProgressBar
                  indeterminate
                  status="success"
                  helperText="Visualizing the segments"
                />
              ) : ( */}
              <ProgressBar
                progress={importProgress}
                helperText={`Processing, ${importProgress}% completed`}
                status="active"
              />
              {/* )} */}
            </>
          )}
        </div>
        <div className="roiCollectionFooter"></div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.oidc.user,
    viewport: state.viewports,
  };
};

const ConnectedImportMenu = connect(
  mapStateToProps,
  null
)(XNATSegmentationImportMenu);

export default ConnectedImportMenu;
