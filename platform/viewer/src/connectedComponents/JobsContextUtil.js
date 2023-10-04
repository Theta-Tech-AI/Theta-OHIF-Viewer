import React, { useContext, useEffect } from 'react';
import { JobsContext } from '../context/JobsContext';
import { setItem } from '../lib/localStorageUtils';

export default function JobsContextUtil({
  series,
  overlay,
  instance,
  isLoading = false,
}) {
  const { allSeriesState, setSeries } = useContext(JobsContext);
  const { overlayStatus, setOverlayStatus } = useContext(JobsContext);
  const { isInstance, setIsInstance } = useContext(JobsContext);
  const { setLoading } = useContext(JobsContext);
  // const { opacityStatus, setOpacityStatus } = useContext(JobsContext);
  // const { colorMapStatus, setColorMapStatus } = useContext(JobsContext);

  useEffect(() => {
    setSeries(series);

    try {
      let modalities = {};
      let requiredModalities = ['FLAIR', 'T1CE', 'T2',"T1"];

      let modalityMapping = {
        T1CE: 'T1-Contrast',
      };
      series.forEach(item => {
        if (requiredModalities.includes(item.Modality)) {
          let modality = item.Modality;
          // Check if a mapping exists for the modality and use it if it does
          if (modalityMapping.hasOwnProperty(modality)) {
            modality = modalityMapping[modality];
          }
          modalities[modality] = item.SeriesInstanceUID;
        }
      });
      setItem('parameters', { modalities: modalities });
    } catch (error) {}
  }, [series]);

  useEffect(() => {
    setOverlayStatus(overlay);
  }, [overlay]);

  useEffect(() => {
    setIsInstance(instance);
  }, [instance]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // useEffect(() => {
  //   setOpacityStatus(opacity);
  // }, [opacity]);

  // useEffect(() => {
  //   setColorMapStatus(colormap);
  // }, [colormap]);

  return null;
}
