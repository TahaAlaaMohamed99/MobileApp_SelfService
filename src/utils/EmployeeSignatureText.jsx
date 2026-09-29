// Maps an employeeSignature "font key" (as returned by the WorkFlowTransactionLog
// API when employeeSignatureType is a text signature, not an image) to the
// matching RN fontFamily registered in app/_layout.jsx (SignatureFonts).
// NOTE: the exact key format sent by the API hasn't been confirmed against the
// web app's EmployeeSignatureText util (source wasn't available while porting) —
// this mapping is a best-effort guess from the bundled font filenames and should
// be verified against real workflow-log data.
const SIGNATURE_FONTS = [
  { key: 1, label: 'Californian' },
  { key: 2, label: 'Caveat' },
  { key: 3, label: 'Cintarini' },
  { key: 4, label: 'Dalton White' },
  { key: 5, label: 'DancingScript' },
  { key: 6, label: 'Eagle Horizon' },
  { key: 7, label: 'Humble' },
  { key: 8, label: 'Signatie' },
  { key: 9, label: 'Bastliga One' },
  { key: 10, label: 'Brittany Signature Script' },
  { key: 11, label: 'Jalliya' },
  { key: 12, label: 'Priestacy' },
  { key: 13, label: 'Rapilot' },
  { key: 14, label: 'Thesignature' },
  { key: 15, label: 'Arslan Wessam B' },
  { key: 16, label: 'Leila Light' },
  { key: 17, label: 'Sayeh' },
  { key: 18, label: 'Tharwat Emara Modern Regular' },
  { key: 19, label: 'Rzgar' },
  { key: 20, label: 'B Fatemi' },
  { key: 21, label: 'Alnaqaya S' },
  { key: 22, label: 'Dima Ravan Nevis' },
];

export const EmployeeSignatureText = (signatureKey) => {
  if (!signatureKey && signatureKey !== 0) return null;
  const font = SIGNATURE_FONTS.find((item) => item.key == signatureKey || item.label === signatureKey);
  return font ? { label: font.label } : null;
};

export default EmployeeSignatureText;
