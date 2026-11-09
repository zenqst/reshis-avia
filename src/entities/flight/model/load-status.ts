export function getLoadStatus(loadFactor: number, desired: number, seats: number) {
  if (desired >= seats) return { color: 'red', label: 'Все места заняты' };
  if (loadFactor < 50) return { color: 'red', label: 'Низкая загрузка: менее 50%' };
  if (loadFactor < 75) return { color: 'yellow', label: 'Загрузка ниже 75%' };
  if (loadFactor >= 90) return { color: 'yellow', label: 'Осталось мало мест' };
  return { color: 'green', label: 'Загрузка от 75% до 90%' };
}
