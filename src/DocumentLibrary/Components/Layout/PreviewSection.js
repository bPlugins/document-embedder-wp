import React from 'react';
import './ContentSection.scss';
import { SeeLive } from '../../Utils/icons';

const PreviewSection = ({ children }) => {

    return (
        <div className="vfd-preview-box">
            <div className="vfd-section-header"><SeeLive /> Live Preview</div>

            <div className="vfd-section-content">
                {children}
            </div>
        </div>
    )
}

export default PreviewSection;