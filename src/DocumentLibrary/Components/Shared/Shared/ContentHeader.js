import './ContentHeader.scss';

const ContentHeader = ({ title = "Settings Header", icon = null }) => {
  return (
    <div className="vfd-settings-content-header">
      {icon && <span>{icon}</span>}
      <h2>{title}</h2>
    </div>
  );
};

export default ContentHeader;
