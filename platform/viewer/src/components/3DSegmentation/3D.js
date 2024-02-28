/* eslint-disable no-console */
import React, { useState, useEffect, useRef } from 'react';
import { _3DSegmentationApiClass } from './3DApi';
import Plot from 'react-plotly.js';
import './3d.css';
import { RenderLoadingIcon } from '../../appExtensions/LungModuleSimilarityPanel/SearchParameters/SearchDetails';

const Morphology3DComponent = React.forwardRef((props, ref) => {
  const [currentImage, setCurrentImage] = useState('');
  const [segmentationData, setSegmentationData] = useState(null);
  const [segmentationError, setSegmentationError] = useState('');
  const [loadingApp, setLoadingApp] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [properties, setProperties] = useState([]);
  const [currentProperty, setCurrentProperty] = useState('');
  const [graph, setGraph] = useState(null);
  const [segmentationLabels, setSegmentationLabels] = useState([]);
  const [currentSegmentationLabel, setCurrentSegmentationLabel] = useState('');
  const [seriesUid, setSeriesUid] = useState('');
  const graphRef = useRef(null);

  const [figure, setFigure] = useState({
    data: [],
    layout: {
      aspectmode: 'data',
      paper_bgcolor: '#000',
      font: { color: '#ffffff', size: '14px' },
      width: 1200,
      height: 700,
      scene: {
        aspectmode: 'data',
        xaxis: { title: 'X Axis' },
        yaxis: { title: 'Y Axis' },
        zaxis: { title: 'Z Axis' },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingApp(true);
      const series_uid = JSON.parse(localStorage.getItem('series_uid'));
      setSeriesUid(series_uid);
      await loadSegmentations(series_uid);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateGraph = async () => {
      if (currentSegmentationLabel && seriesUid) {
        setLoadingGraph(true);
        await load3DData(currentSegmentationLabel, seriesUid);
      }
    };
    updateGraph();
  }, [currentSegmentationLabel, seriesUid]);

  useEffect(() => {
    if (segmentationData && currentProperty) {
      try {
        const graph = _3DSegmentationApiClass.decompressSegmentation(
          segmentationData[currentProperty]
        );
        setGraph(graph);
        const data = [graph];
        setFigure(prevState => ({ ...prevState, data }));
        setSegmentationError(null);
        setLoadingGraph(false);
      } catch (error) {}
    }
  }, [segmentationData, currentProperty]);

  const loadSegmentations = async series_uid2 => {
    try {
      const series_uid = '2.25.4245612297026806970528336476469769568';
      const segmentationLabels = await _3DSegmentationApiClass.get3DLabels(
        series_uid
      );
      setSegmentationLabels(segmentationLabels);
      setCurrentSegmentationLabel(segmentationLabels[0]);
      setLoadingApp(false);
      await load3DData(segmentationLabels[0], series_uid);
    } catch (error) {}
  };

  const load3DData = async (label, series_uid2) => {
    try {
      const series_uid = '2.25.4245612297026806970528336476469769568';
      const segmentationData = await _3DSegmentationApiClass.get3DSegmentationData(
        {
          series_uid,
          label,
        }
      );
      const segmentationProperties = Object.keys(segmentationData);
      setProperties(segmentationProperties);
      setCurrentProperty(segmentationProperties[0]); // view first property
      setSegmentationData(segmentationData);
    } catch (error) {
      setSegmentationError(error.message);
      setSegmentationData(null);
    } finally {
      setLoadingGraph(false);
    }
  };

  const changeProperty = property => {
    if (property) {
      setCurrentProperty(property);
    }
  };

  const changeSegmentationLabel = e => {
    const selectedSegmentationLabel = e.target.value;
    setCurrentSegmentationLabel(selectedSegmentationLabel);
  };

  const RenderLoadingModal = () => {
    return (
      <div
        style={{
          width: '100%',
          height: '600px',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // zIndex: 1000,
        }}
      >
        <RenderLoadingIcon size={70} />
        <p
          style={{
            color: 'white',
          }}
        >
          Please Wait..
        </p>
      </div>
    );
  };

  return (
    <section
      style={{
        width: '95vw',
        height: '100%',
        padding: '20px',
        borderRadius: '8px',
        background: '#000000',
      }}
    >
      {loadingApp ? (
        <RenderLoadingModal />
      ) : (
        <>
          <h1
            style={{
              textAlign: 'left',
              margin: 0,
            }}
          >
            3D Morphology
          </h1>

          <div>
            <label htmlFor="segmentationLabel">Segmentation Label: </label>
            <select
              style={{
                padding: '5px 12px',
                borderRadius: '13px',
                fontSize: '15px',
                backgroundColor: 'var(--background-color-mode)',
                color: '#fff',
              }}
              name="segmentationLabel"
              id="segmentationLabel"
              onChange={changeSegmentationLabel}
              value={currentSegmentationLabel}
            >
              {segmentationLabels.map(label => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {segmentationError ? (
            <p>Error: {segmentationError}</p>
          ) : loadingGraph ? (
            // <p>Loading segmentation data...</p>
            <RenderLoadingModal />
          ) : (
            <>
              <div>
                <label htmlFor="property">Property: </label>
                <select
                  style={{
                    padding: '5px 12px',
                    borderRadius: '13px',
                    fontSize: '15px',
                    backgroundColor: 'var(--background-color-mode)',
                    color: '#fff',
                  }}
                  name="property"
                  id="property"
                  onChange={e => changeProperty(e.target.value)}
                  value={currentProperty}
                >
                  {properties.map(property => (
                    <option key={property} value={property}>
                      {property}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Plot
                  data={figure.data}
                  layout={figure.layout}
                  onInitialized={figure => setFigure(figure)}
                  onUpdate={figure => setFigure(figure)}
                  ref={ref}
                />
              </div>

              {currentImage && (
                <div>
                  <img src={currentImage} alt="3D Segmentation" />
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
});

export { Morphology3DComponent };
