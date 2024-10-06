interface ILegendItemProps {
  color: string;
  label: string;
}

const LegendItem: React.FC<ILegendItemProps> = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div
      style={{
        width: '20px',
        height: '20px',
        backgroundColor: color,
        borderRadius: '50%',
      }}
    />
    {label}
  </div>
);

export default LegendItem;
