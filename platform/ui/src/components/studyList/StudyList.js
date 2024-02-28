import './StudyList.styl';

import React, { useState } from 'react';
import classNames from 'classnames';
import TableSearchFilter from './TableSearchFilter.js';
import PropTypes from 'prop-types';
import { StudyListLoadingText } from './StudyListLoadingText.js';
import { useTranslation } from 'react-i18next';
import TableLabel from './TableLabel';
import { setItem } from '@ohif/viewer/src/lib/localStorageUtils';
import { lungMode } from '@ohif/viewer/src/utils/constants';
import { useSelector } from 'react-redux';

const getContentFromUseMediaValue = (
  displaySize,
  contentArrayMap,
  defaultContent
) => {
  const content =
    displaySize in contentArrayMap
      ? contentArrayMap[displaySize]
      : defaultContent;

  return content;
};
/**
 *
 *
 * @param {*} props
 * @returns
 */
function StudyList(props) {
  const {
    isLoading,
    hasError,
    studies,
    sort,
    onSort: handleSort,
    filterValues,
    onFilterChange: handleFilterChange,
    onSelectItem: handleSelectItem,
    studyListDateFilterNumDays,
    displaySize,
  } = props;
  const { t, ready: translationsAreReady } = useTranslation('StudyList');

  // const [lungActive, setLungActive] = useState(false);
  const { active: currentMode } = useSelector(state => state && state.mode);

  const largeTableMeta = [
    {
      displayText: t('PatientName'),
      fieldName: 'PatientName',
      PlaceHolder: 'Patient Name',
      inputType: 'text',
      size: 330,
    },
    {
      displayText: t('MRN'),
      fieldName: 'PatientID',
      PlaceHolder: 'Patient ID',
      inputType: 'text',
      size: 378,
    },
    {
      displayText: t('AccessionNumber'),
      fieldName: 'AccessionNumber',
      PlaceHolder: 'Accession Number',
      inputType: 'text',
      size: 180,
    },
    {
      displayText: t('StudyDate'),
      fieldName: 'StudyDate',
      PlaceHolder: 'Study Date',
      inputType: 'date-range',
      size: 300,
    },
    {
      displayText: t('Modality'),
      fieldName: 'modalities',
      PlaceHolder: 'Modality',
      inputType: 'text',
      size: 114,
    },
    {
      displayText: t('StudyDescription'),
      fieldName: 'StudyDescription',
      PlaceHolder: 'Study Description',
      inputType: 'text',
      size: 335,
    },
  ];

  const mediumTableMeta = [
    {
      displayText: `${t('PatientName')} / ${t('MRN')}`,
      fieldName: 'patientNameOrId',
      PlaceHolder: 'patientName Or Id',
      inputType: 'text',
      size: 250,
    },
    {
      displayText: t('Description'),
      fieldName: 'accessionOrModalityOrDescription',
      PlaceHolder: 'accession Or Modality OrDescription',
      inputType: 'text',
      size: 350,
    },
    {
      displayText: t('AccessionNumber'),
      fieldName: 'AccessionNumber',
      PlaceHolder: 'Accession Number',
      inputType: 'text',
      size: 180,
    },
    {
      displayText: t('StudyDate'),
      fieldName: 'StudyDate',
      PlaceHolder: 'StudyDate',
      inputType: 'date-range',
      size: 300,
    },
  ];

  const smallTableMeta = [
    {
      displayText: t('Search'),
      fieldName: 'allFields',
      inputType: 'text',
      size: 100,
    },
  ];

  const tableMeta = getContentFromUseMediaValue(
    displaySize,
    { large: largeTableMeta, medium: mediumTableMeta, small: smallTableMeta },
    smallTableMeta
  );

  const totalSize = tableMeta
    .map(field => field.size)
    .reduce((prev, next) => prev + next);

  return translationsAreReady ? (
    <>
      <div
        className={`study-list-container ${
          currentMode === 'brain' ? 'brain' : ''
        }`}
        style={{
          marginTop: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '0 2%',
            width: '100%',
          }}
        >
          <TableSearchFilter
            meta={tableMeta}
            values={filterValues}
            onSort={handleSort}
            onValueChange={handleFilterChange}
            sortFieldName={sort.fieldName}
            sortDirection={sort.direction}
            studyListDateFilterNumDays={studyListDateFilterNumDays}
          />
        </div>
      </div>
      <div
        className={`study-list-container ${
          currentMode === 'brain' ? 'brain' : ''
        }`}
      >
        <div
          className={`filters2 ${currentMode === 'brain' ? 'brain' : ''}`}
          style={{
            display: 'flex',
            padding: '0 2%',
            width: '100%',
          }}
        >
          <TableLabel
            meta={tableMeta}
            values={filterValues}
            onSort={handleSort}
            onValueChange={handleFilterChange}
            sortFieldName={sort.fieldName}
            sortDirection={sort.direction}
            studyListDateFilterNumDays={studyListDateFilterNumDays}
          />
        </div>
      </div>

      <div
        style={{
          paddingRight: '2%',
          paddingLeft: '2%',
        }}
      >
        <table className="table table--hoverable study-list-container">
          {/* <colgroup>
        {tableMeta.map((field, i) => {
          const size = field.size;
          const percentWidth = (size / totalSize) * 100.0;

          return <col key={i} style={{ width: `${percentWidth}%` }} />;
        })}
      </colgroup> */}
          <tbody className="table-body" data-cy="study-list-results">
            {/* I'm not in love with this approach, but it's the quickest way for now
             *
             * - Display different content based on loading, empty, results state
             *
             * This is not ideal because it create a jump in focus. For loading especially,
             * We should keep our current results visible while we load the new ones.
             */}
            {/* LOADING */}
            {isLoading && (
              <tr className="no-hover">
                <td colSpan={tableMeta.length}>
                  <StudyListLoadingText />
                </td>
              </tr>
            )}
            {!isLoading && hasError && (
              <tr className="no-hover">
                <td colSpan={tableMeta.length}>
                  <div className="notFound">
                    {t('There was an error fetching studies')}
                  </div>
                </td>
              </tr>
            )}
            {/* EMPTY */}
            {!isLoading && !studies.length && (
              <tr className="no-hover">
                <td colSpan={tableMeta.length}>
                  <div className="notFound">{t('No matching results')}</div>
                </td>
              </tr>
            )}
            {!isLoading &&
              studies.map((study, index) => (
                <TableRow
                  key={`${study.StudyInstanceUID}-${index}`}
                  onClick={StudyInstanceUID => {
                    setItem('selectedStudy', study);
                    handleSelectItem(StudyInstanceUID);
                  }}
                  AccessionNumber={study.AccessionNumber || ''}
                  modalities={study.modalities}
                  PatientID={study.PatientID || ''}
                  PatientName={study.PatientName || ''}
                  StudyDate={study.StudyDate}
                  StudyDescription={study.StudyDescription || ''}
                  StudyInstanceUID={study.StudyInstanceUID}
                  displaySize={displaySize}
                />
              ))}
          </tbody>
        </table>
      </div>
    </>
  ) : null;
}

StudyList.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  hasError: PropTypes.bool.isRequired,
  studies: PropTypes.array.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  // ~~ SORT
  sort: PropTypes.shape({
    fieldName: PropTypes.string,
    direction: PropTypes.oneOf(['desc', 'asc', null]),
  }).isRequired,
  onSort: PropTypes.func.isRequired,
  // ~~ FILTERS
  filterValues: PropTypes.shape({
    PatientName: PropTypes.string.isRequired,
    PatientID: PropTypes.string.isRequired,
    AccessionNumber: PropTypes.string.isRequired,
    StudyDate: PropTypes.string.isRequired,
    modalities: PropTypes.string.isRequired,
    StudyDescription: PropTypes.string.isRequired,
    patientNameOrId: PropTypes.string.isRequired,
    accessionOrModalityOrDescription: PropTypes.string.isRequired,
    allFields: PropTypes.string.isRequired,
    studyDateTo: PropTypes.any,
    studyDateFrom: PropTypes.any,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  studyListDateFilterNumDays: PropTypes.number,
  displaySize: PropTypes.string,
};

StudyList.defaultProps = {};

function TableRow(props) {
  const {
    AccessionNumber,
    isHighlighted,
    modalities,
    PatientID,
    PatientName,
    StudyDate,
    StudyDescription,
    StudyInstanceUID,
    onClick: handleClick,
    displaySize,
  } = props;

  const { t } = useTranslation('StudyList');

  // const [lungActive, setLungActive] = useState(false);
  const { active: currentMode } = useSelector(state => state && state.mode);

  const largeRowTemplate = (
    <tr
      onClick={() => handleClick(StudyInstanceUID)}
      className={classNames({ active: isHighlighted })}
      style={{ color: currentMode === 'brain' ? 'black' : 'white' }}
    >
      <td
        className={classNames({ 'empty-value': !PatientName })}
        style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}
      >
        {PatientName || `(${t('Empty')})`}
      </td>
      <td style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}>
        {PatientID}
      </td>
      <td style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}>
        {AccessionNumber}
      </td>
      <td style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}>
        {StudyDate}
      </td>
      <td
        className={classNames({ 'empty-value': !modalities })}
        style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}
      >
        {modalities || `(${t('Empty')})`}
      </td>
      <td style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}>
        {StudyDescription}
      </td>
    </tr>
  );

  const mediumRowTemplate = (
    <tr
      onClick={() => handleClick(StudyInstanceUID)}
      className={classNames({ active: isHighlighted })}
      style={{ color: currentMode === 'brain' ? 'black' : 'white' }}
    >
      <td
        className={classNames({ 'empty-value': !PatientName })}
        style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}
      >
        {PatientName || `(${t('Empty')})`}
        <div style={{ color: '#60656f' }}>{PatientID}</div>
      </td>
      <td style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* DESCRIPTION */}
          <div
            className="hide-xs"
            style={{
              whiteSpace: 'pre-wrap',
              flexGrow: 1,
            }}
          >
            {StudyDescription}
          </div>

          {/* MODALITY & ACCESSION */}
          {/* <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '80px',
              width: '80px',
            }}
          >
            <div
              className={classNames({
                modalities: modalities,
                'empty-value': !modalities,
              })}
              aria-label={modalities}
              title={modalities}
            >
              {modalities || `(${t('Empty')})`}
            </div>
            <div
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              aria-label={AccessionNumber}
              title={AccessionNumber}
            >
              {AccessionNumber}
            </div>
          </div> */}
        </div>
      </td>
      <td
        className="hide-xs"
        style={{ backgroundColor: currentMode === 'brain' ? 'white' : '' }}
      >
        {AccessionNumber}
      </td>

      {/* DATE */}
      <td
        style={{
          textAlign: 'left',
          backgroundColor: currentMode === 'brain' ? 'white' : '',
        }}
      >
        {StudyDate}
      </td>
    </tr>
  );

  const smallRowTemplate = (
    <tr
      onClick={() => handleClick(StudyInstanceUID)}
      className={classNames({ active: isHighlighted })}
      style={{ color: currentMode === 'brain' ? 'black' : 'white' }}
    >
      <td style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* NAME AND ID */}
          <div
            className={classNames({ 'empty-value': !PatientName })}
            style={{ width: '150px', minWidth: '150px' }}
          >
            <div style={{ fontWeight: 500, paddingTop: '3px' }}>
              {PatientName || `(${t('Empty')})`}
            </div>
            <div style={{ color: '#60656f' }}>{PatientID}</div>
          </div>

          {/* DESCRIPTION */}
          <div
            className="hide-xs"
            style={{
              whiteSpace: 'pre-wrap',
              flexGrow: 1,
              paddingLeft: '35px',
            }}
          >
            {StudyDescription}
          </div>

          {/* MODALITY & DATE */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '80px',
              width: '80px',
            }}
          >
            <div
              className={classNames({
                modalities: modalities,
                'empty-value': !modalities,
              })}
              aria-label={modalities}
              title={modalities}
            >
              {modalities || `(${t('Empty')})`}
            </div>
            <div>{StudyDate}</div>
          </div>
        </div>
      </td>
    </tr>
  );

  const rowTemplate = getContentFromUseMediaValue(
    displaySize,
    {
      large: largeRowTemplate,
      medium: mediumRowTemplate,
      small: smallRowTemplate,
    },
    smallRowTemplate
  );

  return rowTemplate;
}

TableRow.propTypes = {
  AccessionNumber: PropTypes.string.isRequired,
  isHighlighted: PropTypes.bool,
  modalities: PropTypes.string,
  PatientID: PropTypes.string.isRequired,
  PatientName: PropTypes.string.isRequired,
  StudyDate: PropTypes.string.isRequired,
  StudyDescription: PropTypes.string.isRequired,
  StudyInstanceUID: PropTypes.string.isRequired,
  displaySize: PropTypes.string,
};

TableRow.defaultProps = {
  isHighlighted: false,
};

export { StudyList };
