import { getEnabledElement } from '../state';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

function clip(val, low, high) {
  return Math.min(Math.max(low, val), high);
}

let isNotificationShown = false;
let debounceTimeoutId = null;

function clipToBox(point, box) {
  // Clip an {x, y} point to a box {top, left, width, height}
  const left = box.left || 0;
  const top = box.top || 0;

  point.x = clip(point.x, left, left + box.width);
  point.y = clip(point.y, top, top + box.height);
}

const TriggerAlgorithm = ({ viewports, servicesManager }) => {
  let count = 0;

  // pass all the data here and configure them
  const { UINotificationService } = servicesManager.services;

  // setting active viewport reference to element variable
  const element = getEnabledElement(viewports.activeViewportIndex);
  if (!element) {
    return;
  }

  // Check if there are multiple layers and remove the main one
  const all_layers = cornerstone.getLayers(element);
  if (all_layers.length > 1) {
    cornerstone.removeLayer(element, all_layers[1].layerId);
    cornerstone.updateImage(element);
  }

  const enabled_element = cornerstone.getEnabledElement(element);
  if (!enabled_element || !enabled_element.image) {
    return;
  }

  const tool_data = cornerstoneTools.getToolState(element, 'RectangleRoi');
  const stack = tool_data;

  // Add our tool, and set it's mode
  // if (!stack) {
  cornerstoneTools.setToolActive('RectangleRoi', {
    mouseButtonMask: 1,
  });
  // }
  // Pull event from cornerstone-tools
  const { EVENTS } = cornerstoneTools;

  // Adding event listener to checking when user is done deriving a measurement
  element.addEventListener(EVENTS.MEASUREMENT_COMPLETED, function(e) {
    const event_data = e.detail;

    const toolState =
      cornerstoneTools.globalImageIdSpecificToolStateManager.toolState;
    localStorage.setItem('mask', JSON.stringify(event_data.measurementData));

    if (Object.keys(toolState).length > 0) {
      cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
        {}
      );

      // const store = window.store;
      // store.dispatch({
      //   mask: event_data.measurementData || {},
      //   type: 'SET_SELECTION_MASK',
      // });
      localStorage.setItem(
        'mask',
        JSON.stringify(event_data.measurementData || {})
      );

      cornerstone.updateImage(element);
      cornerstoneTools.addToolState(
        element,
        'RectangleRoi',
        event_data.measurementData
      );
    }
  });

  element.addEventListener(EVENTS.MEASUREMENT_ADDED, event => {
    const toolState =
      cornerstoneTools.globalImageIdSpecificToolStateManager.toolState;

    // Clip the endpoints of the ROI to within the image bounds
    const measurementData = event.detail.measurementData;
    const imageMetaData = cornerstone.metaData.get(
      'imagePlaneModule',
      enabled_element.image.imageId
    );

    const startPoint = measurementData.handles.start;
    const endPoint = measurementData.handles.end;

    // Define bounding box as the image's dimensions
    const boundingBox = {
      left: 0,
      top: 0,
      width: imageMetaData.columns,
      height: imageMetaData.rows,
    };

    // Clip the end point to the box
    clipToBox(endPoint, boundingBox);

    // If the start point is out of bounds, or the end point was clipped (i.e., the ROI extends out of bounds), clear the tool state
    if (
      startPoint.x < 0 ||
      startPoint.y < 0 ||
      startPoint.x > imageMetaData.columns ||
      startPoint.y > imageMetaData.rows ||
      endPoint.x != measurementData.handles.end.x ||
      endPoint.y != measurementData.handles.end.y
    ) {
      if (!isNotificationShown) {
        isNotificationShown = true;
        UINotificationService.show({
          title: 'Out of bounds',
          message: 'The selected ROI is out of the image bounds.',
          type: 'warning',
        });

        // Clear any existing timeout
        if (debounceTimeoutId) {
          clearTimeout(debounceTimeoutId);
        }

        // Reset the notification flag after 1 second
        debounceTimeoutId = setTimeout(() => {
          isNotificationShown = false;
        }, 3000);
      }

      cornerstoneTools.clearToolState(element, 'RectangleRoi');
      return;
    }

    if (Object.keys(toolState).length > 0) {
      if (count === 1) {
        return;
      } else {
        count++;
      }
    }
  });
};

export default TriggerAlgorithm;
