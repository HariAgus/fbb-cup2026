/**
 * Date and Deadline utility functions for FBB Cup 2026
 */

export const formatDeadlineDisplay = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';

  const optionsDate = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  const dateStr = d.toLocaleDateString('id-ID', optionsDate);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${dateStr} pukul ${hours}:${minutes} WIB`;
};

export const getDeadlineTimeRemaining = (isoString) => {
  if (!isoString) return { isExpired: false, text: '', diffMs: 0 };
  const target = new Date(isoString).getTime();
  if (isNaN(target)) return { isExpired: false, text: '', diffMs: 0 };

  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    const elapsedMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    if (elapsedMinutes < 60) {
      return { isExpired: true, text: `Telah berakhir ${elapsedMinutes || 1} menit yang lalu`, diffMs };
    }
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    const remainingMins = elapsedMinutes % 60;
    if (elapsedHours < 24) {
      return {
        isExpired: true,
        text: `Telah berakhir ${elapsedHours} jam ${remainingMins > 0 ? `${remainingMins} mnt ` : ''}yang lalu`,
        diffMs
      };
    }
    const elapsedDays = Math.floor(elapsedHours / 24);
    return { isExpired: true, text: `Telah berakhir ${elapsedDays} hari yang lalu`, diffMs };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  if (totalMinutes < 60) {
    return { isExpired: false, text: `Sisa ${totalMinutes} menit lagi`, diffMs };
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) {
    return {
      isExpired: false,
      text: `Sisa ${hours} jam ${minutes > 0 ? `${minutes} mnt ` : ''}lagi`,
      diffMs
    };
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return {
    isExpired: false,
    text: `Sisa ${days} hari ${remHours > 0 ? `${remHours} jam ` : ''}lagi`,
    diffMs
  };
};
