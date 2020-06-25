import { format } from "date-fns";

export const formatTime = (date) => format(date, "h:mm a");

export const formatDate = (date) => format(date, "iiii, dd MMM");

export const formatDateString = (date) => format(date, "yyyy-MM-dd");

export const newRoundedDate = () => {
  const coeff = getMinutes(5);
  const date = new Date();
  return new Date(Math.round(date.getTime() / coeff) * coeff);
};

export const formatDateObject = (date) => {
  return {
    dateString: formatDateString(date),
    day: date.getDate(),
    month: date.getMonth() + 1,
    timestamp: date.getTime(),
    year: date.getFullYear(),
  };
};

export const getMinutes = (mins) => mins * 60 * 1000;

export const getHours = (hrs) => hrs * getMinutes(60);

export const getDays = (days) => days * getHours(24);
