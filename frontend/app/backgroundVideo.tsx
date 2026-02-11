import React from 'react';

const BackgroundVideo = () => {
    return (
        <div className="fixed top-0 w-full h-full -z-10 overflow-hidden">
            <video src="/videos/Video%20Reqal%20Background.mp4" autoPlay muted loop className="object-cover w-full h-full "></video>
            <div className="bg-black/50 w-full h-full absolute top-0 left-0"></div>
        </div>
    );
};

export default BackgroundVideo;