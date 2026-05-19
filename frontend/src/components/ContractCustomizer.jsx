const FONTS = [
  { label: 'Georgia',          value: 'Georgia, serif' },
  { label: 'Inter',            value: 'Inter, sans-serif' },
  { label: 'Times New Roman',  value: '"Times New Roman", serif' },
  { label: 'Arial',            value: 'Arial, sans-serif' },
  { label: 'Garamond',         value: 'Garamond, serif' },
];

const THEMES = [
  { label: '⬜ White', bg: '#ffffff', color: '#1a1a1a', border: '#e2e8f0', name: 'white' },
  { label: '🟨 Cream', bg: '#fffef5', color: '#1a1a1a', border: '#e8e0c8', name: 'cream' },
  { label: '🌙 Dark',  bg: '#1e293b', color: '#e2e8f0', border: '#334155', name: 'dark'  },
  { label: '🔵 Blue',  bg: '#f0f7ff', color: '#0f172a', border: '#bfdbfe', name: 'blue'  },
  { label: '🟢 Mint',  bg: '#f0fdf9', color: '#0f172a', border: '#a7f3d0', name: 'mint'  },
];

const SIZES    = [{ label: 'Small', value: 12 }, { label: 'Medium', value: 14 }, { label: 'Large', value: 16 }];
const SPACINGS = [{ label: 'Compact', value: 1.4 }, { label: 'Normal', value: 1.8 }, { label: 'Relaxed', value: 2.2 }];

const ContractCustomizer = ({ style, onChange, contractType = 'other' }) => {
  const [open, setOpen] = useState(false);

  const autoStyle = () => {
    const presets = {
      web_development:    { font: 'Inter, sans-serif',             theme: 'white', themeBg: '#ffffff', themeColor: '#1a1a1a', themeBorder: '#e2e8f0', size: 14, spacing: 1.8 },
      design:             { font: 'Garamond, serif',               theme: 'cream', themeBg: '#fffef5', themeColor: '#1a1a1a', themeBorder: '#e8e0c8', size: 14, spacing: 2.0 },
      consulting:         { font: '"Times New Roman", serif',      theme: 'white', themeBg: '#ffffff', themeColor: '#1a1a1a', themeBorder: '#e2e8f0', size: 13, spacing: 1.6 },
      content_writing:    { font: 'Georgia, serif',                theme: 'cream', themeBg: '#fffef5', themeColor: '#1a1a1a', themeBorder: '#e8e0c8', size: 14, spacing: 1.8 },
      mobile_development: { font: 'Inter, sans-serif',             theme: 'blue',  themeBg: '#f0f7ff', themeColor: '#0f172a', themeBorder: '#bfdbfe', size: 14, spacing: 1.8 },
      other:              { font: 'Georgia, serif',                theme: 'white', themeBg: '#ffffff', themeColor: '#1a1a1a', themeBorder: '#e2e8f0', size: 14, spacing: 1.8 },
    };
    onChange(presets[contractType] || presets.other);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: open ? 16 : 0 }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', color: '#64748b', fontWeight: 500 }}>
          🎨 {open ? 'Hide' : 'Customize'} Style
        </button>
        <button type="button" onClick={autoStyle}
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
          ✨ Auto Style
        </button>
      </div>

      {open && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Font Family</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FONTS.map(f => (
                <button key={f.value} type="button" onClick={() => onChange({ ...style, font: f.value })}
                  style={{ padding: '7px 12px', borderRadius: 6, border: `1px solid ${style.font === f.value ? '#6366f1' : '#e2e8f0'}`, background: style.font === f.value ? '#eef2ff' : 'transparent', cursor: 'pointer', fontSize: 13, textAlign: 'left', fontFamily: f.value, color: style.font === f.value ? '#4f46e5' : '#64748b' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color Theme</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {THEMES.map(t => (
                  <button key={t.name} type="button" onClick={() => onChange({ ...style, theme: t.name, themeBg: t.bg, themeColor: t.color, themeBorder: t.border })}
                    style={{ padding: '6px 10px', borderRadius: 6, border: `2px solid ${style.theme === t.name ? '#6366f1' : t.border}`, background: t.bg, cursor: 'pointer', fontSize: 12, color: t.color }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Font Size</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {SIZES.map(s => (
                  <button key={s.value} type="button" onClick={() => onChange({ ...style, size: s.value })}
                    style={{ flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${style.size === s.value ? '#6366f1' : '#e2e8f0'}`, background: style.size === s.value ? '#eef2ff' : 'transparent', cursor: 'pointer', fontSize: 12, color: style.size === s.value ? '#4f46e5' : '#64748b' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Line Spacing</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {SPACINGS.map(s => (
                  <button key={s.value} type="button" onClick={() => onChange({ ...style, spacing: s.value })}
                    style={{ flex: 1, padding: '6px', borderRadius: 6, border: `1px solid ${style.spacing === s.value ? '#6366f1' : '#e2e8f0'}`, background: style.spacing === s.value ? '#eef2ff' : 'transparent', cursor: 'pointer', fontSize: 12, color: style.spacing === s.value ? '#4f46e5' : '#64748b' }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractCustomizer;