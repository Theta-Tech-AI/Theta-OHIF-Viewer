import React, { Component, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Radiomics.css';
import { withRouter } from 'react-router';
import cornerstoneTools from 'cornerstone-tools';

import OHIF, { MODULE_TYPES, DICOMSR } from '@ohif/core';
import { withDialog } from '@ohif/ui';
import moment from 'moment';
import ConnectedViewerMain from './ConnectedViewerMain.js';
import ErrorBoundaryDialog from './../components/ErrorBoundaryDialog';
import { commandsManager, extensionManager } from './../App.js';
import { ReconstructionIssues } from './../../../core/src/enums.js';
import '../googleCloud/googleCloud.css';
// import Lottie from 'lottie-react';
import cornerstone from 'cornerstone-core';
import * as Plotly from 'plotly.js';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

import './Viewer.css';
import JobsContextUtil from './JobsContextUtil.js';
import { getEnabledElement } from '../../../../extensions/cornerstone/src/state';
import eventBus from '../lib/eventBus';
import { Icon } from '../../../ui/src/elements/Icon';
import { radcadapi } from '../utils/constants';
import { Morphology3DComponent } from '../components/3DSegmentation/3D';
import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfmake.vfs = pdfFonts.pdfMake.vfs;

const exportComponent = node => {
  if (!node.current) {
    throw new Error("'node' must be a RefObject");
  }

  const element = ReactDOM.findDOMNode(node.current);

  return html2canvas(element, {
    scrollY: -window.scrollY,
    allowTaint: true,
    useCORS: true,
  });
};

const generateTemplate = (SimilarScans, ohif_image, chart, chart2) => {
  const contents = [];
  const images = {};
  // add radcad

  contents.push(
    {
      stack: [
        {
          text: 'RadCard Report Summary',
          style: 'header',
        },
      ],
      style: 'header',
      background: 'lightgray',
    },
    {
      alignment: 'left',
      columns: ['Patient Id : ', 'ab123'],
    },
    {
      alignment: 'left',
      columns: ['Classifier : ', 'ResNet -18'],
    },
    {
      alignment: 'left',
      columns: ['Prediction : ', 'Nescrosis'],
    },
    {
      alignment: 'left',
      columns: ['Confidence : ', '81%'],
    }
  );

  contents.push(
    {
      text: 'Collage Radiomics',
      style: 'header',
    },
    {
      image: ohif_image,
      width: 520,
      height: 500,
    }
  );

  contents.push({
    text: 'Similar looking Scans',
    style: 'header',
    pageBreak: 'before',
  });
  images['query'] = SimilarScans.query;

  SimilarScans.knn.forEach((data, index) => {
    const imageIndex = 'img' + index;
    images[imageIndex + 'thumb'] = data.region_thumbnail_url;
    images[imageIndex] = data.image_url;
    const malignant = data.malignant ? ' Yes' : 'No';
    if (index == 0)
      contents.push({
        margin: [0, 10],
        stack: [
          {
            image: 'query',
            fit: [150, 150],
          },
          {
            text: 'Original Query',
            fontsize: 14,
          },
        ],
      });

    contents.push({
      alignment: 'right',
      // pageBreak: 'before',
      columns: [
        {
          alignment: 'left',
          fontSize: 14,
          stack: [
            {
              image: imageIndex + 'thumb',
              fit: [150, 150],
            },
            'Similarity:' + data.similarity_score,
            'Dataset:' + data.dataset,
            'Dataset Id:' + data.data_id,
            'Malignant: ' + malignant,
          ],
        },
        {
          width: 400,
          stack: [
            // {
            //   image: imageIndex,
            //   fit: [300, 300],
            // },
            {
              image: chart[index],
              fit: [300, 300],
              // relativePosition: {
              //   y: -355,
              //   x: -15,
              // },
              // opacity: 0.2,
            },
          ],
        },
      ],
    });
    contents.push({ text: '', margin: [0, 10] });
    if (index % 2 == 0) {
    } else contents.push({ text: '', pageBreak: 'before' });
  });

  // contents.push(
  //   {
  //     text: 'Morphology',
  //     style: 'header',
  //     pageBreak: 'before',
  //   },
  //   {
  //     image: chart2,
  //     fit: [518, 500],
  //   }
  // );

  return {
    content: contents,
    defaultStyle: {
      fontSize: 14,
    },
    styles: {
      header: {
        background: 'lightgray',
        fontSize: 28,
        bold: true,
        margin: [0, 20],
      },
      normal: {
        fontSize: 22,
      },
    },
    images,
  };
};

const RadiomicSummary = props => {
  useEffect(() => {
    localStorage.setItem(
      'summary',
      JSON.stringify({
        name: 'sadsad',
        name2: 'sadsad',
        name3: 'sadsad',
      })
    );
  }, []);

  return (
    <div
      style={{
        width: '100%',
        background: '#000000',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div
        style={{
          paddingBottom: '40px',
        }}
      >
        <h1
          style={{
            textAlign: 'left',
            margin: 0,
          }}
        >
          RadCard Report Summary
        </h1>
      </div>

      <div
        style={{
          height: '100%',
          flex: 1,
        }}
      >
        <div
          className=""
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Patient ID :{' '}
          </h2>
          <h2>abc123 </h2>
        </div>
        <div
          className=""
          style={{
            display: 'flex',
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Classifier:{' '}
          </h2>
          <h2>Resnet-18 </h2>
        </div>

        <div
          className=""
          style={{
            display: 'flex',
            marginTop: 12,
            flexDirection: 'row',
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Prediction:{' '}
          </h2>
          <h2>Necrosis</h2>
        </div>

        <div
          className=""
          style={{
            display: 'flex',
            flexDirection: 'row',
            marginTop: 12,
            justifyContent: 'flex-start',
          }}
        >
          <h2
            className="cad"
            style={{
              color: '#00c7ee',
            }}
          >
            Confidence:{' '}
          </h2>
          <h2>81%</h2>
        </div>

        <div
          className=""
          style={{
            marginTop: 12,
          }}
        >
          <button
            onClick={props.triggerDownload}
            // style={{
            //   marginTop: '20px',
            //   border: '1px yellow solid',
            //   fontSize: '24px',
            //   background: 'black',
            //   color: 'white',
            //   padding: '12px',
            // }}
            className="btn btn-primary btn-large"
          >
            Print To PDF
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
        }}
      ></div>
    </div>
  );
};

class Radiomics extends Component {
  static propTypes = {
    studies: PropTypes.arrayOf(
      PropTypes.shape({
        StudyInstanceUID: PropTypes.string.isRequired,
        StudyDate: PropTypes.string,
        PatientID: PropTypes.string,
        displaySets: PropTypes.arrayOf(
          PropTypes.shape({
            displaySetInstanceUID: PropTypes.string.isRequired,
            SeriesDescription: PropTypes.string,
            SeriesNumber: PropTypes.number,
            InstanceNumber: PropTypes.number,
            numImageFrames: PropTypes.number,
            Modality: PropTypes.string.isRequired,
            images: PropTypes.arrayOf(
              PropTypes.shape({
                getImageId: PropTypes.func.isRequired,
              })
            ),
          })
        ),
      })
    ),
    studyInstanceUIDs: PropTypes.array,
    activeServer: PropTypes.shape({
      type: PropTypes.string,
      wadoRoot: PropTypes.string,
    }),
    onTimepointsUpdated: PropTypes.func,
    onMeasurementsUpdated: PropTypes.func,
    // window.store.getState().viewports.viewportSpecificData
    viewports: PropTypes.object.isRequired,
    // window.store.getState().viewports.activeViewportIndex
    activeViewportIndex: PropTypes.number.isRequired,
    isStudyLoaded: PropTypes.bool,
    dialog: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      showSegments: true,
      isLeftSidePanelOpen: false,
      selectedLeftSidePanel: '', // TODO: Don't hardcode this
      isRightSidePanelOpen: false,
      selectedRightSidePanel: '',
      selectedExtraPanel: '',
      // selectedRightSidePanel: 'xnat-segmentation-panel',
      thumbnails: [],
      imageRefs: [],
      similarityResultState: {},
      isEditSelection: true,
    };

    this.canvas = React.createRef(null);
    this.chartRef = React.createRef(null);
    this.componentRef = React.createRef();
    this.componentRefNode = React.createRef();
    this.imageRefs = [];
    const { activeServer } = this.props;
    const server = Object.assign({}, activeServer);

    OHIF.measurements.MeasurementApi.setConfiguration({
      dataExchange: {
        retrieve: DICOMSR.retrieveMeasurements,
        store: DICOMSR.storeMeasurements,
      },
      server,
    });

    OHIF.measurements.TimepointApi.setConfiguration({
      dataExchange: {
        retrieve: this.retrieveTimepoints,
        store: this.storeTimepoints,
        remove: this.removeTimepoint,
        update: this.updateTimepoint,
        disassociate: this.disassociateStudy,
      },
    });

    this._getActiveViewport = this._getActiveViewport.bind(this);
    this.fetchSeriesRef = false;
    this.source_series_ref = [];

    // this.canvas = this.canvas.bind(this);
    // this.componentRef = this.componentRef.bind(this);
  }

  loadLastActiveStudy() {
    // let active_study = JSON.parse(localStorage.getItem('active_study'));

    if (this.state.thumbnails[0].thumbnails[1].displaySetInstanceUID)
      this.props.onThumbnailClick(
        this.state.thumbnails[0].thumbnails[1].displaySetInstanceUID,
        this.props.studies
      );
  }

  onCornerstageLoaded = enabledEvt => {
    setTimeout(() => {
      const enabledElement = enabledEvt.detail.element;

      commandsManager.runCommand('setToolActive', {
        toolName: 'Pan',
      });

      let tool_data = localStorage.getItem(this.props.studyInstanceUID);
      tool_data =
        tool_data && tool_data !== 'undefined' ? JSON.parse(tool_data) : {};
      if (enabledElement && tool_data) {
        let viewport = cornerstone.getViewport(enabledElement);
        if (tool_data.x) viewport.translation.x = tool_data.x;
        if (tool_data.y) viewport.translation.y = tool_data.y;
        if (tool_data.scale) viewport.scale = tool_data.scale;
        if (tool_data.voi) viewport.voi = tool_data.voi;
        cornerstone.setViewport(enabledElement, viewport);
      }

      this.handleSidePanelChange('right', 'theta-details-panel');
      this.handleSidePanelChange('left', 'lung-module-similarity-panel');

      //  handle radiomicsDone
      const radiomicsDone = JSON.parse(
        localStorage.getItem('radiomicsDone') || 0
      );
      this.setState({
        isComplete: radiomicsDone == 1 ? true : false,
      });
      this.triggerReload();
    }, 5000);
    setTimeout(() => {
      let similarityResultState = JSON.parse(
        localStorage.getItem('print-similarscans') || { knn: [] }
      );
      similarityResultState = similarityResultState[0];

      console.log({ similarityResultState });
      this.setState({
        similarityResultState,
      });
    }, 10000);
  };

  componentWillUnmount() {
    if (this.props.dialog) {
      this.props.dialog.dismissAll();
    }
    const view_ports = cornerstone.getEnabledElements();
    const viewports = view_ports[0];
    const element = getEnabledElement(view_ports.indexOf(viewports));
    if (element)
      cornerstoneTools.globalImageIdSpecificToolStateManager.clear(element);

    cornerstone.events.removeEventListener(
      cornerstone.EVENTS.ELEMENT_ENABLED,
      this.onCornerstageLoaded
    );
  }

  retrieveTimepoints = filter => {
    OHIF.log.info('retrieveTimepoints');

    // Get the earliest and latest study date
    let earliestDate = new Date().toISOString();
    let latestDate = new Date().toISOString();
    if (this.props.studies) {
      latestDate = new Date('1000-01-01').toISOString();
      this.props.studies.forEach(study => {
        const StudyDate = moment(study.StudyDate, 'YYYYMMDD').toISOString();
        if (StudyDate < earliestDate) {
          earliestDate = StudyDate;
        }
        if (StudyDate > latestDate) {
          latestDate = StudyDate;
        }
      });
    }

    // Return a generic timepoint
    return Promise.resolve([
      {
        timepointType: 'baseline',
        timepointId: 'TimepointId',
        studyInstanceUIDs: this.props.studyInstanceUIDs,
        PatientID: filter.PatientID,
        earliestDate,
        latestDate,
        isLocked: false,
      },
    ]);
  };

  storeTimepoints = timepointData => {
    OHIF.log.info('storeTimepoints');
    return Promise.resolve();
  };

  updateTimepoint = (timepointData, query) => {
    OHIF.log.info('updateTimepoint');
    return Promise.resolve();
  };

  removeTimepoint = timepointId => {
    OHIF.log.info('removeTimepoint');
    return Promise.resolve();
  };

  disassociateStudy = (timepointIds, StudyInstanceUID) => {
    OHIF.log.info('disassociateStudy');
    return Promise.resolve();
  };

  onTimepointsUpdated = timepoints => {
    if (this.props.onTimepointsUpdated) {
      this.props.onTimepointsUpdated(timepoints);
    }
  };

  onMeasurementsUpdated = measurements => {
    if (this.props.onMeasurementsUpdated) {
      this.props.onMeasurementsUpdated(measurements);
    }
  };

  componentDidMount() {
    const { studies, isStudyLoaded, ...rest } = this.props;
    const { TimepointApi, MeasurementApi } = OHIF.measurements;
    const currentTimepointId = 'TimepointId';

    this.handleFetchAndSetSeries(rest.studyInstanceUIDs[0]);

    const timepointApi = new TimepointApi(currentTimepointId, {
      onTimepointsUpdated: this.onTimepointsUpdated,
    });

    const measurementApi = new MeasurementApi(timepointApi, {
      onMeasurementsUpdated: this.onMeasurementsUpdated,
    });

    this.currentTimepointId = currentTimepointId;
    this.timepointApi = timepointApi;
    this.measurementApi = measurementApi;

    if (studies) {
      const PatientID = studies[0] && studies[0].PatientID;

      timepointApi.retrieveTimepoints({ PatientID });
      if (isStudyLoaded) {
        this.measurementApi.retrieveMeasurements(PatientID, [
          currentTimepointId,
        ]);
      }

      const activeViewport = this.props.viewports[
        this.props.activeViewportIndex
      ];
      const activeDisplaySetInstanceUID = activeViewport
        ? activeViewport.displaySetInstanceUID
        : undefined;

      this.setState({
        thumbnails: _mapStudiesToThumbnails(
          studies,
          activeDisplaySetInstanceUID
        ),
      });
    }

    cornerstone.events.addEventListener(
      cornerstone.EVENTS.ELEMENT_ENABLED,
      this.onCornerstageLoaded
    );
  }

  async handleFetchAndSetSeries(studyInstanceUID) {
    const fetchedSeries = await (async () => {
      try {
        var requestOptions = {
          method: 'GET',
          redirect: 'follow',
        };

        const response = await fetch(
          `${radcadapi}/series?study=${studyInstanceUID}`,
          requestOptions
        );
        const result = await response.json();
        return result.series;
      } catch (error) {
        console.log('fetcheSeries caught', { error });
        return [];
      }
    })();
    this.fetchSeriesRef = false;
    this.source_series_ref = fetchedSeries;
    this.setState({
      loading: false,
      series: fetchedSeries,
    });
  }

  triggerReload() {
    setTimeout(() => {
      try {
        document.getElementById('trigger').click();
      } catch (error) {}
    }, 5000);
    // if (window && window.parent) {
    //   window.parent.postMessage(
    //     {
    //       action: 'triggerExternalReload',
    //     },
    //     '*'
    //   );
    // }
  }

  handleBack = () => {
    const location = this.props.location;
    const pathname = location.pathname.replace('radionics', 'studylist');
    this.props.history.push(pathname);
  };

  componentDidUpdate(prevProps, prevState) {
    const {
      studies,
      isStudyLoaded,
      activeViewportIndex,
      viewports,
    } = this.props;

    const activeViewport = viewports[activeViewportIndex];
    const activeDisplaySetInstanceUID = activeViewport
      ? activeViewport.displaySetInstanceUID
      : undefined;

    const prevActiveViewport =
      prevProps.viewports[prevProps.activeViewportIndex];
    const prevActiveDisplaySetInstanceUID = prevActiveViewport
      ? prevActiveViewport.displaySetInstanceUID
      : undefined;

    if (
      studies !== prevProps.studies ||
      activeViewportIndex !== prevProps.activeViewportIndex ||
      activeDisplaySetInstanceUID !== prevActiveDisplaySetInstanceUID
    ) {
      this.setState({
        thumbnails: _mapStudiesToThumbnails(
          studies,
          activeDisplaySetInstanceUID
        ),
      });
      // if (activeDisplaySetInstanceUID)
    }
    if (isStudyLoaded && isStudyLoaded !== prevProps.isStudyLoaded) {
      const view_ports = cornerstone.getEnabledElements();
      const viewports = view_ports[0];

      const PatientID = studies[0] && studies[0].PatientID;
      const { currentTimepointId } = this;

      this.timepointApi.retrieveTimepoints({ PatientID });
      this.measurementApi.retrieveMeasurements(PatientID, [currentTimepointId]);
    }
  }

  _getActiveViewport() {
    return this.props.viewports[this.props.activeViewportIndex];
  }

  handleSidePanelChange = (side, selectedPanel) => {
    const sideClicked = side && side[0].toUpperCase() + side.slice(1);
    const openKey = `is${sideClicked}SidePanelOpen`;
    const selectedKey = `selected${sideClicked}SidePanel`;
    const updatedState = Object.assign({}, this.state);

    const isOpen = updatedState[openKey];
    const prevSelectedPanel = updatedState[selectedKey];
    // RoundedButtonGroup returns `null` if selected button is clicked
    const isSameSelectedPanel =
      prevSelectedPanel === selectedPanel || selectedPanel === null;

    updatedState[selectedKey] = selectedPanel || prevSelectedPanel;

    const isClosedOrShouldClose = !isOpen || isSameSelectedPanel;
    if (isClosedOrShouldClose) {
      updatedState[openKey] = !updatedState[openKey];
    }

    this.setState(updatedState);
  };

  downloadReportAsPdf = () => {
    const base64 = [];
    const promises = [];
    let chart = null;
    let ohif_image = null;

    let similarityResultState = JSON.parse(
      localStorage.getItem('print-similarscans') || { knn: [] }
    );
    similarityResultState = similarityResultState[0];

    for (let i = 0; i < similarityResultState.knn.length; i++) {
      const imageElement = this.imageRefs[i];
      promises.push(exportComponent(imageElement));
    }
    // grpah

    // const customScene = this.componentRef.current.graphRef.current.el.layout
    //   .scene;

    // const plotDiv = this.componentRef.current.graphRef.current.el;
    // const { graphDiv } = plotDiv._fullLayout.scene._scene;
    // console.log(this.componentRef.current.graphRef.current);
    // const divToDownload = {
    //   ...graphDiv,
    //   layout: { ...graphDiv.layout, scene: customScene },
    // };
    // end of grah

    Promise.all(promises)
      .then(data => {
        data.forEach(element => {
          base64.push(element.toDataURL());
        });

        return Promise.all([
          exportComponent(this.canvas),
          //   Plotly.toImage(divToDownload, {
          //     format: 'png',
          //     width: 800,
          //     height: 600,
          //   }),
        ]);
      })
      .then(data => {
        const canvas = data[0];

        // const gsdsad = data[1];
        // ohif_image = 'data:image/png;base64,' + canvas.toDataURL();

        const SimilarScans = JSON.parse(
          localStorage.getItem('print-similarscans') || '{}'
        );

        const definition = generateTemplate(
          SimilarScans[0],
          canvas.toDataURL(),
          base64
          // gsdsad
        );
        pdfmake.createPdf(definition).download();
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    // if (this.state.loading) {
    //   return (
    //     <div
    //       style={{
    //         width: '100vw',
    //         height: '100vh',
    //         display: 'flex',
    //         justifyContent: 'center',
    //         alignItems: 'center',
    //       }}
    //     >
    //       <p style={{ color: 'white', fontSize: '40px' }}>Loading...</p>
    //     </div>
    //   );
    // }

    let SimilarScans, CollageView, extraPanel;
    const panelExtensions = extensionManager.modules[MODULE_TYPES.PANEL];

    panelExtensions.forEach(panelExt => {
      panelExt.module.components.forEach(comp => {
        if (comp.id === this.state.selectedRightSidePanel) {
          CollageView = comp.component;
        } else if (comp.id === this.state.selectedLeftSidePanel) {
          SimilarScans = comp.component;
        }
      });
    });

    const text = '';
    let similarityResultState = JSON.parse(
      localStorage.getItem('print-similarscans') || { knn: [] }
    );

    similarityResultState = similarityResultState[0];

    if (similarityResultState && similarityResultState.knn) {
    } else similarityResultState = { knn: [] };

    // const imageRefs = [];

    return (
      <div style={{}}>
        <JobsContextUtil
          series={
            this.props.studies && this.props.studies.length > 0
              ? this.props.studies[0].series
              : { k: [] }
          }
          overlay={false}
          instance={text}
        />
        {/* <div
          style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            display: this.state.isComplete ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p style={{ color: 'white', fontSize: '40px' }}>Loading...</p>
        </div> */}
        <div
          className="printView"
          // ref={canvas => (this.canvas = canvas)}
          // ref={el => (this.componentRefNode = el)}
          style={{
            paddingBottom: 140,
            // display: this.state.isComplete ? 'block' : 'none',
          }}
        >
          <div className="container">
            <div className="container-item">
              <button className="btn btn-danger" onClick={this.handleBack}>
                Back to Studylist
              </button>
            </div>
          </div>
          <div className="container">
            <div className="container-item">
              <RadiomicSummary triggerDownload={this.downloadReportAsPdf} />
              {/* RIGHT */}
              <div
                style={{
                  marginTop: '20px',
                  width: '100%',
                  borderRadius: '8px',
                  background: '#000000',
                  padding: '20px',
                }}
              >
                <div>
                  <h1
                    style={{
                      textAlign: 'left',
                      margin: 0,
                    }}
                  >
                    Similarity Looking Scans
                  </h1>
                </div>

                <ErrorBoundaryDialog context="RightSidePanel">
                  <div>
                    {SimilarScans && (
                      <SimilarScans
                        isOpen={true}
                        viewports={this.props.viewports}
                        studies={this.props.studies}
                        activeIndex={this.props.activeViewportIndex}
                        activeViewport={
                          this.props.viewports[this.props.activeViewportIndex]
                        }
                        getActiveViewport={this._getActiveViewport}
                      />
                    )}
                  </div>
                </ErrorBoundaryDialog>
              </div>
            </div>
            <div className="container-item-extra">
              {/* VIEWPORTS + SIDEPANELS */}
              <div
                style={{
                  width: '100%',
                  background: '#000000',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <div>
                  <h1
                    style={{
                      textAlign: 'left',
                      margin: 0,
                    }}
                  >
                    Collage
                  </h1>
                </div>

                {/* MAIN */}
                <div className="container">
                  <div className="container-item-extra">
                    <div
                      className={classNames('main-content')}
                      ref={this.canvas}
                    >
                      <ErrorBoundaryDialog context="ViewerMain">
                        <ConnectedViewerMain
                          studies={_removeUnwantedSeries(
                            this.props.studies,
                            this.source_series_ref
                          )}
                          isStudyLoaded={this.props.isStudyLoaded}
                        />
                      </ErrorBoundaryDialog>

                      <div></div>
                    </div>
                  </div>

                  <div className="container-item">
                    <ErrorBoundaryDialog context="RightSidePanel">
                      <div>
                        {CollageView && (
                          <CollageView
                            isOpen={true}
                            viewports={this.props.viewports}
                            studies={this.props.studies}
                            activeIndex={this.props.activeViewportIndex}
                            activeViewport={
                              this.props.viewports[
                                this.props.activeViewportIndex
                              ]
                            }
                            getActiveViewport={this._getActiveViewport}
                          />
                        )}
                      </div>
                    </ErrorBoundaryDialog>{' '}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="container-item">
              <Morphology3DComponent
                chartRef={this.chartRef}
                ref={this.componentRef}
              />
            </div>
          </div>

          <div className="container">
            <div
              id="resetrow"
              style={{
                width: '100%',
                display: 'flex',
                // flexDirection: 'column',
                flexWrap: 'wrap',
                marginTop: '700',
              }}
            >
              {similarityResultState.knn.map((data, index) => {
                this.imageRefs[index] = React.createRef();
                return (
                  <>
                    <div
                      ref={this.imageRefs[index]}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 500,
                          height: 500,
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: data.region_rectangle.x,
                            top: data.region_rectangle.y,
                            width: data.region_rectangle.w,
                            height: data.region_rectangle.h,
                            border: data.malignant
                              ? '3px solid red'
                              : '3px solid blue',
                          }}
                        />
                        <img
                          crossOrigin="anonymous"
                          src={data.image_url}
                          style={{
                            flex: 1,
                            marginBottom: 20,
                          }}
                        />
                      </div>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>

        {/*<ConnectedStudyLoadingMonitor studies={this.props.studies} />*/}
        {/*<StudyPrefetcher studies={this.props.studies} />*/}

        {/* VIEWPORTS + SIDEPANELS */}
        <div className="FlexboxLayout">{/* LEFT */}</div>
      </div>
    );
  }
}

export default withRouter(withDialog(Radiomics));

/**
 * Async function to check if there are any inconsistences in the series.
 *
 * For segmentation checks that the geometry is consistent with the source images:
 * 1) no frames out of plane;
 * 2) have the same width and height.
 *
 * For reconstructable 3D volume:
 * 1) Is series multiframe?
 * 2) Do the frames have different dimensions/number of components/orientations?
 * 3) Has the series any missing frames or irregular spacing?
 * 4) Is the series 4D?
 *
 * If not reconstructable, MPR is disabled.
 * The actual computations are done in isDisplaySetReconstructable.
 *
 * @param {*object} displaySet
 * @returns {[string]} an array of strings containing the warnings
 */
const _checkForSeriesInconsistencesWarnings = async function(
  displaySet,
  studies
) {
  if (displaySet.inconsistencyWarnings) {
    // warnings already checked and cached in displaySet
    return displaySet.inconsistencyWarnings;
  }
  const inconsistencyWarnings = [];

  if (displaySet.Modality !== 'SEG') {
    if (
      displaySet.reconstructionIssues &&
      displaySet.reconstructionIssues.length !== 0
    ) {
      displaySet.reconstructionIssues.forEach(warning => {
        switch (warning) {
          case ReconstructionIssues.DATASET_4D:
            inconsistencyWarnings.push('The dataset is 4D.');
            break;
          case ReconstructionIssues.VARYING_IMAGESDIMENSIONS:
            inconsistencyWarnings.push(
              'The dataset frames have different dimensions (rows, columns).'
            );
            break;
          case ReconstructionIssues.VARYING_IMAGESCOMPONENTS:
            inconsistencyWarnings.push(
              'The dataset frames have different components (Sample per pixel).'
            );
            break;
          case ReconstructionIssues.VARYING_IMAGESORIENTATION:
            inconsistencyWarnings.push(
              'The dataset frames have different orientation.'
            );
            break;
          case ReconstructionIssues.IRREGULAR_SPACING:
            inconsistencyWarnings.push(
              'The dataset frames have different pixel spacing.'
            );
            break;
          case ReconstructionIssues.MULTIFFRAMES:
            inconsistencyWarnings.push('The dataset is a multiframes.');
            break;
          default:
            break;
        }
      });
      inconsistencyWarnings.push(
        'The datasets is not a reconstructable 3D volume. MPR mode is not available.'
      );
    }

    if (
      displaySet.missingFrames &&
      (!displaySet.reconstructionIssues ||
        (displaySet.reconstructionIssues &&
          !displaySet.reconstructionIssues.find(
            warn => warn === ReconstructionIssues.DATASET_4D
          )))
    ) {
      inconsistencyWarnings.push(
        'The datasets is missing frames: ' + displaySet.missingFrames + '.'
      );
    }
  } else {
    const segMetadata = displaySet.metadata;
    if (!segMetadata) {
      displaySet.inconsistencyWarnings = inconsistencyWarnings;
      return inconsistencyWarnings;
    }

    const { referencedDisplaySet } = displaySet.getSourceDisplaySet(
      studies,
      false
    );
    if (!referencedDisplaySet) {
      displaySet.inconsistencyWarnings = inconsistencyWarnings;
      return inconsistencyWarnings;
    }

    const imageIds = referencedDisplaySet.images.map(image =>
      image.getImageId()
    );
    if (!imageIds || imageIds.length === 0) {
      displaySet.inconsistencyWarnings = inconsistencyWarnings;
      return inconsistencyWarnings;
    }

    for (
      let i = 0,
        groupsLen = segMetadata.PerFrameFunctionalGroupsSequence.length;
      i < groupsLen;
      ++i
    ) {
      const PerFrameFunctionalGroups =
        segMetadata.PerFrameFunctionalGroupsSequence[i];
      if (!PerFrameFunctionalGroups) {
        continue;
      }

      let SourceImageSequence = undefined;
      if (segMetadata.SourceImageSequence) {
        SourceImageSequence = segMetadata.SourceImageSequence[i];
      } else if (PerFrameFunctionalGroups.DerivationImageSequence) {
        SourceImageSequence =
          PerFrameFunctionalGroups.DerivationImageSequence.SourceImageSequence;
      }
      if (!SourceImageSequence) {
        if (inconsistencyWarnings.length === 0) {
          const warningMessage =
            'The segmentation ' +
            'has frames out of plane respect to the source images.';
          inconsistencyWarnings.push(warningMessage);
        }
        continue;
      }

      const { ReferencedSOPInstanceUID } = SourceImageSequence;

      const imageId = imageIds.find(imageId => {
        const sopCommonModule = cornerstone.metaData.get(
          'sopCommonModule',
          imageId
        );
        if (!sopCommonModule) {
          return;
        }

        return sopCommonModule.sopInstanceUID === ReferencedSOPInstanceUID;
      });

      if (!imageId) {
        continue;
      }

      const sourceImageMetadata = cornerstone.metaData.get('instance', imageId);
      if (
        segMetadata.Rows !== sourceImageMetadata.Rows ||
        segMetadata.Columns !== sourceImageMetadata.Columns
      ) {
        const warningMessage =
          'The segmentation ' +
          'has frames with different geometry ' +
          'dimensions (Rows and Columns) respect to the source images.';
        inconsistencyWarnings.push(warningMessage);
        break;
      }
    }

    if (inconsistencyWarnings.length !== 0) {
      const warningMessage =
        'The segmentation format is not supported yet. ' +
        'The segmentation data (segments) could not be loaded.';
      inconsistencyWarnings.push(warningMessage);
    }
  }

  // cache the warnings
  displaySet.inconsistencyWarnings = inconsistencyWarnings;
  return inconsistencyWarnings;
};

/**
 * Checks if display set is active, i.e. if the series is currently shown
 * in the active viewport.
 *
 * For data display set, this functions checks if the active
 * display set instance uid in the current active viewport is the same of the
 * thumbnail one.
 *
 * For derived modalities (e.g., SEG and RTSTRUCT), the function gets the
 * reference display set and then checks the reference uid with the active
 * display set instance uid.
 *
 * @param {displaySet} displaySet
 * @param {Study[]} studies
 * @param {string} activeDisplaySetInstanceUID
 * @returns {boolean} is active.
 */
const _isDisplaySetActive = function(
  displaySet,
  studies,
  activeDisplaySetInstanceUID
) {
  let active = false;

  const { displaySetInstanceUID } = displaySet;

  // TO DO: in the future, we could possibly support new modalities
  // we should have a list of all modalities here, instead of having hard coded checks
  if (
    displaySet.Modality !== 'SEG' &&
    displaySet.Modality !== 'RTSTRUCT' &&
    displaySet.Modality !== 'RTDOSE'
  ) {
    active = activeDisplaySetInstanceUID === displaySetInstanceUID;
  } else if (displaySet.getSourceDisplaySet) {
    if (displaySet.Modality === 'SEG') {
      const { referencedDisplaySet } = displaySet.getSourceDisplaySet(
        studies,
        false
      );
      active = referencedDisplaySet
        ? activeDisplaySetInstanceUID ===
          referencedDisplaySet.displaySetInstanceUID
        : false;
    } else {
      const referencedDisplaySet = displaySet.getSourceDisplaySet(
        studies,
        false
      );
      active = referencedDisplaySet
        ? activeDisplaySetInstanceUID ===
          referencedDisplaySet.displaySetInstanceUID
        : false;
    }
  }

  return active;
};

/**
 * What types are these? Why do we have "mapping" dropped in here instead of in
 * a mapping layer?
 *
 * TODO[react]:
 * - Add showStackLoadingProgressBar option
 *
 * @param {Study[]} studies
 * @param {string} activeDisplaySetInstanceUID
 */
const _mapStudiesToThumbnails = function(studies, activeDisplaySetInstanceUID) {
  return studies.map(study => {
    const { StudyInstanceUID } = study;
    const thumbnails = study.displaySets.map(displaySet => {
      const {
        displaySetInstanceUID,
        SeriesDescription,
        InstanceNumber,
        numImageFrames,
        SeriesNumber,
      } = displaySet;

      let imageId;
      let altImageText;

      if (displaySet.Modality && displaySet.Modality === 'SEG') {
        // TODO: We want to replace this with a thumbnail showing
        // the segmentation map on the image, but this is easier
        // and better than what we have right now.
        altImageText = 'SEG';
      } else if (displaySet.images && displaySet.images.length) {
        const imageIndex = Math.floor(displaySet.images.length / 2);
        imageId = displaySet.images[imageIndex].getImageId();
      } else {
        altImageText = displaySet.Modality ? displaySet.Modality : 'UN';
      }

      const hasWarnings = _checkForSeriesInconsistencesWarnings(
        displaySet,
        studies
      );
      const active = _isDisplaySetActive(
        displaySet,
        studies,
        activeDisplaySetInstanceUID
      );

      return {
        active,
        imageId,
        altImageText,
        displaySetInstanceUID,
        SeriesDescription,
        InstanceNumber,
        numImageFrames,
        SeriesNumber,
        hasWarnings,
      };
    });

    return {
      StudyInstanceUID,
      thumbnails,
    };
  });
};

const _removeUnwantedSeries = function(studies, source_series) {
  const allData = studies;

  const filteredDatasets = [];

  // const source_series = [
  // '1.3.6.1.4.1.14519.5.2.1.6450.4012.137394205856739469389144102217',
  // ];

  if (allData.length > 0) {
    // filtering through the displaySets for source data (same can be done for the series)
    allData[0].displaySets.filter(data => {
      source_series.filter(seriesUID => {
        // console.log({ seriesUID, dataSeries: data.SeriesInstanceUID });
        if (data.SeriesInstanceUID === seriesUID) {
          // console.log({ Found: 'Found series!!!' });
          filteredDatasets.push(data);
        }
      });
    });

    // remapping the data to have the filtered displaySets
    allData.map(data => {
      data.displaySets = filteredDatasets;
    });
  }

  return allData;
};
