import { IconAbsence, IconAnnualVacation, IconAttendanceException, IconBenefits, IconFingerPrint, IconLate, IconLocation, IconMission, IconMissedAttendanceRequest, IconPartialDayLeave, IconPartialDayLeaveCard, IconVacationTransaction } from "../assets/IconsSvg";


export const WidgetsDashboard = {
    RequestTransactions: [
        {
            keyPage: "VacationTransaction",
            icon: IconVacationTransaction,
            RouterPage: 'VacationTransaction/0'
        },
        {
            keyPage: "Mission",
            icon: IconMission,
            RouterPage: 'Mission/0'

        },
        {
            keyPage: "PartialDayLeave",
            icon: IconPartialDayLeave,
            RouterPage: 'PartialDayLeave/0'

        },
        {
            keyPage: "AttendanceException",
            icon: IconAttendanceException,
            RouterPage: 'AttendanceException/0'

        },
        {
            keyPage: "MissedAttendanceRequest",
            icon: IconMissedAttendanceRequest,
            RouterPage: 'MissedAttendanceRequest/0'

        },
        {
            keyPage: "Benefits",
            icon: IconBenefits,
            RouterPage: 'Benefits/0'

        },
    ],
    summary: [
        {
            title: "absence",
            icon: IconAbsence,
            isSelfService: true,
            urlApi:
                "EmployeeSelfServiceDashboard/GetEmployeeCurrentMonthAttendanceStatistics",
            component: "WidgetCounter",
            typeCounter: "single",
            firstkeyValue: "totalAbsenceDays",
            classNameIcon: "success",
            firstLabel: "days",
            firstPage: "General",
            formated: "month",
        },
        {
            title: "late",
            isSelfService: true,
            icon: IconLate,
            urlApi:
                "EmployeeSelfServiceDashboard/GetEmployeeCurrentMonthAttendanceStatistics",
            component: "WidgetCounter",
            typeCounter: "single",
            firstkeyValue: "totalLateComeHoursAfterCalculation",
            classNameIcon: "warning",
            firstLabel: "days",
                        firstPage: "General",

            formated: "month",
        },
        {
            title: "partialDayLeave",
            icon: IconPartialDayLeaveCard,
            isSelfService: true,
            urlApi: "EmployeeSelfServiceDashboard/GetEmployeePartialDayLeaveCard",
            component: "WidgetCounter",
            typeCounter: "single",
            firstkeyValue: "totalTaken",
            firstLabel: "taken",
            classNameIcon: "title",
            fullWidth: true,
            formated: "month",
        },
        {
            title: "annualVacation",
            icon: IconAnnualVacation,
            isSelfService: true,
            urlApi:
                "EmployeeSelfServiceDashboard/GetEmployeeAnnualVacationBalanceSummary",
            component: "WidgetCounter",
            typeCounter: "single",
            firstkeyValue: "used",
            firstLabel: "taken",
            secendkeyValue: "remainder",
            secendLabel: "remaining",
            classNameIcon: "error",
            formated: "year",
            fullWidth: true,
        },



    ]
}