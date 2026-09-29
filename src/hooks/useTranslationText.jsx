import AllResources from '../resources.json';
import { toDisplayText } from '../utils/textUtils';

const useTranslationText = ({ page, title, titleGenerallist = false, lang, Resources = {} }) => {
  const resolvePath = (object, path) => {
    try {
      return path
        .split('?.')
        .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
    } catch (e) {
      return undefined;
    }
  };

  const fullPath = page
    ? titleGenerallist
      ? `Generallist?.${page}?.${title}`
      : `${page}?.${title}`
    : title;

  const translatedText =
    resolvePath(Resources, fullPath)?.[lang] ??
    resolvePath(AllResources, fullPath)?.[lang] ??
    title;

  return toDisplayText(translatedText, title == null ? '' : String(title));
};

export default useTranslationText;
