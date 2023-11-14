import * as moment from 'moment';

export class DateUtils {

  public static ISOFormat = 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'; 
  public static getTodayRange(): { startDate: moment.Moment, endDate: moment.Moment } {
    const now = moment().utcOffset('+07:00');
    return {
      startDate: now.startOf('day').clone(),
      endDate: now.endOf('day').clone(),
    };
  }

  public static isFormatValid(date: string, format: string): boolean {
    return moment(date, format, true).isValid();
  }
}