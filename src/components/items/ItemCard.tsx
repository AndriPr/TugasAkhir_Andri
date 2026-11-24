import React from 'react';
import { MapPin, Calendar, MessageCircle, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { LostFindItem } from '../../types';
import { formatDate, getCategoryColor, getStatusBadge, formatWhatsAppUrl, truncate } from '../../utils/helpers';

interface ItemCardProps {
  item: LostFindItem;
  onSelect: (item: LostFindItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect }) => {
  const catColor = getCategoryColor(item.category);
  const statusBadge = getStatusBadge(item.status);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = formatWhatsAppUrl(item.contactPhone, item.title, item.type);
    window.open(url, '_blank');
  };

  return (
    <div className="item-card" onClick={() => onSelect(item)} role="button" tabIndex={0}>
      {/* Thumbnail */}
      <div className="item-card__media">
        <img
          src={item.imageUrl || '/presets/ktm.svg'}
          alt={item.title}
          className="item-card__img"
          loading="lazy"
        />
        <div className="item-card__type-badge">
          {item.type === 'lost' ? (
            <span className="badge-tag badge-tag--lost">
              <AlertCircle size={12} /> HILANG
            </span>
          ) : (
            <span className="badge-tag badge-tag--found">
              <CheckCircle2 size={12} /> DITEMUKAN
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="item-card__body">
        <div className="item-card__top-meta">
          <span
            className="category-badge"
            style={{
              backgroundColor: catColor.bg,
              color: catColor.text,
              borderColor: catColor.border,
            }}
          >
            {item.category}
          </span>
          <span
            className="status-badge"
            style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
          >
            {statusBadge.label}
          </span>
        </div>

        <h3 className="item-card__title">{item.title}</h3>

        <p className="item-card__desc">{truncate(item.description, 75)}</p>

        {/* Location & Date */}
        <div className="item-card__details">
          <div className="detail-row">
            <MapPin size={14} className="detail-icon" />
            <span className="detail-text">{item.location}</span>
          </div>
          <div className="detail-row">
            <Calendar size={14} className="detail-icon" />
            <span className="detail-text">
              {formatDate(item.date)} • {item.time}
            </span>
          </div>
        </div>

        {/* Card Footer: Reporter info & Action Button */}
        <div className="item-card__footer">
          <div className="reporter-meta">
            <span className="reporter-label">{item.type === 'lost' ? 'Pelapor:' : 'Penemu:'}</span>
            <span className="reporter-name">{item.contactName}</span>
          </div>

          <div className="item-card__actions">
            <button
              type="button"
              className="btn-wa"
              onClick={handleWhatsAppClick}
              title={`Hubungi ${item.contactName} di WhatsApp`}
            >
              <MessageCircle size={16} />
              <span>Hubungi</span>
            </button>
            <div className="btn-detail-arrow">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
