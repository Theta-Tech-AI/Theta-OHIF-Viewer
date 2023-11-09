import Pako from 'pako';
import { reshape } from 'mathjs';

const reconstructSegs = ({ arr, rows, cols, slices, isNnunet }) => {
  console.log('reconstructSegs', { arr });
  let reshaped;
  // if (isNnunet) reshaped = reshape(arr, [rows, cols * slices]);
  // else reshaped = reshape(arr, [slices, rows * cols]);
  reshaped = reshape(Array.from(arr), [slices, rows * cols]);

  console.log({ reshaped });
  return reshaped;
};

export const uncompress = ({ segmentation, shape, isNnunet }) => {
  const startTime = performance.now();

  const compressData = atob(segmentation);
  const splitCompressData = compressData.split('').map(function(e) {
    return e.charCodeAt(0);
  });
  const binData = new Uint8Array(splitCompressData);
  const data = Pako.inflate(binData);
  // Removed conversion to Array
  console.log('starting uncompress');
  console.log({
    isNnunet,
    shape,
  });
  console.log(
    'Has Values Greater Than Zeroes',
    data.some((val, index, arr) => val > 0)
  );
  const reconstructed = reconstructSegs({
    arr: data, // Pass Uint8Array directly
    isNnunet,
    ...shape,
  });
  console.log({
    data,
    reconstructed,
  });
  const endTime = performance.now();
  console.log(`Time taken by uncompress: ${(endTime - startTime) / 1000}ms`);

  return reconstructed;
};

export const mergePixelData = ({ currPixelData, item, segmentIndex }) => {
  // console.log('mergePixelData', { currPixelData, item, segmentIndex });
  if (currPixelData) {
    item.map((val, index) => {
      if (val === 1) {
        currPixelData[index] = segmentIndex;
      }
    });

    // console.log({ currPixelData, item });
    return currPixelData;
  } else {
    // console.log('no pixel data... returning imported pixels');
    return item.map((val, index) => {
      if (val === 1) {
        return segmentIndex;
      } else return 0;
    });
  }
};

export const getUpdatedSegments = ({
  segmentation,
  segmentIndex,
  currPixelData,
}) => {
  console.log('getUpdatedSegments', {
    segmentIndex,
    segmentation,
    currPixelData,
  });

  const segmentsOnLabelmap = Array(segmentIndex + 1)
    .fill(0)
    .map((_, index) => {
      // console.log('segmentsOnLabelmap', { index });
      return index;
    });

  return segmentation.map((item, i) => {
    const updatedPixelData = mergePixelData({
      currPixelData: currPixelData[i] ? currPixelData[i].pixelData : false,
      item,
      segmentIndex,
    });
    let uniqueSegments = Array.from(new Set(updatedPixelData));

    return {
      pixelData: updatedPixelData,
      segmentsOnLabelmap,
    };
  });
};

self.addEventListener('message', event => {
  try {
    // Extract the necessary data from the event
    const { segmentations, labelmap3D } = event.data;

    // Replicate the processSegmentations logic here
    const processedSegmentations = processSegmentations(
      segmentations,
      labelmap3D
    );

    // Sending back the processed data:
    self.postMessage({
      status: 'success',
      data: processedSegmentations,
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      message:
        error.message ||
        'Unknown error occurred while processing segmentations.',
    });
  }
});

function processSegmentations(segmentations, labelmap3D) {
  const processedSegmentations = [];
  const total = Object.keys(segmentations).length || 0;

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

    const progress = Math.round(((index + 1) / total) * 100);
    self.postMessage({
      status: 'progress',
      progress: progress,
    });
    processedSegmentations.push({
      label: item,
      uncompressed,
      // updated2dMaps,
    });
  });
  return processedSegmentations;
}

// Other helper functions such as uncompress, getUpdatedSegments etc.
// They can be directly copied from your main code to this worker, ensuring
// that there are no dependencies on libraries or functionalities that can't run inside a Web Worker.
