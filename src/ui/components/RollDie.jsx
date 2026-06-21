export default function RollDie({ rolling, value, onRoll }) {
  return (
    <div className="roll-die">
      <div className={rolling ? 'die-face rolling' : 'die-face'}>{value || '-'}</div>
      <button type="button" onClick={onRoll} disabled={rolling}>Roll</button>
    </div>
  );
}
