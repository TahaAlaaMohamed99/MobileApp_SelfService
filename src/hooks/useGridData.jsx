import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getApi } from '../services/Api';
import Generallist from '../ConfigData/Generallist.json';
import Resources from '../resources.json';
import useToast from './useToast';
import { formatDateOnlyForAPI } from './useFormatDate';

const useGridData = (
  ApiGet,
  gridList,
  setDataGrid,
  setIsLoading,
  isTree,
  treeKeys,
  keyEnum,
  isPagination,
  setReplayFetch,
  isColumnsEdit,
  Editscolumns,
  editColumnsLabel,
) => {
  const api = getApi();
  const toast = useToast();
  const [totalRow, setTotalRow] = useState(0);
  const [dimensionsColumns, setDimensionsColumns] = useState([]);
  const [editsColumns, seteditsColumns] = useState([]);
  const currentLanguage = useSelector((state) => state.themeSlice.currentLanguage);
  const ReduxResources = useSelector((state) => state.resourcesSlice.ReduxResources);

  const buildTree = (data) => {
    const structuredData = data.map((item) => ({
      ...item,
      children: [],
      isChildren: false,
    }));

    const tree = [];

    structuredData.forEach((item) => {
      const parent = structuredData.find(
        (potentialParent) =>
          potentialParent[treeKeys.keyId] === item[treeKeys.ReportToRecId] &&
          potentialParent[treeKeys.keyId] !== item[treeKeys.keyId],
      );

      if (parent) {
        parent.children.push(item);
      } else {
        tree.push(item);
      }
    });

    structuredData.forEach((item) => {
      item.isChildren = item.children.length > 0;
    });

    return tree;
  };

  const mapDimensions = (item) => {
    if (!item?.dimensions) return item;

    const mapped = Object.fromEntries(
      item.dimensions.map((d) => [
        d?.dimensionEnName || d?.dimensionName,
        currentLanguage === 'ar'
          ? d.dimensionValueArName
          : d?.dimensionValueEnName || d?.dimensionValueName,
      ]),
    );

    return { ...item, ...mapped };
  };

  const mapEditsColumn = (item) => {
    if (!item[Editscolumns]) return item;

    const mapped = Object.fromEntries(
      item[Editscolumns].map((d) => [
        d[editColumnsLabel.key],
        d[editColumnsLabel.value],
      ]),
    );
    const mappedOld = Object.fromEntries(
      item[Editscolumns].map((d) => [
        `old${d[editColumnsLabel.key]}`,
        d[editColumnsLabel.oldValue],
      ]),
    );
    const mappedTitles = Object.fromEntries(
      item[Editscolumns].map((d) => [
        `${d[editColumnsLabel.labelKey]}`,
        d[editColumnsLabel.labelKey],
      ]),
    );

    return { ...item, ...mapped, ...mappedOld, ...mappedTitles };
  };

  const mapGeneralList = (item) => {
    if (!gridList) return item;

    Object.keys(item).forEach((key) => {
      if (gridList[key]) {
        const list = Generallist[gridList[key]];
        const match = list?.find((entry) => entry.value === item[key]);
        const generalTitle =
          ReduxResources?.Generallist[gridList[key]]?.values ||
          Resources?.Generallist[gridList[key]]?.values;
        if (match) {
          const title = generalTitle
            ? generalTitle[match.label]?.[currentLanguage]
            : ReduxResources[match.label]?.title?.[currentLanguage] ||
              Resources[match.label]?.title?.[currentLanguage] ||
              match.label;

          if (title) {
            item[`${key}Name`] = title;
          }
        }
      }
    });

    return item;
  };

  const extractDimensionsColumns = (data) => {
    const seen = new Set();

    const dataArray = Array.isArray(data) ? data : [data];

    return dataArray
      .flatMap((item) => item.dimensions || [])
      .filter((d) => {
        const key = d.dimensionEnName || d.dimensionName;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((d) => ({
        key: d.dimensionEnName || d.dimensionName,
        title:
          currentLanguage === 'ar'
            ? d.dimensionArName || d.dimensionName
            : d.dimensionEnName || d.dimensionName,
        width: 250,
        isDimension: true,
        import: false,
        minwidth: 150,
      }));
  };

  const extractEditscolumns = (data) => {
    const seen = new Set();

    const dataArray = Array.isArray(data) ? data : [data];

    return dataArray
      .flatMap((item) => item[Editscolumns] || [])
      .filter((d) => {
        const key = d[editColumnsLabel.key];
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((d) => ({
        key: d[editColumnsLabel?.key],
        title: d[editColumnsLabel.labelKey],
        oldkey: `old${d[editColumnsLabel?.key]}`,
        width: editColumnsLabel?.width || 200,
        isEdit: true,
        minwidth: 150,
        showInfo: editColumnsLabel?.showInfo || false,
      }));
  };

  const fetchGridData = async (
    PageNumber,
    PageSize,
    valuesFilters = null,
    LineRecId = 0,
  ) => {
    setIsLoading(true);
    setDimensionsColumns([]);
    const basePath = ApiGet.split('/')[0];
    const apiFilterData = `${basePath}/FilterData${
      isPagination != false ? '?' : ''
    }`;
    const apiFilterLineData = `${basePath}/FilterDataLine?ParentRecId=${LineRecId}${
      isPagination != false ? '&' : ''
    }`;
    const queryParams = [
      PageNumber && isPagination != false ? `pageNumber=${PageNumber}` : null,
      PageSize && isPagination != false ? `pageSize=${PageSize}` : null,
      keyEnum && valuesFilters == null ? `type=${keyEnum}` : null,
    ]
      .filter(Boolean)
      .join('&');

    const apiUrl = `${
      valuesFilters
        ? LineRecId > 0
          ? apiFilterLineData
          : apiFilterData
        : ApiGet
    }${queryParams}`;
    try {
      const response = valuesFilters
        ? await api.post(apiUrl, valuesFilters)
        : await api.get(apiUrl);
       if (response != 404) {
        const sourceData = response?.data?.data || response.data || response;
        let updatedData;
        if (sourceData) {
          updatedData = sourceData.map(mapDimensions).map(mapGeneralList);
        }

        if (isTree) {
          updatedData = buildTree(updatedData);
        }
        if (isColumnsEdit) {
          updatedData = updatedData.map(mapEditsColumn);

          const allEditsColumns = extractEditscolumns(updatedData);
          seteditsColumns(allEditsColumns);
        }

        const allDimensions = extractDimensionsColumns(updatedData);
        if (allDimensions.length > 0) {
          setDimensionsColumns(allDimensions);
        }
        setDataGrid(updatedData);
        setTotalRow(response?.data?.total || response.total);
      } else {
        setDataGrid([]);
        setTotalRow(0);
      }
    } catch (error) {
      setDataGrid([]);
      setTotalRow(0);
      if (error.status != 404) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
      if (setReplayFetch) {
        setReplayFetch(false);
      }
    }
  };

  const fetchCalendarScheduleData = async (
    fromDate,
    toDate,
    pageNumber,
    pageSize,
  ) => {
    setIsLoading(true);

    try {
      const response = await api.get(
        `${ApiGet}${pageNumber ? '?' : '&'}fromDate=${formatDateOnlyForAPI(fromDate)}&toDate=${formatDateOnlyForAPI(toDate)}${
          pageNumber ? `&pageNumber=${pageNumber}` : ''
        }${pageSize ? `&pageSize=${pageSize}` : ''}`,
      );
      if (response != 404) {
        const sourceData = response?.data?.data || response.data;
        setDataGrid(sourceData);
        setTotalRow(response?.data?.total || response.total);
      } else {
        setDataGrid([]);
      }
    } catch (error) {
      setDataGrid([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    totalRow,
    fetchGridData,
    fetchCalendarScheduleData,
    dimensionsColumns,
    mapGeneralList,
    editsColumns,
  };
};

export default useGridData;
