import React from 'react';
import { MapPin, Calendar, MessageCircle, ArrowUpRight, CloudOff } from 'lucide-react';
import { LostFindItem } from '../../types';
import {
  formatDate,
  getCategoryColor,
  getStatusBadge,
  formatWhatsAppUrl,
  truncate,
} from '../../utils/helpers';

interface ItemCardProps {
  item: LostFindItem;
  onSelect: (item: LostFindItem) => void;
  index?: number;
  variant?: 'default' | 'compact';
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  index = 0,
  variant = 'default',
}) => {
  const catColor = getCategoryColor(item.category);
  const statusBadge = getStatusBadge(item.status);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = formatWhatsAppUrl(item.contactPhone, item.title, item.type);
    window.open(url, '_blank');
  };

  return (
    <article
      className={`trip-card trip-card--${variant}`}
      style={{ '--stagger-i': index } as React.CSSProperties}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Visual Box with Floating Top-Right Pill (Tripco Style) */}
      <div className="trip-card__media">
        <img
          src={item.imageUrl || '/presets/ktm.svg'}
          alt={item.title}
          className="trip-card__img"
          loading="lazy"
        />
        <div className="trip-card__shimmer" aria-hidden="true" />

        {/* Top-Left Category Pill + Pending Sync Pill */}
        <div className="trip-card__left-floats">
          <span
            className="trip-card__cat-float"
            style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              color: catColor.text,
            }}
          >
            {item.category}
          </span>
          {item.pendingSync && (
            <span
              className="pending-sync-tag"
              title="Tersimpan di browser lokal, akan otomatis di-upload ke database saat online"
            >
              <CloudOff size={11} />
              <span>Menunggu Sync</span>
            </span>
          )}
        </div>

        {/* Top-Right Status / Type Floating Badge (like Tripco rating pill) */}
        <span
          className={`trip-card__status-float ${
            item.type === 'lost' ? 'status-float--lost' : 'status-float--found'
          }`}
        >
          <span className="pulse-dot" />
          {item.type === 'lost' ? 'Hilang' : 'Temuan'}
        </span>
      </div>

      {/* Body */}
      <div className="trip-card__body">
        <div className="trip-card__title-row">
          <h3 className="trip-card__title">{item.title}</h3>
          <span
            className="trip-card__callout"
            style={{ color: statusBadge.text }}
          >
            {item.status === 'open'
              ? item.type === 'lost'
                ? 'Dicari'
                : 'Di Posko'
              : item.status === 'claimed'
              ? 'Diklaim'
              : 'Kembali'}
          </span>
        </div>

        {variant === 'default' && (
          <p className="trip-card__desc">{truncate(item.description, 72)}</p>
        )}

        <div className="trip-card__meta">
          <div className="trip-meta-line">
            <MapPin size={14} className="trip-meta-icon" />
            <span>{item.location}</span>
          </div>
          {variant === 'default' && (
            <div className="trip-meta-line">
              <Calendar size={14} className="trip-meta-icon" />
              <span>
                {formatDate(item.date)} • {item.time}
              </span>
            </div>
          )}
        </div>

        {variant === 'default' && (
          <div className="trip-card__footer">
            <div className="trip-reporter">
              <span className="trip-reporter__avatar">
                {item.contactName.charAt(0).toUpperCase()}
              </span>
              <span className="trip-reporter__name">{item.contactName}</span>
            </div>

            <div className="trip-card__actions">
              <button
                type="button"
                className="btn-wa-pill"
                onClick={handleWhatsAppClick}
                title={`Hubungi ${item.contactName} via WhatsApp`}
              >
                <MessageCircle size={14} />
                <span>Chat</span>
              </button>
              <span className="trip-arrow-btn" aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
