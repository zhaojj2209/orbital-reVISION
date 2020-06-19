import { format } from "date-fns";

export const formatTime = (date) => format(date, "h:mm a");

export const formatDate = (date) => format(date, "iiii, dd MMM");

export const formatDateString = (date) => format(date, "yyyy-mm-dd");

export const newRoundedDate = () => {
  const coeff = 1000 * 60 * 5;
  const date = new Date();
  return new Date(Math.round(date.getTime() / coeff) * coeff);
};
