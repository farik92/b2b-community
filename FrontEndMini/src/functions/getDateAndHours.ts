import moment from "moment";
import "moment-timezone";

export const getDateAndHours = (dateISO: string) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = moment.utc(dateISO).tz(userTimeZone).format("HH:mm");
  const localDate = moment.utc(dateISO).tz(userTimeZone).format("DD.MM.YY");

  return `${localDate} в ${localTime}`;
};
