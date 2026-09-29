import {
  IconDashboard,
  IconVacationTransaction,
  IconCalendar,
  IconFingerPrint,
  IconMission,
  IconPartialDayLeave,
  IconAttendanceException,
  IconBenefits,
  IconAttendance,
  IconPaySlip,
  IconMissedAttendanceRequest,
} from '../assets/IconsSvg';

export const Pages = [
  { keyPage: 'EmployeeMonthlyAttendanceSelfservice', headerShown: false, icon: IconAttendance },
  { keyPage: 'Dashboard', headerShown: false, showBottomNavigation: true, icon: IconDashboard },
  { keyPage: 'FingerPrint', showBottomNavigation: true, headerShown: false, icon: IconFingerPrint },
  { keyPage: 'VacationTransaction', headerShown: false, icon: IconVacationTransaction },
  { keyPage: 'Schedule', headerShown: false, showBottomNavigation: true, icon: IconCalendar },
  { keyPage: 'AttendanceException', headerShown: false, icon: IconAttendanceException, },
  { keyPage: 'Mission', headerShown: false, icon: IconMission },
  { keyPage: 'PartialDayLeave', headerShown: false, icon: IconPartialDayLeave },
  { keyPage: 'Benefits', headerShown: false, showBottomNavigation: false, icon: IconBenefits, },
  { keyPage: 'Payslip', headerShown: false, showBottomNavigation: true, icon: IconPaySlip },
  { keyPage: 'MissedAttendanceRequest', headerShown: false, icon: IconMissedAttendanceRequest },
];
