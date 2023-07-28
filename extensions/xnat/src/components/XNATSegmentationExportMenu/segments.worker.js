import { flatten } from 'mathjs';
import pako from 'pako';

export const getSplitSegArray = ({ flatSegmentationArray, index }) => {
  console.log('getSplitSegArray', { index, flatSegmentationArray });
  return flatSegmentationArray.map((item, i) => {
    if (item === index) {
      return 1;
    }
    return 0;
  });
};

export const compressSeg = data => {
  console.log('compressSeg', { data });

  var array = new Uint8Array(data);
  console.log({ array });

  const compressed = pako.deflate(array);
  const compStr = Buffer.from(compressed).toString('base64');

  console.log({ compStr, compressed });

  return compStr;
};

export const getSegArray = ({ segmentations, numSlices, rows, columns }) => {
  console.log('getSegArray', {
    segmentations,
    numSlices,
    rows,
    columns,
    str: JSON.stringify(segmentations),
  });
  const flattened = Array(numSlices).fill(Array(rows * columns).fill(0));
  console.log({ flattened });
  segmentations.forEach((item, index) => {
    // console.log({ item, index });

    flattened[index] = Array.from(item.pixelData);
    return;
  });

  console.log({ flattened });

  const mathFlat = flatten(flattened);

  console.log('final', { flattened, mathFlat });
  return mathFlat;
};

const saveSegmentation = async ({
  segmentation,
  shape,
  label,
  email,
  series_uid,
}) => {
  try {
    const url = 'https://dev-radcadapi.thetatech.ai/segmentations';
    const body = {
      series_uid: series_uid,
      email,
      segmentation,
      shape,
      label,
    };

    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, requestOptions); // Replace 'yourUrl' with your actual URL

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

self.addEventListener('message', async event => {
  const data = event.data;

  const segArray = getSegArray({
    segmentations: data.labelmap2D.labelmap3D.labelmaps2D,
    numSlices: data.numSlices,
    rows: data.rows,
    columns: data.columns,
  });

  const asyncSaveSegs = data.segList.map((item, index) => {
    return () =>
      new Promise(async (resolve, reject) => {
        const splitSegArray = getSplitSegArray({
          flatSegmentationArray: segArray,
          index: item.index,
        });

        const compressedSeg = await compressSeg(splitSegArray);

        const response = await saveSegmentation({
          segmentation: compressedSeg,
          label: item.metadata.SegmentLabel,
          shape: data.shape,
          email: data.email,
          series_uid: data.series_uid,
        });

        resolve(response);
      });
  });

  const resList = [];

  for (const fn of asyncSaveSegs) {
    const response = await fn();
    resList.push(response);
  }

  // Send the result back to the main thread
  self.postMessage({
    ['exportation complete']: resList,
  });
});
