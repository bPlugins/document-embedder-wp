import React from "react";
import "./Skeleton.scss";

const SkeletonHeader = () => (
  <div className="skeleton-header">
    <div className="skeleton skeleton-heading"></div>
    <div className="skeleton skeleton-subheading"></div>
  </div>
);

const SkeletonSearch = () => (
  <div className="skeleton-search">
    <div className="skeleton skeleton-input"></div>
    <div className="skeleton skeleton-select"></div>
    <div className="skeleton skeleton-select"></div>
  </div>
);

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-icon"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
    <div className="skeleton-buttons">
      <div className="skeleton skeleton-btn"></div>
      <div className="skeleton skeleton-btn"></div>
    </div>
  </div>
);

const SkeletonGrid = ({ count = 2, isHeader = false, isSearch = false }) => {
  return (
    <div className="skeleton-wrapper">
      {isHeader && <SkeletonHeader />}
      {isSearch && <SkeletonSearch />}
      <div className="skeleton-grid">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;
