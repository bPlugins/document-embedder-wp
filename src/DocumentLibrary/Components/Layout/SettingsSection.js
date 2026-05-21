import React from 'react';
import './ContentSection.scss';
import { Settings } from '../../Utils/icons';



const SettingsSection = ({ children }) => {

    return (
        <>
            <div className="vfd-settings-section">
                <div className="vfd-section-header">
                    <Settings />
                    Settings
                </div>
                <div className="vfd-section-content">
                    {children}
                </div >
            </div >
        </>
    )
}

export default SettingsSection;