import './Settings.scss';
import General from './TabContent/General';

/**
 * The settings column.
 *
 * The group nav used to live here as a 196px vertical sidebar. It is now a tab
 * strip rendered by the editor shell, so the active group arrives as a prop and
 * this component is only responsible for the panel body.
 */
const SettingsPanel = ({ formData, isPremium, onFormDataUpdate, openProModal, activeSettings }) => {
  return (
    <div className="settings-panel">
      <div className="content-area">
        <General
          formData={formData}
          onFormDataUpdate={onFormDataUpdate}
          isPremium={isPremium}
          openProModal={openProModal}
          activeSettings={activeSettings}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
