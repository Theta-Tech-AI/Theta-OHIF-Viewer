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
      const { status, data, message } = event.data;

      if (status === 'success') {
        // Call the method to add these segmentations to the canvas
        this.addToCanvas({ processedSegmentations: data });
      } else if (status === 'error') {
        console.error('Error from segmentation worker:', message);
        this.props.onImportCancel();
        // Handle the error in your UI or logic here
        // For example:
        // this.setState({
        //   error: true,
        //   errorMessage: message,
        // });
      }
    };
  }

  getSegmentationName(key) {
    return key.split('-').join(' ');
  }

  onCloseButtonClick() {
    this.props.onImportCancel();
  }

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

      const updated2dMaps = getUpdatedSegments({
        segmentation: uncompressed,
        segmentIndex: labelmap3D.activeSegmentIndex,
        currPixelData: labelmap3D.labelmaps2D,
      });

      processedSegmentations.push({
        item,
        uncompressed,
        updated2dMaps,
      });
    });

    return processedSegmentations;
  }

  addToCanvas({ processedSegmentations }) {
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));

    const labelmap2D = segmentationModule.getters.labelmap2D(element);
    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
      ...rest
    } = segmentationModule.getters.labelmap2D(element);

    processedSegmentations.forEach(({ item, uncompressed, updated2dMaps }) => {
      if (!element) {
        return;
      }

      let segmentIndex = labelmap3D.activeSegmentIndex;
      let metadata = labelmap3D.metadata[segmentIndex];

      if (!metadata) {
        metadata = generateSegmentationMetadata(item);
        const storedColor = getStoredRecommendedDisplayCIELabValueByLabel(item);
        if (storedColor) {
          // uncompressed.RecommendedDisplayCIELabValue = storedColor;
        }

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
        metadata = generateSegmentationMetadata(item);
        segmentIndex = labelmap3D.metadata.length;

        labelmap2D.labelmap3D.labelmaps2D = updated2dMaps;
        labelmap2D.labelmap3D.metadata[segmentIndex] = metadata;
        labelmap2D.labelmap3D.activeSegmentIndex = segmentIndex;

        segmentationModule.setters.updateSegmentsOnLabelmap2D(labelmap2D);
      }

      refreshViewports();
      triggerEvent(element, 'peppermintautosegmentgenerationevent', {});
    });
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
    // this.addToCanvas({ processedSegmentations });
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

  async onImportButtonClick() {
    //  const segmentations = this.fetchSegmentationsFromLocalStorage();
    const startTime = performance.now();

    const segmentations = await this.fetchSegmentations();
    const endTime = performance.now();
    console.log(
      `Time taken by fetchSegmentations: ${(endTime - startTime) / 1000}ms`
    );
    console.log({ segmentations });
    this.processAndAddSegmentations({
      segmentations,
    });
    return;
  }

  render() {
    const { importing } = this.state;

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
            <p>Importing Segmentations. Please wait...</p>
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
