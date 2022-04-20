import React from 'react';
import MaskImporter from '../../utils/IO/classes/MaskImporter';
import fetchJSON from '../../utils/IO/fetchJSON.js';
import fetchArrayBuffer from '../../utils/IO/fetchArrayBuffer.js';
import cornerstoneTools from 'cornerstone-tools';
import sessionMap from '../../utils/sessionMap';
import getReferencedScan from '../../utils/getReferencedScan';
import { utils } from '@ohif/core';
import { Icon } from '@ohif/ui';
import { Loader } from '../../elements';
import cornerstone from 'cornerstone-core';
import { getEnabledElement } from '../../../../cornerstone/src/state';
import csTools from 'cornerstone-tools';

import '../XNATRoiPanel.styl';
import { generateSegmentationMetadata } from '../../peppermint-tools';
const triggerEvent = csTools.importInternal('util/triggerEvent');

const { studyMetadataManager } = utils;

const segmentationModule = cornerstoneTools.getModule('segmentation');

const _getFirstImageIdFromSeriesInstanceUid = seriesInstanceUid => {
  const studies = studyMetadataManager.all();
  for (let i = 0; i < studies.length; i++) {
    const study = studies[i];
    const displaySets = study.getDisplaySets();

    for (let j = 0; j < displaySets.length; j++) {
      const displaySet = displaySets[j];

      if (displaySet.SeriesInstanceUID === seriesInstanceUid) {
        return displaySet.images[0].getImageId();
      }
    }
  }

  const studyMetadata = studyMetadataManager.get(studyInstanceUid);
  const displaySet = studyMetadata.findDisplaySet(
    displaySet => displaySet.SeriesInstanceUID === seriesInstanceUid
  );
  return displaySet.images[0].getImageId();
};

const overwriteConfirmationContent = {
  title: `Warning`,
  body: `
    Loading in another Segmentation will overwrite existing segmentation data. Are you sure
    you want to do this?
  `,
};

export default class XNATSegmentationImportMenu extends React.Component {
  constructor(props = {}) {
    super(props);

    this._sessions = sessionMap.getSession();
    this._subjectId = sessionMap.getSubject();
    this._projectId = sessionMap.getProject();

    const sessionRoiCollections = {};

    this.state = {
      sessionRoiCollections,
      // sessionSelected,
      importListReady: false,
      importing: false,
      progressText: '',
      importProgress: 0,
    };

    this._cancelablePromises = [];
    // TODO -> Re add NIFTI support. This should really be done in a complete way with cornerstoneNiftiImageLoader
    this._validTypes = ['SEG'];
    this.onImportButtonClick = this.onImportButtonClick.bind(this);
    this.onCloseButtonClick = this.onCloseButtonClick.bind(this);
    this._collectionEligibleForImport = this._collectionEligibleForImport.bind(
      this
    );
    this.onSelectedScanChange = this.onSelectedScanChange.bind(this);
    this.onChangeRadio = this.onChangeRadio.bind(this);

    this._hasExistingMaskData = this._hasExistingMaskData.bind(this);
    this._updateImportingText = this._updateImportingText.bind(this);

    this.updateProgress = this.updateProgress.bind(this);
    this.onSessionSelectedChange = this.onSessionSelectedChange.bind(this);
  }

  onSessionSelectedChange(evt) {
    this.setState({ sessionSelected: evt.target.value });
  }

  updateProgress(percent) {
    this.setState({ importProgress: percent });
  }

  /**
   * onSelectedScanChange - Update the scanSelected state.
   *
   * @param  {Object} evt  The event.
   * @returns {null}
   */
  onSelectedScanChange(evt) {
    const { sessionRoiCollections, sessionSelected } = this.state;
    const currentCollection = sessionRoiCollections[sessionSelected];
    currentCollection.scanSelected = evt.target.value;

    this.setState({ sessionRoiCollections });
  }

  /**
   * onCloseButtonClick - Cancel the import and switch back to the
   * SegmentationMenu view.
   *
   * @returns {null}
   */
  onCloseButtonClick() {
    this.props.onImportCancel();
  }

  /**
   * onChangeRadio - Update the segmentationSelected index on radio input.
   *
   * @param  {Object} evt   The event.
   * @param  {number} index The index of the radio button.
   * @returns {null}
   */
  onChangeRadio(evt, id) {
    const { sessionRoiCollections, sessionSelected } = this.state;
    const currentCollection = sessionRoiCollections[sessionSelected];

    currentCollection.segmentationSelected = id;

    this.setState({ sessionRoiCollections });
  }

  /**
   * async onImportButtonClick - Import the mask after a possible overwrite confirmation.
   *
   * @returns {null}
   */

  writeToCanvas(el) {
    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
    } = segmentationModule.getters.labelmap2D(el);

    console.log({
      labelmap3D,
      segmentationModule,
      SphericaMouseDown: segmentationModule.getters.labelmap2D(el),
    });

    let segmentIndex = labelmap3D.activeSegmentIndex;
    let metadata = labelmap3D.metadata[segmentIndex];

    console.log({ metadata, segmentIndex });

    if (!metadata) {
      metadata = generateSegmentationMetadata('Unnamed Segment');

      segmentIndex = labelmap3D.activeSegmentIndex = 1;

      segmentationModule.setters.metadata(
        el,
        activeLabelmapIndex,
        segmentIndex,
        metadata
      );

      triggerEvent(el, 'peppermintautosegmentgenerationevent', {});
    }
  }

  async onImportButtonClick() {
    this._updateImportingText('');
    this.setState({ importing: true });

    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];

    // setting active viewport reference to element variable
    const element = getEnabledElement(view_ports.indexOf(viewports));
    if (!element) {
      return;
    }

    this.writeToCanvas(element);

    // retrieving cornerstone enable element object
    const enabled_element = cornerstone.getEnabledElement(element);
    if (!enabled_element || !enabled_element.image) {
      return;
    }

    // get current image
    const image = cornerstone.getImage(element);

    cornerstone
      .loadImage(image.imageId)
      .then(image => {
        cornerstone.displayImage(element, image);
        // const RectangleScissorsTool = cornerstoneTools.RectangleScissorsTool;
        // cornerstoneTools.addTool(RectangleScissorsTool);
        // cornerstoneTools.setToolActive('RectangleScissors', {
        //   mouseButtonMask: 1,
        // });
        cornerstone.updateImage(element);
      })
      .then(() => {
        let width = 512;
        let height = 512;
        let channel = 1;

        let pixelData = new Uint8ClampedArray(width * height * channel);
        for (let i = 128; i < 256; i++) {
          for (let j = 256; j < 384; j++) {
            pixelData[i * width + j] = 1;
          }
        }
        const toolState = cornerstoneTools.getToolState(
          element,
          'XNATRectangleScissorsTool'
        );

        console.log({ XnatToolState: toolState });
        if (toolState) {
          toolState.data[0].pixelData = [...pixelData];
          toolState.data[0].invalidated = true;
        } else {
          cornerstoneTools.addToolState(element, 'XNATRectangleScissorsTool', {
            pixelData,
          });
        }

        cornerstone.updateImage(element);
      });
  }

  /**
   * _hasExistingMaskData - Check if we either have an import
   *                        (quicker to check), or we have some data.
   *
   * @returns {boolean}  Whether mask data exists.
   */
  _hasExistingMaskData(firstImageId) {
    if (segmentationModule.getters.importMetadata(firstImageId)) {
      return true;
    }

    const brushStackState = segmentationModule.state.series[firstImageId];

    if (!brushStackState) {
      return false;
    }

    const labelmap3D =
      brushStackState.labelmaps3D[brushStackState.activeLabelmapIndex];

    if (!labelmap3D) {
      return false;
    }

    return labelmap3D.metadata.some(data => data !== undefined);
  }

  /**
   * componentWillUnmount - If any promises are active, cancel them to avoid
   * memory leakage by referencing `this`.
   *
   * @returns {null}
   */
  componentWillUnmount() {
    const cancelablePromises = this._cancelablePromises;

    for (let i = 0; i < cancelablePromises.length; i++) {
      if (typeof cancelablePromises[i].cancel === 'function') {
        cancelablePromises[i].cancel();
      }
    }
  }

  /**
   * componentDidMount - On mounting, fetch a list of available projects from XNAT.
   *
   * @returns {type}  description
   */
  componentDidMount() {}

  /**
   * _updateImportingText - Updates the progressText state.
   *
   * @param  {string} roiCollectionLabel The label of the ROI Collection.
   * @returns {null}
   */
  _updateImportingText(roiCollectionLabel) {
    this.setState({
      progressText: roiCollectionLabel,
    });
  }

  /**
   * async _importRoiCollection - Imports a segmentation.
   *
   * @param  {Object} segmentation The segmentation JSON catalog fetched from XNAT.
   * @returns {null}
   */
  async _importRoiCollection(segmentation) {
    // The URIs fetched have an additional /, so remove it.
    // const getFilesUri = segmentation.getFilesUri.slice(1);

    const roiList = await fetchJSON(segmentation.getFilesUri).promise;
    const result = roiList.ResultSet.Result;

    // Reduce count if no associated file is found (nothing to import, badly deleted roiCollection).
    if (result.length === 0) {
      this.props.onImportCancel();

      return;
    }

    // Retrieve each ROI from the list that has the same collectionType as the collection.
    // In an ideal world this should always be 1, and any other resources -- if any -- are differently formated representations of the same data, but things happen.
    for (let i = 0; i < result.length; i++) {
      const fileType = result[i].collection;
      if (fileType === segmentation.collectionType) {
        this._getAndImportFile(result[i].URI, segmentation);
      }
    }
  }

  /**
   * async _getAndImportFile - Imports the file from the REST url and loads it into
   *                     cornerstoneTools toolData.
   *
   * @param  {string} uri             The REST URI of the file.
   * @param  {object} segmentation    An object describing the roiCollection to
   *                                  import.
   * @returns {null}
   */
  async _getAndImportFile(uri, segmentation) {
    // The URIs fetched have an additional /, so remove it.
    uri = uri.slice(1);

    const seriesInstanceUid = segmentation.referencedSeriesInstanceUid;
    const maskImporter = new MaskImporter(
      seriesInstanceUid,
      this.updateProgress
    );

    const firstImageId = _getFirstImageIdFromSeriesInstanceUid(
      seriesInstanceUid
    );

    switch (segmentation.collectionType) {
      case 'SEG':
        this._updateImportingText(segmentation.name);

        // Store that we've imported a collection for this series.
        segmentationModule.setters.importMetadata(firstImageId, {
          label: segmentation.label,
          type: 'SEG',
          name: segmentation.name,
          modified: false,
        });

        const segArrayBuffer = await fetchArrayBuffer(uri).promise;

        await maskImporter.importDICOMSEG(segArrayBuffer);

        this.props.onImportComplete();
        break;

      case 'NIFTI':
        this._updateImportingText(segmentation.name);

        // Store that we've imported a collection for this series.
        segmentationModule.setters.importMetadata(firstImageId, {
          label: segmentation.label,
          type: 'NIFTI',
          name: segmentation.name,
          modified: false,
        });

        const niftiArrayBuffer = await fetchArrayBuffer(uri).promise;

        maskImporter.importNIFTI(niftiArrayBuffer);
        this.props.onImportComplete();
        break;

      default:
        console.error(
          `MaskImportListDialog._getAndImportFile not configured for filetype: ${fileType}.`
        );
    }
  }

  /**
   * _collectionEligibleForImport - Returns true if the roiCollection references
   * the active series, and hasn't already been imported.
   *
   * @param  {Object} collectionInfoJSON  An object containing information about
   *                                      the collection.
   * @returns {boolean}                    Whether the collection is eligible
   *                                      for import.
   */
  _collectionEligibleForImport(collectionInfoJSON) {
    const item = collectionInfoJSON.items[0];

    const collectionType = item.data_fields.collectionType;

    if (!this._validTypes.some(type => type === collectionType)) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <div className="xnatPanel">
        <div className="panelHeader">
          <h3>Import Mask-Based ROI</h3>

          <button className="small" onClick={this.onCloseButtonClick}>
            <Icon name="xnat-cancel" />
          </button>
        </div>
        <div className="roiCollectionBody limitHeight"></div>
        <div className="roiCollectionFooter">
          <button onClick={this.onImportButtonClick}>
            <Icon name="xnat-import" />
            Import Data
          </button>
        </div>
      </div>
    );
  }
}
