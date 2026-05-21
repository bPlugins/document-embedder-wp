import './SectionTitle.scss';

const SectionTitle = ({icon, title = "Your Section Title"}) => {
  return (
    <div className="section-title">
      <span>{icon}</span>
      <h3>{title}</h3>
    </div>
  )
}

export default SectionTitle;