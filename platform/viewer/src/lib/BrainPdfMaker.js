import pdfmake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { getItem } from './localStorageUtils';
pdfmake.vfs = pdfFonts.pdfMake.vfs;

function getMalignantScore(data) {
  const knnLength = data.knn.length;
  const malignantCount = data.knn.filter(item => item.malignant).length;
  return malignantCount + '/' + knnLength;
}

function createCollage(zoom, w, date, time, imageDataUrl3, imageDataUrl8) {
  return {
    columns: [
      {
        stack: [
          {
            image: imageDataUrl8,
            width: 350,
            height: 280,
            margin: [-70, 5, 0, 0],
          },
        ],
        margin: [70, 0, 0, 0],
      },
      {
        stack: [
          {
            stack: [
              { text: 'Entropic heterogenety:', fontSize: 9 },
              { text: '0.46', fontSize: 9 },
            ],
            margin: [20, 10, 0, 0],
          },
          {
            stack: [
              { text: 'Correlation heterogenety:', fontSize: 9 },
              { text: '0.26', fontSize: 9 },
            ],
            margin: [20, 25, 0, 0],
          },
        ],
      },
      // {
      //   margin: [20, 10, 0, 0],
      //   stack: [
      //     {
      //       stack: [
      //         {
      //           columns: [
      //             {
      //               text: 'Zoom:',
      //               bold: true,
      //               fontSize: 8,
      //               margin: [60, 0, 0, 0],
      //             },
      //             {
      //               text: zoom,
      //               fontSize: 8,
      //               margin: [-70, 0, 0, 0],
      //             },
      //           ],
      //         },
      //         {
      //           columns: [
      //             {
      //               text: 'W:',
      //               fontSize: 8,
      //               bold: true,
      //               margin: [60, 0, 0, 0],
      //             },
      //             {
      //               text: w,
      //               fontSize: 8,
      //               margin: [-80, 0, 0, 0],
      //             },
      //           ],
      //         },
      //         {
      //           text: 'Loseless/',
      //           fontSize: 8,
      //           margin: [60, 0, 0, 0],
      //         },
      //         {
      //           text: 'uncompressed',
      //           fontSize: 8,
      //           margin: [60, 0, 0, 0],
      //         },
      //       ],
      //     },
      //     {
      //       margin: [60, 110, 0, 0],
      //       stack: [
      //         {
      //           text: date,
      //           fontSize: 8,
      //         },
      //         {
      //           text: time,
      //           fontSize: 8,
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  };
}

function createReportSummaryTable(
  patientID,
  patientName,
  classifier
  // malignantScore
) {
  return {
    table: {
      widths: ['30%', '72%'],
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
                        text: 'Tumor Spicularity:',
                        bold: true,
                        noWrap: true,
                        fontSize: 9,
                      },
                      {
                        text: '70',
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
                        text: 'Longevity prediction:',
                        bold: true,
                        fontSize: 9,
                      },
                      {
                        text: '12 to 14 months,70% confidence',
                        color: '#3d3d49',
                        fontStyle: 'thin',
                        fontSize: 10,
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                  // {
                  //   stack: [
                  //     {
                  //       text: 'Malignant Score:',
                  //       bold: true,
                  //       noWrap: true,
                  //       fontSize: 9,
                  //     },
                  //     {
                  //       text: malignantScore,
                  //       fontStyle: 'thin',
                  //       color: '#3d3d49',
                  //       margin: [0, 4, 0, 0],
                  //     },
                  //   ],
                  // },
                ],
              },
            ],
          },
          {},
        ],
      ],
    },
    layout: 'noBorders',
    style: 'jumbotron',
    margin: [0, 0, 0, 0],
  };
}

function createReportSummaryTable2(
  patientID,
  patientName,
  classifier
  // malignantScore
) {
  return {
    table: {
      widths: ['30%', '72%'],
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
                        fontSize: 8,
                      },
                      {
                        text: 'John Doe',
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
                        text: 'Date of Birth:',
                        bold: true,
                        noWrap: true,
                        fontSize: 9,
                      },
                      {
                        text: 'Jan 1, 1970',
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
                        text: 'Institution: ',
                        bold: true,
                        fontSize: 9,
                      },
                      {
                        text: 'Clearview Hospital',
                        color: '#3d3d49',
                        fontStyle: 'thin',
                        fontSize: 10,
                        margin: [0, 4, 0, 0],
                      },
                    ],
                  },
                  // {
                  //   stack: [
                  //     {
                  //       text: 'Malignant Score:',
                  //       bold: true,
                  //       noWrap: true,
                  //       fontSize: 9,
                  //     },
                  //     {
                  //       text: malignantScore,
                  //       fontStyle: 'thin',
                  //       color: '#3d3d49',
                  //       margin: [0, 4, 0, 0],
                  //     },
                  //   ],
                  // },
                ],
              },
            ],
          },
          {},
        ],
      ],
    },
    layout: 'noBorders',
    style: 'jumbotron',
    margin: [0, 0, 0, 0],
  };
}
function createMorphologyHeader() {
  return {
    style: 'headercol',
    pageBreak: 'before',
    stack: [
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              {
                text: 'Tumor Complexity & Spikiness',
                style: 'jumbotronHeader',
                colSpan: 2,
              },
              {},
            ],
          ],
        },
        layout: 'noBorders',
        style: 'jumbotronLBlue2',
        margin: [0, 20, -10, 5],
      },
    ],
  };
}

function createMorphologyBody(image) {
  return {
    stack: [
      {
        image: image,
        width: 350,
        height: 280,
        margin: [80, 5, 0, 0],
      },
    ],
  };
}

const PdfMaker = (ohif_image, morphologyBase64) => {
  let contents = [];
  let contents2 = [];
  let contents3 = null;
  const images = {};

  const patientData = getItem('selectedStudy');

  images['logo_one'] =
    'https://afrogane-storage.s3.eu-central-1.amazonaws.com/logo_one.png';
  images['logo_two'] = 'https://share-ohif.s3.amazonaws.com/Wisconsin-logo.jpg';

  const documentDefinition = {
    content: [
      {
        style: 'imagescol3',
        // alignment: 'justify',
        columns: [
          // {
          //   image: 'logo_one',
          //   width: 80,
          //   height: 80,
          // },
          {
            text: 'LivAI Report Summary',
            margin: [0, 20, 0, 0],
            bold: true,
            color: '#243D4E',
            fontSize: 17,
          },
          // {
          //   image: 'logo_two',
          //   width: 80,
          //   height: 80,
          //   margin: [12, 0, 0, 0],
          // },
        ],
      },
      {
        style: 'headercol',
        // alignment: 'justify',
        stack: [
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  {
                    text: 'Patient Information',
                    style: 'jumbotronHeader',
                    colSpan: 2, // span across 2 columns
                  },
                  {},
                ],
              ],
            },
            layout: 'noBorders',
            style: 'jumbotronLBlue2',
            margin: [0, 5, -10, 5],
          },
        ],
      },
      // {},
      // },
      // createReportSummaryTable(
      //   patientData.PatientID,
      //   patientData.PatientName,
      //   'ResNet -18'
      //   // score
      // ),
      createReportSummaryTable2(
        patientData.PatientID,
        'John Doe',
        'ResNet -18'
        // score
      ),
      // {
      //   text: 'ANALYSIS DESCRIPTION',
      //   bold: true,
      //   fontSize: 9,
      //   margin: [0, 17, 0, 0],
      // },
      // {
      //   text:
      //     'The report is produced by utilizing ResNet models for the classification of brain nodules, with the primary objective of identifying instances with malignant characteristics. The outcomes delineate scans that bear resemblance, particularly those exhibiting malignant indentations, along with their corresponding prediction numbers and unique identification identifiers for each analogous scan.        ',
      //   fontSize: 7,
      //   width: 200,
      //   margin: [0, 5, 0, 0],
      // },
      {
        style: 'headercol',
        // alignment: 'justify',
        stack: [
          {
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  {
                    text: 'Local Heterogeneity',
                    style: 'jumbotronHeader',
                    colSpan: 2, // span across 2 columns
                  },
                  {},
                ],
              ],
            },
            layout: 'noBorders',
            style: 'jumbotronLBlue2',
            margin: [0, 20, -10, 5],
          },
        ],
      },
    ],
    styles: {
      branding: {
        font: 'Times',
      },
      header: {
        fontSize: 12,
        bold: true,
        background: '#f2f2f2',
        margin: [0, 0, 0, 10],
      },
      imagescol2: {
        columnGap: 90,
        margin: [10, 7, 30, 7],
      },
      jumbotron: {
        fillColor: '#EFF0F5',
        padding: [10, 10, 10, 10],
        border: 'grey',
      },
      jumbotronHeader: {
        fontSize: 12,
        bold: true,
        margin: [12, 10, 10, 10],
      },
      jumbotronHeader2: {
        fontSize: 12,
        bold: true,
        background: '#A2B1BC',
        margin: [12, 10, 10, 10],
      },
      jumbotronBlue: {
        fillColor: '#243D4E',
        padding: [10, 0, 10, 10],
        border: 'grey',
        color: 'white',
      },
      jumbotronLBlue2: {
        fillColor: '#A2B1BC',
        padding: [10, 0, 10, 10],
        border: 'grey',
        color: 'white',
      },
      noBorders: {
        hLineWidth: function(i, node) {
          return 0;
        },
        vLineWidth: function(i, node) {
          return 0;
        },
      },
    },
    images,
  };

  if (ohif_image) {
    const imageDataUrl3 = 'query';
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const zoom = '138';
    const w = '1500';

    const collage = createCollage(
      zoom,
      w,
      date,
      time,
      imageDataUrl3,
      ohif_image
    );

    const morphologyImage = createMorphologyBody(morphologyBase64);

    // const morphologyHeader = createMorphologyHeader();
    // documentDefinition.content.push({
    //   //   columns: [
    //   // {
    //   ...collage,
    //   //   ...morphologyHeader,
    //   // },
    //   // {
    //   //   ...contents3,
    //   // },
    //   //   ],
    // });
    documentDefinition.content.push(collage);

    const morphologyHeader = createMorphologyHeader();
    documentDefinition.content.push(morphologyHeader);
    documentDefinition.content.push(morphologyImage);
  }

  return documentDefinition;
};

export default PdfMaker;
