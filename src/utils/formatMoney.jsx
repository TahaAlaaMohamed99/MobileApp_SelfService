const formatMoney = (value, language = 'en') => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '';
  }

  return new Intl.NumberFormat(
    language === 'en' ? 'en-US' : 'ar-EG',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(number);
};

export default formatMoney;