/* eslint-disable */
import pako from 'pako';
self.addEventListener('message', event => {
  console.log('segments.worker.js:::::addEventListener', event);
  const url = 'https://dev-radcadapi.thetatech.ai/segmentations';
  const options = event.data;
  console.log('segments.worker.js:::::options', options);
  fetch(url, options)
    .then(response => {
      console.log('segments.worker.js:::::response', response);
      return response.json();
    })
    .then(res => {
      console.log('segments.worker.js:::::response', res);
      return self.postMessage(url);
    })
    .catch(console.error);
});
