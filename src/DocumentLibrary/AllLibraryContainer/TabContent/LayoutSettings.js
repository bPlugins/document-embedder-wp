import _get from 'lodash/get';
import ToggleControl from '../../Fields/ToggleControl/ToggleControl';
import RangeControl from '../../Fields/RangeControl/RangeControl';
import Color from '../../Fields/Color/Color';
import Colors from '../../Fields/Colors/Colors';
import Choice from '../../Fields/Choice/Choice';
import ContentHeader from '../../Components/Shared/Shared/ContentHeader';
import './LayoutSettings.scss';

const path = 'settings.templates.list';

/** The List layout's own settings (the "List Rows" tab). */
export const ListRowsSettings = ({ formData, onFormDataUpdate }) => {
  const get = (key) => _get(formData, `${path}.${key}`);
  const set = (key) => (val) => onFormDataUpdate(`${path}.${key}`, val);
  const radius = Number(get('borderRadius'));

  return (
    <>
      <ContentHeader title="Rows" />
      <Choice
        title="Density"
        value={get('density')}
        onChange={set('density')}
        options={[
          { value: 'comfortable', label: 'Comfortable' },
          { value: 'compact', label: 'Compact' },
        ]}
        help="Compact fits more rows on screen and hides descriptions."
      />
      <ToggleControl title="Show Description" value={get('showDescription')} onChange={set('showDescription')} />
      <ToggleControl title="Show File Type" value={get('showType')} onChange={set('showType')} />
      <ToggleControl title="Show Author" value={get('showAuthor')} onChange={set('showAuthor')} />
      <p className="bpldl-field-note">
        Icon, size, date and the View and Download buttons (including their text) are set in the Document Box tab.
      </p>

      <ContentHeader title="Row Style" />
      <Colors title="Row Background" value={get('rowBg') || {}} onChange={set('rowBg')} />
      <p className="bpldl-field-note">
        Leave the normal colour transparent to show the Library Container background behind the list.
      </p>
      <Color isHeader={true} title="Divider Color" value={get('dividerColor')} onChange={set('dividerColor')} />
      <RangeControl
        title="Border Radius"
        value={Number.isFinite(radius) ? radius : 10}
        onChange={set('borderRadius')}
        min={0}
        max={40}
        help="Corner radius of the list in PX"
      />
    </>
  );
};
