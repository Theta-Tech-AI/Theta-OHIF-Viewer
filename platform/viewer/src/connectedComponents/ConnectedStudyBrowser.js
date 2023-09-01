import OHIF from '@ohif/core';
import { connect } from 'react-redux';
import findDisplaySetByUID from './findDisplaySetByUID';
import { servicesManager } from './../App.js';
import { StudyBrowser } from '../../../ui/src/components/studyBrowser/StudyBrowser';

const { setActiveViewportSpecificData } = OHIF.redux.actions;

// TODO
// - Determine in which display set is active from Redux (activeViewportIndex and layout viewportData)
// - Pass in errors and stack loading progress from Redux
const mapStateToProps = (state, ownProps) => {
  // If we know that the stack loading progress details have changed,
  // we can try to update the component state so that the thumbnail
  // progress bar is updated

  // console.log('ConnectedStudyBrowser', state, ownProps);

  const stackLoadingProgressMap = state.loading.progress;
  const studiesWithLoadingData = cloneDeep(ownProps.studies);

  // console.log({ series: ownProps.studyMetadata });

  // console.log('OwnProps ', ownProps);
  // const arrayData = [
  //   '1.2.826.0.1.3680043.8.498.10031006246927161484336020711146240912',
  //   '1.2.826.0.1.3680043.8.498.10087421879118072452449276016359906881',
  //   '1.2.826.0.1.3680043.8.498.10119949327043978941194839918912828180',
  // ];

  // if (ownProps.studyMetadata.length > 0) {
  //   const allSeries = ownProps.studyMetadata[0].series;
  //   const newData = arrayData.map(data => {
  //     const filtered = allSeries.filter(series => {
  //       return series.SeriesInstanceUID === data;
  //     });
  //     return filtered;
  //   });
  //   // console.log({ newData });
  // }

  studiesWithLoadingData.forEach(study => {
    study.thumbnails.forEach(data => {
      const { displaySetInstanceUID } = data;
      const stackId = `StackProgress:${displaySetInstanceUID}`;
      const stackProgressData = stackLoadingProgressMap[stackId];

      let stackPercentComplete = 0;
      if (stackProgressData) {
        stackPercentComplete = stackProgressData.percentComplete;
      }

      data.stackPercentComplete = stackPercentComplete;
    });
  });

  // console.log({studiesWithLoadingData});

  return {
    studies: studiesWithLoadingData,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onThumbnailClick: displaySetInstanceUID => {
      localStorage.setItem(
        'active_study',
        JSON.stringify({
          displaySetInstanceUID: displaySetInstanceUID,
        })
      );

      let displaySet = findDisplaySetByUID(
        ownProps.studyMetadata,
        displaySetInstanceUID
      );

      const { LoggerService, UINotificationService } = servicesManager.services;

      if (displaySet.isDerived) {
        const { Modality } = displaySet;
        if (Modality === 'SEG' && servicesManager) {
          const {
            LoggerService,
            UINotificationService,
          } = servicesManager.services;
          const onDisplaySetLoadFailureHandler = error => {
            const message =
              error.message.includes('orthogonal') ||
              error.message.includes('oblique')
                ? 'The segmentation has been detected as non coplanar,\
                If you really think it is coplanar,\
                please adjust the tolerance in the segmentation panel settings (at your own peril!)'
                : error.message;

            LoggerService.error({ error, message });
            UINotificationService.show({
              title: 'DICOM Segmentation Loader',
              message,
              type: 'error',
              autoClose: false,
            });
          };

          const {
            referencedDisplaySet,
            activatedLabelmapPromise,
          } = displaySet.getSourceDisplaySet(
            ownProps.studyMetadata,
            true,
            onDisplaySetLoadFailureHandler
          );
          displaySet = referencedDisplaySet;

          activatedLabelmapPromise.then(activatedLabelmapIndex => {
            const selectionFired = new CustomEvent(
              'extensiondicomsegmentationsegselected',
              {
                detail: { activatedLabelmapIndex: activatedLabelmapIndex },
              }
            );
            document.dispatchEvent(selectionFired);
            document.dispatchEvent(segThumbnailSelected);
          });
        } else {
        // } else if (Modality !== 'SR') {

          displaySet = displaySet.getSourceDisplaySet(ownProps.studyMetadata);
        }

        if (!displaySet) {
          const error = new Error(
            `Referenced series for ${Modality} dataset not present.`
          );
          const message = `Referenced series for ${Modality} dataset not present.`;
          LoggerService.error({ error, message });
          UINotificationService.show({
            autoClose: false,
            title: 'Fail to load series',
            message,
            type: 'error',
          });
        }
      }

      if (!displaySet) {
        const error = new Error('Source data not present');
        const message = 'Source data not present';
        LoggerService.error({ error, message });
        UINotificationService.show({
          autoClose: false,
          title: 'Fail to load series',
          message,
          type: 'error',
        });
      }

      if (displaySet.isSOPClassUIDSupported === false) {
        const error = new Error('Modality not supported');
        const message = 'Modality not supported';
        LoggerService.error({ error, message });
        UINotificationService.show({
          autoClose: false,
          title: 'Fail to load series',
          message,
          type: 'error',
        });
      }

      dispatch(setActiveViewportSpecificData(displaySet));
    },
  };
};

const ConnectedStudyBrowser = connect(
  null,
  mapDispatchToProps
)(StudyBrowser);

export default ConnectedStudyBrowser;
