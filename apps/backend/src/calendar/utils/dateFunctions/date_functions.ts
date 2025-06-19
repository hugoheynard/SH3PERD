export const invalidNumber = (number: number): boolean => {
  return number < 0;
};

export const substractMinutes = (date: Date, minutes: number): Date => {
  if (invalidNumber(minutes)) {
    throw new Error('Minutes must be >= 0');
  }
  return new Date(date.getTime() - minutes * 60 * 1000);
};

export const addMinutes = (date: Date, minutes: number): Date => {
  if (invalidNumber(minutes)) {
    throw new Error('Minutes must be >= 0');
  }
  return new Date(date.getTime() + minutes * 60 * 1000);
};

export const startOfDay = (date: Date): Date => {
  return new Date(date.setHours(0, 0, 0, 0));
};

export const endOfDay = (date: Date): Date => {
  const ONE_DAY_IN_MINS = 24 * 60;

  return addMinutes(startOfDay(date), ONE_DAY_IN_MINS);
};
