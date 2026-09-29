/**
 * Shared column builders for MegaGrid/CommonLog DataPage configs.
 * Column shape matches useFormatCell.jsx / MegaGridCard.jsx (key, title, type,
 * ResourcePage/generallist, isFilter, isHeaderMobile, import, ...).
 * isFilter defaults to true in MegaGridContext, so it's only set here where false.
 */

export const ColumnCode = ({ key = 'code', ...rest } = {}) => ({
  key,
  title: 'code',
  ResourcePage: 'GeneralField',
  import: false,
  ...rest,
});

export const StatusColumn = ({
  key = 'statusName',
  secondKey = 'status',
  generallist = 'WorkflowStatus',
  StatusList,
} = {}) => ({
  key,
  title: 'titleGrid',
  generallist,
  secondKey,
  type: 'status',
  isHeaderMobile: true,
  isHideTitleCard: true,
  StatusList,
  import: false,
});

export const FromToDateColumns = ({ fromKey = 'fromDate', toKey = 'toDate', type = 'date' } = {}) => ([
  {
    key: fromKey,
    title: 'fromDate',
    ResourcePage: 'GeneralField',
    type,
    rowGroup: "FromToDateColumns",
  },
  {
    key: toKey,
    title: 'toDate',
    ResourcePage: 'GeneralField',
    type,
    rowGroup: "FromToDateColumns",
  },
]);
export const nameTransaction = ({ } = {}) => ({
  key: "name",
  title: "description",
  ResourcePage: "GeneralTransaction",
  isFilter: true,
  keySendToImport: "name",
});

export const HeaderTransactionsColumn = ({
  codeKey = 'code',
  key = 'vacationCategoryName',
  keyRecId = 'vacationCategoryRecId',
  lookupName = 'VacationCategory',
  keyGetLookup,
  title = 'title',
  ResourcePage = 'VacationCategory',
  isfixed = true,
  isHideTitleCard = true,
  isHeaderMobile = true,
  isCellAvatar = true,
  isCellAvatarText = false,
  ModalContent = true,
  cantHide = true,
} = {}) => ([
  {
    key: codeKey,
    title: 'code',
    ResourcePage: 'GeneralField',
    hiddenShow: true,

  },
  {
    key,
    title,
    ResourcePage,
    lookupName,
    keyGetLookup,
    keyRecId,
    secondKeyText: codeKey,
    fixed: isfixed,
    ModalContent,
    cantHide,
    isHideTitleCard,
    isHeaderMobile,
    isCellAvatar,
    isCellAvatarText,
  },
  StatusColumn(),
]);

// Like HeaderTransactionsColumn, but for a header-style field backed by a static
// `generallist` (e.g. MissionSubTypes) instead of a `lookupName`+`keyRecId` entity lookup.
export const HeaderGenerallistColumn = ({
  codeKey = 'code',
  key,
  generallist,
  title = 'title',
  ResourcePage,
  isfixed = true,
} = {}) => ([
  {
    key: codeKey,
    title: 'code',
    ResourcePage: 'GeneralField',
    hiddenShow: true,


  },
  {
    key,
    title,
    ResourcePage,
    generallist,
    secondKeyText: codeKey,
    fixed: isfixed,
    ModalContent: true,
    cantHide: true,
    isHideTitleCard: true,
    isHeaderMobile: true,
    isCellAvatar: true,
    isCellAvatarText: false,
  },
  StatusColumn(),
]);

export const JobColumn = ({ key = 'positionJobName' } = {}) => ({
  key,
  title: 'job',
  ResourcePage: 'informationEmployee',
  import: false,
});

export const DepartmentColumn = ({ key = 'departmentName' } = {}) => ({
  key,
  title: 'department',
  ResourcePage: 'informationEmployee',
  import: false,
});

export const TransactionsDetailsColumns = ({
  keyExecution = 'executionDate',
  keyTrans = 'transDate',
  ResourcePage = 'GeneralTransaction',
} = {}) => ([
  {
    key: keyExecution,
    title: 'executionDate',
    ResourcePage,
    type: 'date',
    isFilter: true,
  },
  {
    key: keyTrans,
    title: 'transDate',
    ResourcePage,
    type: 'date',
    isFilter: true,
  },
]);

export const AuditTransactionColumns = ({ ResourcePage = 'GeneralTransaction' } = {}) => ([
  {
    key: 'createdByName',
    mergKey: 'createdByEmployeeName',
    title: 'createdBy',
    keyId: 'createdBy',
    ResourcePage,
    isFilter: true,
    import: false,
    secondKey: 'createdOn',
    secondKeyForamt: 'dateMonthTime',
    isMergedDesign: true,
  },
  {
    key: 'modifiedByName',
    mergKey: 'modifiedByEmployeeName',
    title: 'modifiedBy',
    keyId: 'modifiedBy',
    ResourcePage,
    isFilter: true,
    import: false,
    secondKey: 'modifiedOn',
    secondKeyForamt: 'dateMonthTime',
    isMergedDesign: true,
  },
  {
    key: 'postedByName',
    mergKey: 'postedByEmployeeName',
    title: 'postedBy',
    keyId: 'postedBy',
    ResourcePage,

    secondKey: 'postedOn',
    secondKeyForamt: 'dateMonthTime',
    isMergedDesign: true,
  },
]);


export const ColumnCreatedOn = () => ({
  key: 'createdOn',
  title: 'createdOn',
  ResourcePage: 'GeneralField',
  type: 'dateMonthTime',
  import: false,
});

export const noteColumn = {
  key: 'note',
  title: 'note',
  ResourcePage: 'GeneralField',
  width: 200,
  maxWidth: 220,
  isFilter: true,
};

export const hideWhenColumnEmployeeMonthlyAttendance = [
  { columnKey: "dayStatus", values: [2, 3, 4] },
  { columnKey: "hasVacation", values: [2] }
]

export const HeaderNamePrimaryColumn = ({
  codeKey = 'code',
  nameKey = 'name',
  nameResourcePage,
  isPrimaryKey = 'isPrimaryName',
  isPrimarySecondKey = 'isPrimary',
  StatusList,
  isHeaderMobile = true,
  isHideTitleCard = true,
} = {}) => ([
  {
    key: codeKey,
    title: 'code',
    ResourcePage: 'GeneralField',
    hiddenShow: true,

  },
  {
    key: nameKey,
    title: 'title',
    secondKeyText: codeKey,
    fixed: true,
    ModalContent: true,
    cantHide: true,
    isHideTitleCard: true,
    isHeaderMobile: true,
    isCellAvatar: true,
    isCellAvatarText: false,
  },
  {
    key: isPrimaryKey,
    title: 'primary',
    generallist: 'NoYes',
    secondKey: isPrimarySecondKey,
    StatusList: StatusList || { NoYes: ['No', 'Yes'] },
    type: 'status',
    isFilter: true,
    isHeaderMobile,
    isHideTitleCard,
  },
]);