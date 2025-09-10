import { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, X } from 'lucide-react';
import { technologies } from '../constants';
import { TechIconWithFallback } from './TechIcon';
import type { Technology } from '../types';

interface TechnologyItemProps {
  technology: Technology;
  isSpacePressed?: boolean;
}

interface TechnologyPanelProps {
  onArrangeHierarchy?: () => void;
  onArrangeCircular?: () => void;
  isSpacePressed?: boolean;
}

function TechnologyItem({ technology, isSpacePressed = false }: TechnologyItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tech-${technology.id}`,
    data: { technology },
    disabled: isSpacePressed // Disable dragging when Space is pressed
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="technology-item"
      data-technology-id={technology.id}
      data-dragging={isDragging}
    >
      <div
        className="tech-icon"
        style={{
          backgroundColor: technology.color,
          boxShadow: `0 0 0 2px ${technology.color}60, 0 2px 8px rgba(0, 0, 0, 0.3)`,
          border: `1px solid ${technology.color}80`
        }}
      >
        <TechIconWithFallback technology={technology} size={20} />
      </div>
      <span className="tech-name">{technology.name}</span>
    </div>
  );
}

export function TechnologyPanel({ onArrangeHierarchy, onArrangeCircular, isSpacePressed = false }: TechnologyPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(technologies.map(tech => tech.category))];
    return ['All', ...uniqueCategories.sort()];
  }, []);

  // Filter technologies based on search and category
  const filteredTechnologies = useMemo(() => {
    return technologies.filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tech.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || tech.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="technology-panel">
      <h3>Technologies</h3>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Technology List */}
      <div className="technology-list">
        {filteredTechnologies.length > 0 ? (
          filteredTechnologies.map((tech) => (
            <TechnologyItem key={tech.id} technology={tech} isSpacePressed={isSpacePressed} />
          ))
        ) : (
          <div className="no-results">
            <p>No technologies found</p>
            <p className="no-results-hint">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="results-count">
        {filteredTechnologies.length} of {technologies.length} technologies
      </div>

      {/* Layout Controls */}
      <div className="sidebar-layout-controls">
        <button
          className="layout-btn hierarchy-btn"
          onClick={onArrangeHierarchy}
          title="Arrange in hierarchy (parent-child)"
        >
          📊 Hierarchy
        </button>
        <button
          className="layout-btn circular-btn"
          onClick={onArrangeCircular}
          title="Arrange in circular layout"
        >
          🔄 Circular
        </button>
      </div>
    </div>
  );
}
