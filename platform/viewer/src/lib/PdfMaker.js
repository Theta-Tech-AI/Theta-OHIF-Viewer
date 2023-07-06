import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { getItem } from './localStorageUtils';
pdfmake.vfs = pdfFonts.pdfMake.vfs;

function getMalignantScore(data) {
  const knnLength = data.knn.length;
  const malignantCount = data.knn.filter(item => item.malignant).length;
  return malignantCount + '/' + knnLength;
}

function createSimilarScansSection(
  similarity,
  dataset,
  datasetId,
  malignant,
  originalQueryImg,
  scanImg,
  scanLargeImg
) {
  return {
    columns: [
      {
        columns: [
          {
            width: 'auto',
            style: 'smallImg',
            margin: [0, 5, 0, 0],
            stack: [
              {
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 100,
                        h: 120,
                        lineWidth: 1,
                        lineColor: malignant ? 'red' : 'blue',
                      },
                    ],
                  },
                  {
                    image: scanImg,
                    width: 98,
                    height: 70,
                    margin: [1, -119, 0, 20],
                  },
                  {
                    margin: [10, -13, 0, 20],
                    // padding: [20, 10, 20, 10],
                    stack: [
                      {
                        columnGap: 0,
                        columns: [
                          { text: '0' + dataset, bold: true },
                          {
                            margin: [-30, 0, 0, 0],
                            stack: [
                              {
                                columns: [
                                  {
                                    text: 'Similarity:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: similarity,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Dataset:',
                                    fontSize: 8,
                                    bold: true,
                                  },
                                  {
                                    text: dataset,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columnGap: 3,
                                columns: [
                                  {
                                    text: 'Dataset Id:',
                                    fontSize: 8,
                                    bold: true,
                                    margin: [-1, 0, 0, 0],
                                  },
                                  {
                                    text: datasetId,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Malignant:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: malignant ? 'Yes' : 'No',
                                    color: malignant ? 'red' : 'blue',
                                    fontSize: 8,
                                    margin: [2, 0, 0, 0],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      // columns: [ ],
                    ],
                  },
                ],
              },
            ],
          },
          {
            stack: [
              {
                image: scanImg,
                width: 130,
                height: 120,
                margin: [-10, 5, 0, 0],
              },
            ],
            margin: [20, 0, 0, 0],
          },
        ],
      },
      {
        columns: [
          {
            width: 'auto',
            style: 'smallImg',
            margin: [0, 5, 0, 0],
            stack: [
              {
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 100,
                        h: 120,
                        lineWidth: 1,
                        lineColor: malignant ? 'red' : 'blue',
                      },
                    ],
                  },
                  {
                    image: scanImg,
                    width: 98,
                    height: 70,
                    margin: [1, -119, 0, 20],
                  },
                  {
                    margin: [10, -13, 0, 20],
                    // padding: [20, 10, 20, 10],
                    stack: [
                      {
                        columnGap: 0,
                        columns: [
                          { text: '0' + dataset, bold: true },
                          {
                            margin: [-30, 0, 0, 0],
                            stack: [
                              {
                                columns: [
                                  {
                                    text: 'Similarity:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: similarity,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Dataset:',
                                    fontSize: 8,
                                    bold: true,
                                  },
                                  {
                                    text: dataset,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columnGap: 3,
                                columns: [
                                  {
                                    text: 'Dataset Id:',
                                    fontSize: 8,
                                    bold: true,
                                    margin: [-1, 0, 0, 0],
                                  },
                                  {
                                    text: datasetId,
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Malignant:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: malignant ? 'Yes' : 'No',
                                    color: malignant ? 'red' : 'blue',
                                    fontSize: 8,
                                    margin: [2, 0, 0, 0],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      // columns: [ ],
                    ],
                  },
                ],
              },
            ],
          },
          {
            stack: [
              {
                image: scanImg,
                width: 130,
                height: 120,
                margin: [-10, 5, 0, 0],
              },
            ],
            margin: [20, 0, 0, 0],
          },
        ],
      },
    ],
  };
}
// function createSimilarScansSection2(
//   similarity,
//   dataset,
//   datasetId,
//   malignant,
//   originalQueryImg,
//   scanImg,
//   scanLargeImg
// ) {
//   return {
//     style: 'imagescol2',
//     alignment: 'justify',
//     columns: [
//       {
//         columns: [
//           {
//             width: 'auto',
//             style: 'smallImg',
//             stack: [
//               {
//                 stack: [
//                   {
//                     canvas: [
//                       {
//                         type: 'rect',
//                         x: 0,
//                         y: 0,
//                         w: 100,
//                         h: 122,
//                         lineWidth: 1,
//                         lineColor: malignant ? 'red' : 'blue',
//                       },
//                     ],
//                   },
//                   {
//                     image: originalQueryImg,
//                     width: 98,
//                     height: 72,
//                     margin: [1, -121, 0, 20],
//                   },
//                   {
//                     margin: [10, -13, 0, 20],
//                     // padding: [20, 10, 20, 10],
//                     stack: [
//                       {
//                         columnGap: 0,
//                         columns: [
//                           { text: '04', bold: true },
//                           {
//                             margin: [-30, 0, 0, 0],
//                             stack: [
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Similarity:',
//                                     bold: true,
//                                     fontSize: 8,
//                                   },
//                                   {
//                                     text: similarity,
//                                     fontSize: 8,
//                                     margin: [0, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Dataset:',
//                                     fontSize: 8,
//                                     bold: true,
//                                   },
//                                   {
//                                     text: dataset,
//                                     fontSize: 8,
//                                     margin: [0, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Dataset Id:',
//                                     fontSize: 8,
//                                     bold: true,
//                                     margin: [-1, 0, 0, 0],
//                                   },
//                                   {
//                                     text: datasetId,
//                                     fontSize: 8,
//                                     margin: [3, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Malignant:',
//                                     bold: true,
//                                     fontSize: 8,
//                                   },
//                                   {
//                                     text: malignant ? 'Yes' : 'No',
//                                     color: malignant ? 'red' : 'blue',
//                                     fontSize: 8,
//                                     margin: [2, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                             ],
//                           },
//                         ],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             stack: [
//               {
//                 image: scanLargeImg,
//                 width: 130,
//                 height: 120,
//               },
//             ],
//             margin: [5, 0, 5, 0],
//           },
//         ],
//       },
//       {
//         columns: [
//           {
//             width: 'auto',
//             style: 'smallImg',
//             stack: [
//               {
//                 stack: [
//                   {
//                     canvas: [
//                       {
//                         type: 'rect',
//                         x: 0,
//                         y: 0,
//                         w: 100,
//                         h: 120,
//                         lineWidth: 1,
//                         lineColor: malignant ? 'red' : 'blue',
//                       },
//                     ],
//                   },
//                   {
//                     image: scanImg,
//                     width: 98,
//                     height: 72,
//                     margin: [1, -119, 0, 20],
//                   },
//                   {
//                     margin: [10, -13, 0, 20],
//                     // padding: [20, 10, 20, 10],
//                     stack: [
//                       {
//                         columnGap: 0,
//                         columns: [
//                           { text: '0' + dataset, bold: true },
//                           {
//                             margin: [-30, 0, 0, 0],
//                             stack: [
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Similarity:',
//                                     bold: true,
//                                     fontSize: 8,
//                                   },
//                                   {
//                                     text: similarity,
//                                     fontSize: 8,
//                                     margin: [0, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Dataset:',
//                                     fontSize: 8,
//                                     bold: true,
//                                   },
//                                   {
//                                     text: dataset,
//                                     fontSize: 8,
//                                     margin: [0, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Dataset Id:',
//                                     fontSize: 8,
//                                     bold: true,
//                                     margin: [-1, 0, 0, 0],
//                                   },
//                                   {
//                                     text: datasetId,
//                                     fontSize: 8,
//                                     margin: [3, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                               {
//                                 columns: [
//                                   {
//                                     text: 'Malignant:',
//                                     bold: true,
//                                     fontSize: 8,
//                                   },
//                                   {
//                                     text: malignant ? 'Yes' : 'No',
//                                     color: malignant ? 'red' : 'blue',
//                                     fontSize: 8,
//                                     margin: [2, 0, 0, 0],
//                                   },
//                                 ],
//                               },
//                             ],
//                           },
//                         ],
//                       },
//                       // columns: [ ],
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//           {
//             stack: [
//               {
//                 image: scanLargeImg,
//                 width: 130,
//                 height: 120,
//               },
//             ],
//             margin: [10, 0, 0, 0],
//           },
//         ],
//       },
//     ],
//   };
// }

// function createReportSummaryTable(
//   patientID,
//   patientName,
//   classifier,
//   malignantScore
// ) {
//   return {
//     table: {
//       widths: ['30%', '70%'], // specify widths for both columns
//       body: [
//         [
//           {
//             text: 'RadCard Report Summary',
//             style: 'jumbotronHeader',
//             // colSpan: 2,
//           },
//           {},
//         ],
//         [{ text: 'Patient ID : ', style: 'bold' }, patientID],
//         [{ text: 'Patient Name : ', style: 'bold' }, patientName],
//         [{ text: 'Classifier : ', style: 'bold' }, classifier],
//         [{ text: 'Malignant Score : ', style: 'bold_margin' }, malignantScore],
//       ],
//     },
//     layout: {
//       hLineWidth: () => 0,
//       vLineWidth: () => 0,
//       paddingLeft: () => 0,
//       paddingRight: () => 0,
//     },
//     style: 'jumbotron',
//   };
// }

function patientInfoHeader() {
  return {
    table: {
      widths: ['25%', '72%'], // specify widths for both columns
      body: [
        [
          {
            text: 'PATIENT INFORMATION',
            style: 'jumbotronHeader',
            colSpan: 2, // span across 2 columns
          },
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    }, // this layout has no borders and no padding
    style: 'jumbotronLBlue',
    margin: [0, 0, 0, 0],
  };
}

function createReportSummaryTable(
  patientID,
  patientName,
  classifier,
  malignantScore
) {
  return {
    // table: {
    //   widths: ['25%', '72%'], // specify widths for both columns
    //   body: [
    //     [
    //       {
    //         text: 'PATIENT INFORMATION',
    //         style: 'jumbotronHeader',
    //         colSpan: 2, // span across 2 columns
    //       },
    //       {},
    //     ],
    //   ],
    // },
    table: {
      widths: ['25%', '72%'], // specify widths for both columns
      body: [
        [
          {
            style: 'imagescol2',
            columns: [
              {
                columns: [
                  {
                    stack: [
                      {
                        text: 'Patient Name:',
                        bold: true,
                        fontSize: 9,
                      },
                      {
                        text: patientName,
                        color: '#3d3d49',
                        fontStyle: 'thin',
                        fontSize: 10,
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                  {
                    stack: [
                      {
                        text: 'Classifier:',
                        bold: true,
                        noWrap: true,
                        fontSize: 9,
                      },
                      {
                        text: classifier,
                        color: '#3d3d49',
                        fontStyle: 'thin',
                        fontSize: 10,
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                ],
              },
              {
                columns: [
                  {
                    stack: [
                      {
                        text: 'Patient ID:',
                        bold: true,
                        fontSize: 9,
                      },
                      {
                        text: patientID,
                        fontStyle: 'thin',
                        color: '#3d3d49',
                        fontSize: 10,
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                  {
                    stack: [
                      {
                        text: 'Malignant Score:',
                        bold: true,
                        noWrap: true,
                        fontSize: 9,
                      },
                      {
                        text: malignantScore,
                        fontStyle: 'thin',
                        color: '#3d3d49',
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    }, // this layout has no borders and no padding
    style: 'jumbotron',
    margin: [0, 0, 0, 0],
  };
}

function analysisDescriptionHeader() {
  return {
    text: 'ANALYSIS DESCRIPTION',
    bold: true,
    fontSize: 9,
    margin: [0, 17, 0, 0],
  };
}

function analysisDescriptionBody() {
  return {
    text:
      'The Nodify XL2 test is a blood-based lung nodule test designed to help identify low to moderate risk patients with an incidental lung nodule that is likely benign. The test integrates two circulating proteins measured by mass spectrometry with clinical risk factors associated with lung cancer into a proprietary algorithm that generates a numerical test result. The Nodify XL2 test is intended for patients at least 40 years of age with an incidental lung nodule between 8 and 30mm and a pre-test risk of malignancy of 50% or less calculated using the solitary pulmonary nodule calculator!. Nodify XL2 was developed and clinically validated in a population with a prevalence of cancer of 16%23. The Nodify XL2 test has not been evaluated outside of this population.',
    fontSize: 7,
    width: 200,
    margin: [0, 5, 0, 0],
  };
}

function createSimilarScansHeader() {
  return {
    table: {
      widths: ['25%', '72%'],
      body: [
        [
          {
            text: 'ADDITIONAL SIMILAR SCANS',
            colSpan: 2,
            style: 'jumbotronHeader',
            // margin: [20, 15, 0, 15],
            // bold: true,
            // fontSize: 18,
          },
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    },
    style: 'jumbotronBlue',
    margin: [0, -5, 0, 8],
    // pageBreak: 'before',
  };
}

function createMorphologyHeader() {
  return {
    table: {
      widths: ['25%', '72%'],
      body: [
        [
          {
            text: 'Morphology',
            colSpan: 2,
            margin: [20, 15, 0, 15],
            bold: true,
            fontSize: 18,
          },
          {},
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
    },
    style: 'jumbotron',
    pageBreak: 'before',
  };
}

function createCollageRadiomicsHeader() {
  return {
    style: 'headercol',
    alignment: 'justify',
    columns: [
      {
        table: {
          widths: ['22%', '72%'], // specify widths for both columns
          body: [
            [
              {
                text: 'COLLAGE RADIOMICS',
                style: 'jumbotronHeader',
                colSpan: 2, // span across 2 columns
              },
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        }, // this layout has no borders and no padding
        style: 'jumbotronLBlue2',
        margin: [0, 30, -10, 10],
      },
      {
        table: {
          widths: ['25%', '70%'], // specify widths for both columns
          body: [
            [
              {
                text: 'MOST SIMILAR SCANS',
                style: 'jumbotronHeader',
                colSpan: 2, // span across 2 columns
              },
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        }, // this layout has no borders and no padding
        style: 'jumbotronBlue',
        margin: [-8, 30, 0, 20],
      },
    ],
  };
}

function createCollageRadiomicsBody(image, malignant) {
  return {
    columns: [
      {
        table: {
          widths: ['25%', '72%'], // specify widths for both columns
          body: [
            [
              {
                image: image,
                width: 140,
                height: 120,
                margin: [5, 5, 5, 5],
              },
              {
                stack: [
                  {
                    columnGap: 0,
                    columns: [
                      {
                        text: 'Zoom:',
                        bold: true,
                        fontSize: 8,
                        margin: [87, 5, 0, 0],
                      },
                      {
                        text: '138%',
                        fontSize: 8,
                        margin: [3, 5, 0, 0],
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'W:',
                        bold: true,
                        fontSize: 8,
                        margin: [87, 0, 0, 0],
                      },
                      {
                        text: '1500',
                        fontSize: 8,
                        margin: [3, 0, 0, 0],
                      },
                    ],
                  },
                  {
                    // columns: [
                    // {
                    text: 'Loseless/',
                    // bold: true,
                    fontSize: 8,
                    margin: [87, 0, 0, 0],
                    // },

                    // ],
                  },
                  {
                    text: 'Uncompressed',
                    fontSize: 8,
                    margin: [87, 0, 0, 0],
                  },
                  {
                    text: 'May 21, 2010',
                    fontSize: 8,
                    margin: [87, 66, 0, 0],
                  },
                  {
                    text: '09: 12: 52',
                    fontSize: 8,
                    margin: [87, 0, 0, 0],
                  },
                ],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
        }, // this layout has no borders and no padding
        style: 'jumbotronDark',
        margin: [0, 0, 0, 20],
      },
      {
        columns: [
          {
            width: 'auto',
            style: 'smallImg',
            margin: [0, 5, 0, 0],
            stack: [
              {
                stack: [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 100,
                        h: 120,
                        lineWidth: 1,
                        lineColor: malignant ? 'red' : 'blue',
                      },
                    ],
                  },
                  {
                    image: image,
                    width: 98,
                    height: 70,
                    margin: [1, -119, 0, 20],
                  },
                  {
                    margin: [10, -13, 0, 20],
                    // padding: [20, 10, 20, 10],
                    stack: [
                      {
                        columnGap: 0,
                        columns: [
                          { text: '0' + malignant, bold: true },
                          {
                            margin: [-30, 0, 0, 0],
                            stack: [
                              {
                                columns: [
                                  {
                                    text: 'Similarity:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: '34.17%',
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Dataset:',
                                    fontSize: 8,
                                    bold: true,
                                  },
                                  {
                                    text: '1',
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columnGap: 3,
                                columns: [
                                  {
                                    text: 'Dataset Id:',
                                    fontSize: 8,
                                    bold: true,
                                    margin: [-1, 0, 0, 0],
                                  },
                                  {
                                    text: '18207',
                                    fontSize: 8,
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              },
                              {
                                columns: [
                                  {
                                    text: 'Malignant:',
                                    bold: true,
                                    fontSize: 8,
                                  },
                                  {
                                    text: 'No',
                                    color: 'blue',
                                    fontSize: 8,
                                    margin: [2, 0, 0, 0],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            stack: [
              {
                image: image,
                width: 130,
                height: 120,
                margin: [-10, 5, 0, 0],
              },
            ],
            margin: [20, 0, 0, 0],
          },
        ],
      },
    ],
  };
}

const PdfMaker = (SimilarScans, ohif_image, chart, morphologyBase64) => {
  const contents = [];
  const images = {};

  const patientData = getItem('selectedStudy');
  const score = getMalignantScore(SimilarScans);

  images['query'] = SimilarScans.query;

  SimilarScans.knn.forEach((data, index) => {
    const imageIndex = 'img' + index;
    images[imageIndex + 'thumb'] = data.region_thumbnail_url;
    images[imageIndex] = data.image_url;
    const isEvenIndex = index % 2 === 0;

    const section = createSimilarScansSection(
      data.similarity_score,
      index + 1,
      data.data_id,
      data.malignant,
      'query',
      imageIndex + 'thumb',
      chart[index]
    );
    if (isEvenIndex) {
      const rowIndex = index / 2;
      if (!contents[rowIndex]) {
        contents[rowIndex] = [];
      }
      contents[rowIndex].push(section);
    } else {
      const previousRowIndex = Math.floor(index / 2);
      contents[previousRowIndex].push(section);
    }
  });

  const documentDefinition = {
    content: [
      patientInfoHeader(),
      createReportSummaryTable(
        patientData.PatientID,
        patientData.PatientName,
        'ResNet -18',
        score
      ),
      analysisDescriptionHeader(),
      analysisDescriptionBody(),
    ],
    styles: {
      firstCanvas: {
        fillColor: '#f2f2f2',
      },
      header: {
        fontSize: 12,
        bold: true,
        background: '#f2f2f2',
        margin: [0, 0, 0, 10],
      },
      header2: { fontSize: 16, bold: true, margin: [0, 10, 0, 10] },
      header3: { fontSize: 14, bold: true, margin: [20, 140, 0, 5] },
      headercol: {
        columnGap: 0,
        width: 200,
        margin: [0, -20, 0, -19],
      },
      smallImg: { fontSize: 10, margin: [0, 0, 0, 5] },
      imagescol: { columnGap: 20, margin: [10, 50, 30, 10] },
      imagescol2: {
        columnGap: 60,
        margin: [10, 7, 30, 7],
      },
      imagescol3: {
        columnGap: 40,
        margin: [0, 7, 30, 7],
      },
      jumbotron: {
        fillColor: '#F9FAFA', // jumbotron background color
        padding: [10, 10, 10, 10], // add padding for the jumbotron
        border: 'grey',
      },
      jumbotronBlue: {
        fillColor: '#243D4E', // jumbotron background color
        padding: [10, 0, 10, 10], // add padding for the jumbotron
        border: 'grey',
        color: 'white',
      },
      jumbotronLBlue: {
        fillColor: '#A2B1BC', // jumbotron background color
        padding: [10, -10, 10, 0], // add padding for the jumbotron
        border: 'red',
        color: 'white',
      },
      jumbotronLBlue2: {
        fillColor: '#A2B1BC', // jumbotron background color
        padding: [10, 0, 10, 10], // add padding for the jumbotron
        border: 'grey',
        color: 'white',
      },
      jumbotronDark: {
        fillColor: '#EFF0F5', // jumbotron background color
        padding: [10, 10, 10, 10], // add padding for the jumbotron
        border: 'grey',
      },
      jumbotronHeader: {
        fontSize: 12, // bigger, bolder font for jumbotron header
        bold: true, // make the header bold
        margin: [12, 10, 10, 10], // add some margin to create space under the header
      },
      jumbotronBody: {
        fontSize: 14, // font size for the body text
        margin: [10, 10, 10, 10], // add some margin to create space under the body text
      },
      bold: {
        bold: true, // make the labels bold
        margin: [15, 0, 30, 0], // add some margin to create space under the body text
      },
      bold_margin: {
        bold: true, // make the labels bold
        margin: [15, 0, 30, 20], // add some margin to create space under the body text
      },
    },
    images,
  };

  const getImageDataUrl = imageUrl => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.onerror = error => reject(error);
      img.src = imageUrl;
    });
  };

  if (ohif_image) {
    documentDefinition.content.push(createCollageRadiomicsHeader());
    documentDefinition.content.push(
      createCollageRadiomicsBody(ohif_image, score)
    );
    // documentDefinition.content.push({
    //   image: ohif_image,
    //   width: 500,
    //   height: 500,
    // });
  }

  if (contents.length > 0) {
    documentDefinition.content.push(createSimilarScansHeader());
    documentDefinition.content = documentDefinition.content.concat(contents);
  }

  if (morphologyBase64) {
    documentDefinition.content.push(createMorphologyHeader());
    documentDefinition.content.push({
      image: morphologyBase64,
      fit: [518, 500],
    });
  }

  return documentDefinition;
};

export default PdfMaker;
