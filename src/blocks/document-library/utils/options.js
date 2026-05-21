import { __ } from '@wordpress/i18n';

import { verticalLineIcon, horizontalLineIcon, LifeCirle, FileText, ThumbUp } from './icons';

export const layouts = [
    { label: __('Vertical', 'textdomain'), value: 'vertical', icon: verticalLineIcon },
    { label: __('Horizontal', 'textdomain'), value: 'horizontal', icon: horizontalLineIcon }
];

export const generalStyleTabs = [
    { name: 'general', title: __('General', 'live-code-snippet') },
    { name: 'style', title: __('Style', 'live-code-snippet') }
];

export const docSourceOptions = [
    { label: 'Library', value: "library" },
    { label: 'Google Drive', value: "googleDrive" },
    { label: 'Dropbox', value: "dropbox" }
]
export const viewerOptions = [
    { label: 'Google Doc Viewer', value: "google" },
    { label: 'Microsoft Online Viewer', value: "microsoft" },
    { label: 'JS Viewer', value: "js" }
];


export const proFeatures = [
    {
        name: "Google Drive",
        description: "Easily embed and view documents directly from your Google Drive."
    },
    {
        name: "Dropbox",
        description: "View Dropbox files in an embedded document viewer with ease."
    },
    {
        name: "File Name",
        description: "Display file name at top of you document."
    },
    {
        name: "Disable/Enable file download button",
        description: "Add you file download button for download your document easily."
    },
    {
        name: "Disable/Enable Right Click",
        description: "Enable/Disable right click on your document for better experiences."
    },
    {
        name: "Full Screen",
        description: "Enable full screen option for users."
    },
];


export const helpfulLinks = [
    {
        title: 'Need any Assistance?',
        description: 'Our Expert Support Team is always ready to help you out promptly.',
        icon: <LifeCirle />,
        link: 'https://bplugins.com/support',
        linkText: 'Contact Support'
    },
    {
        title: 'Looking for Documentation?',
        description: 'We have detailed documentation on every aspects of the plugin.',
        icon: <FileText />,
        link: 'https://office-viewer.bplugins.com/docs/',
        linkText: 'Documentation'
    },
    {
        title: 'Liked This Plugin?',
        description: 'Glad to know that, you can support us by leaving a 5 &#11088; rating.',
        icon: <ThumbUp />,
        link: 'https://wordpress.org/support/plugin/html5-video-player/reviews/#new-post',
        linkText: 'Rate the Plugin'
    }
];
