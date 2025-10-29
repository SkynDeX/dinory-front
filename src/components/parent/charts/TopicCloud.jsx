import React from "react";
import './TopicCloud.css';

function TopicCloud({ topics }) {
    if (!topics || topics.length === 0) return null;

    return(
        <div className="topic_cloud_wrapper">
            {topics.map((topic, idx) => (
                <span
                    key={idx}
                    className="topic_bubble"
                    style={{ fontSize: `${topic.size}px`}}
                >
                    {topic.text}
                </span>
            ))}
        </div>
    );
}

export default TopicCloud;