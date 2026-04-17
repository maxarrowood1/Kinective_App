import type { Theme, FontSize } from '../hooks/useSettings'
import { ACCENT_PRESETS } from '../hooks/useSettings'
import './SettingsModal.css'

interface Props {
  theme: Theme
  accent: string
  fontSize: FontSize
  onTheme: (t: Theme) => void
  onAccent: (name: string) => void
  onFontSize: (s: FontSize) => void
  onClose: () => void
  onSnowstorm: () => void
  snowing: boolean
  onDisco: () => void
  discoing: boolean
}

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="2" x2="14" y2="14"/>
    <line x1="14" y1="2" x2="2" y2="14"/>
  </svg>
)

const FONT_SIZES: { key: FontSize; label: string }[] = [
  { key: 'small',  label: 'A' },
  { key: 'medium', label: 'A' },
  { key: 'large',  label: 'A' },
]

export default function SettingsModal({ theme, accent, fontSize, onTheme, onAccent, onFontSize, onClose, onSnowstorm, snowing, onDisco, discoing }: Props) {
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="modal__header">
          <h2 className="modal__title" id="settings-title">Settings</h2>
          <button className="modal__close" onClick={onClose} aria-label="Close settings">
            <IconX />
          </button>
        </div>

        <div className="settings-modal__body">
          <section className="settings-section">
            <div className="settings-section__label">Appearance</div>
            <div className="settings-row">
              <span className="settings-row__label">Theme</span>
              <div className="theme-btns">
                <button
                  className={`theme-btn${theme === 'light' ? ' theme-btn--active' : ''}`}
                  onClick={() => onTheme('light')}
                  aria-pressed={theme === 'light'}
                >
                  ☀ Light
                </button>
                <button
                  className={`theme-btn${theme === 'dark' ? ' theme-btn--active' : ''}`}
                  onClick={() => onTheme('dark')}
                  aria-pressed={theme === 'dark'}
                >
                  🌙 Dark
                </button>
              </div>
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section__label">Accent Color</div>
            <div className="settings-row">
              <span className="settings-row__label">Color</span>
              <div className="accent-swatches">
                {ACCENT_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    className={`accent-swatch${accent === preset.name ? ' accent-swatch--active' : ''}`}
                    style={{ '--swatch-color': preset.hex } as React.CSSProperties}
                    onClick={() => onAccent(preset.name)}
                    aria-label={`${preset.name} accent`}
                    aria-pressed={accent === preset.name}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section__label">Text Size</div>
            <div className="settings-row">
              <span className="settings-row__label">Font Size</span>
              <div className="font-size-btns">
                {FONT_SIZES.map(({ key }) => (
                  <button
                    key={key}
                    className={`font-size-btn font-size-btn--${key}${fontSize === key ? ' font-size-btn--active' : ''}`}
                    onClick={() => onFontSize(key)}
                    aria-label={`${key} font size`}
                    aria-pressed={fontSize === key}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="settings-divider" />

          <section className="settings-section">
            <div className="settings-section__label">Easter Egg</div>
            <div className="easter-egg-btns">
              <button
                className="snowstorm-btn"
                onClick={onSnowstorm}
                disabled={snowing || discoing}
              >
                {snowing ? '❄ Snowing...' : '❄ Snowstorm'}
              </button>
              <button
                className="disco-btn"
                onClick={onDisco}
                disabled={discoing || snowing}
              >
                {discoing ? '🪩 Grooving...' : '🪩 Disco'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
