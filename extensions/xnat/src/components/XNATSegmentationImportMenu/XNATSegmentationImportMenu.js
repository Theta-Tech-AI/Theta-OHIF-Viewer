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
  }

  componentWillUnmount() {
    this.worker.terminate();
  }

  componentDidMount() {
    console.log('import onmount');
    //  this.fetchSegmentationsFromLocalStorage();
    this.onImportButtonClick();

    this.worker.onmessage = event => {
      const { status, data, progress, message } = event.data;

      if (status === 'success') {
        // Call the method to add these segmentations to the canvas

        const view_ports = cornerstone.getEnabledElements();
        const viewports = view_ports[0];
        const element = getEnabledElement(view_ports.indexOf(viewports));

        this.setState({
          serviceWorkerDone: true,
        });
        this.addToCanvas({ processedSegmentations: data });

        refreshViewports();
        triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
      } else if (status === 'error') {
        console.error('Error from segmentation worker:', message);
        this.props.onImportCancel();
        // Handle the error in your UI or logic here
        // For example:
        // this.setState({
        //   error: true,
        //   errorMessage: message,
        // });
      } else if (status === 'progress') {
        // Update the state with the new progress
        this.setState({
          importProgress: progress,
        });
      }
    };
  }

  getSegmentationName(key) {
    return key.split('-').join(' ');
  }

  onCloseButtonClick() {
    this.props.onImportCancel();
  }

  getRoiCoordinates(element) {
    // Access the labelmaps3D data structure
    const { labelmap3D } = segmentationModule.getters.labelmap2D(element);

    // Assuming the first labelmap is the one you want to extract ROIs from

    // Check if the labelmap3D is valid
    if (!labelmap3D) {
      console.error('No labelmap3D available.');
      return;
    }

    // Iterate over each slice's labelmap
    const roiCoordinates = labelmap3D.labelmaps2D.map(
      (labelmap2D, sliceIndex) => {
        // Extract ROI data from labelmap2D
        const rois = labelmap2D.segmentsOnLabelmap.map(segmentIndex => {
          // Get the actual segment data (this is where you'd get your coordinates)
          // For example purposes, let's assume it's a rectangle with `x`, `y`, `width`, `height`
          const roiData = {}; // This would be your logic to extract ROI data

          return {
            sliceIndex,
            segmentIndex,
            ...roiData,
          };
        });

        return rois;
      }
    );

    // Flatten the array of arrays
    return roiCoordinates.flat();
  }

  findBoundingBoxForAllRois(allRoiCoordinates) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    allRoiCoordinates.forEach(roi => {
      const { x, y, width, height } = roi.roiData;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
    };
  }

  drawBoundingBox(element, boundingBox) {
    const enabledElement = cornerstone.getEnabledElement(element);
    const context = enabledElement.canvas.getContext('2d');
    const { image } = enabledElement;

    // Convert the bounding box coordinates to canvas coordinates
    const canvasMinX =
      boundingBox.minX * image.columnPixelSpacing + image.columns * 0.5;
    const canvasMinY =
      boundingBox.minY * image.rowPixelSpacing + image.rows * 0.5;
    const canvasWidth =
      (boundingBox.maxX - boundingBox.minX) * image.columnPixelSpacing;
    const canvasHeight =
      (boundingBox.maxY - boundingBox.minY) * image.rowPixelSpacing;

    // Set the style for the bounding box
    context.strokeStyle = 'yellow';
    context.lineWidth = 2;

    // Draw the rectangle
    context.beginPath();
    context.rect(canvasMinX, canvasMinY, canvasWidth, canvasHeight);
    context.stroke();
  }

  // // Use this function by passing the cornerstone enabled element and the bounding box
  // const element = /* Your logic to get the cornerstone element */;
  // const boundingBox = /* Your logic to calculate the bounding box */;

  // // Now draw the bounding box on the canvas
  // drawBoundingBox(element, boundingBox);

  // // Assuming `allRoiCoordinates` is the output from your ROIs extraction process
  // const boundingBox = findBoundingBoxForAllRois(allRoiCoordinates);

  // // Now you have the bounding box that you can use as input to the Cornerstone Brush Tool
  // console.log(boundingBox);

  processSegmentations({ segmentations, labelmap3D }) {
    const processedSegmentations = [];

    Object.keys(segmentations).forEach((item, index) => {
      const segDetails = segmentations[item];
      const uncompressed = uncompress({
        segmentation: segDetails.segmentation,
        shape:
          typeof segDetails.shape === 'string'
            ? JSON.parse(segDetails.shape)
            : segDetails.shape,
      });

      // const updated2dMaps = getUpdatedSegments({
      //   segmentation: uncompressed,
      //   segmentIndex: labelmap3D.activeSegmentIndex,
      //   currPixelData: labelmap3D.labelmaps2D,
      // });

      processedSegmentations.push({
        label: item,
        uncompressed,
        // updated2dMaps,
      });
    });

    return processedSegmentations;
  }

  addToCanvas({ processedSegmentations }) {
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));
    const totalSegmentations = processedSegmentations.length || 0;

    processedSegmentations.forEach(({ label, uncompressed }, index) => {
      // this.setState({
      //   importProgress: ((index + 1) / totalSegmentations) * 100,
      // });
      const labelmap2D = segmentationModule.getters.labelmap2D(element);
      const segmentation = uncompressed;
      const {
        labelmap3D,
        currentImageIdIndex,
        activeLabelmapIndex,
        ...rest
      } = segmentationModule.getters.labelmap2D(element);

      let segmentIndex = labelmap3D.activeSegmentIndex;
      let metadata = labelmap3D.metadata[segmentIndex];

      if (!metadata) {
        console.warn('layer not occupied');

        metadata = generateSegmentationMetadata(label);
        segmentIndex = labelmap3D.activeSegmentIndex;

        const updated2dMaps = getUpdatedSegments({
          segmentation,
          segmentIndex,
          currPixelData: labelmap3D.labelmaps2D,
        });

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
        //theres something on this layer so we need to find the last layer and work on the one after it
        console.warn('layer occupied', labelmap3D);

        metadata = generateSegmentationMetadata(label);
        segmentIndex = labelmap3D.metadata.length;

        const updated2dMaps = getUpdatedSegments({
          segmentation,
          segmentIndex,
          currPixelData: labelmap3D.labelmaps2D,
        });

        labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
        labelmap2D.labelmap3D.metadata[segmentIndex] = metadata;
        labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

        segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
      }
    });

    const allRoiCoordinates = this.getRoiCoordinates(element);

    // Do something with the ROI coordinates, like logging or exporting
    console.log('-----------------allRoiCoordinates');
    console.log('-----------------allRoiCoordinates');
    console.log('-----------------allRoiCoordinates');
    console.log('-----------------allRoiCoordinates');
    console.log(allRoiCoordinates);
  }

  processAndAddSegmentations({ segmentations }) {
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));

    const { labelmap3D } = segmentationModule.getters.labelmap2D(element);
    this.worker.postMessage({ segmentations, labelmap3D });

    // const processedSegmentations = this.processSegmentations({
    //   segmentations,
    //   labelmap3D,
    // });
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
              {serviceWorkerDone ? (
                <ProgressBar
                  indeterminate
                  status="success"
                  helperText="Visualizing the segments"
                />
              ) : (
                <ProgressBar
                  progress={importProgress}
                  helperText={`Processing, ${importProgress}% completed`}
                  status="active"
                />
              )}
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
